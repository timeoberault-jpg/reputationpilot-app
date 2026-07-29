import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { fetchPlaceReviews } from "@/lib/google/places";
import { sendNewReviewAlert } from "@/lib/resend/client";

// Vercel Cron appelle cette route en GET avec un header
// "Authorization: Bearer <CRON_SECRET>" généré automatiquement par Vercel.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, place_id, name, user_id");

  let newReviewsCount = 0;

  for (const business of businesses ?? []) {
    try {
      const details = await fetchPlaceReviews(business.place_id);
      if (details.reviews.length === 0) continue;

      // On ne garde que les avis pas encore en base, pour ne pas
      // renvoyer une alerte pour un avis déjà connu.
      const { data: existing } = await supabase
        .from("reviews")
        .select("google_review_id")
        .eq("business_id", business.id);

      const existingIds = new Set((existing ?? []).map((r) => r.google_review_id));
      const newReviews = details.reviews.filter(
        (r) => !existingIds.has(r.google_review_id)
      );

      if (newReviews.length === 0) continue;

      await supabase.from("reviews").upsert(
        newReviews.map((r) => ({
          business_id: business.id,
          google_review_id: r.google_review_id,
          author_name: r.author_name,
          rating: r.rating,
          review_text: r.review_text,
          review_time: r.review_time,
        })),
        { onConflict: "business_id,google_review_id", ignoreDuplicates: true }
      );

      const { data: userData } = await supabase.auth.admin.getUserById(
        business.user_id
      );
      const ownerEmail = userData?.user?.email;

      if (ownerEmail) {
        for (const review of newReviews) {
          await sendNewReviewAlert({
            to: ownerEmail,
            businessName: business.name,
            authorName: review.author_name,
            rating: review.rating,
            reviewText: review.review_text,
            dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
          });
          newReviewsCount++;
        }
      }
    } catch {
      // On continue avec les autres commerces même si un appel échoue
      // (ex : quota Places API dépassé pour ce lieu précis).
      continue;
    }
  }

  return NextResponse.json({ businessesChecked: businesses?.length ?? 0, newReviewsCount });
}
