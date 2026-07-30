import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { fetchPlaceReviews } from "@/lib/google/places";
import { sendRatingAlert } from "@/lib/resend/client";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, place_id, name, user_id");

  let alertsSent = 0;

  for (const business of businesses ?? []) {
    try {
      const details = await fetchPlaceReviews(business.place_id);

      const { data: previous } = await supabase
        .from("snapshots")
        .select("rating, review_count")
        .eq("business_id", business.id)
        .order("captured_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      await supabase.from("snapshots").insert({
        business_id: business.id,
        rating: details.rating,
        review_count: details.userRatingCount,
      });

      // Premier relevé : rien à comparer, on n'alerte pas.
      if (
        previous?.review_count == null ||
        details.userRatingCount == null
      ) {
        continue;
      }

      const newReviews = details.userRatingCount - previous.review_count;
      if (newReviews <= 0) continue;

      const ratingChange =
        previous.rating != null && details.rating != null
          ? Number((details.rating - previous.rating).toFixed(2))
          : 0;

      const { data: userData } = await supabase.auth.admin.getUserById(
        business.user_id
      );
      const ownerEmail = userData?.user?.email;

      if (ownerEmail) {
        await sendRatingAlert({
          to: ownerEmail,
          businessName: business.name,
          newReviews,
          rating: details.rating,
          ratingChange,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
        });
        alertsSent++;
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json({
    businessesChecked: businesses?.length ?? 0,
    alertsSent,
  });
}
