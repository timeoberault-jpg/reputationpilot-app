import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchPlaceReviews } from "@/lib/google/places";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { placeId, name } = await request.json();

  const { data: business, error: insertError } = await supabase
    .from("businesses")
    .upsert(
      { user_id: user.id, place_id: placeId, name },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Première synchronisation immédiate pour que le dashboard ne soit pas vide
  try {
    const details = await fetchPlaceReviews(placeId);

    if (details.reviews.length > 0) {
      await supabase.from("reviews").upsert(
        details.reviews.map((r) => ({
          business_id: business.id,
          google_review_id: r.google_review_id,
          author_name: r.author_name,
          rating: r.rating,
          review_text: r.review_text,
          review_time: r.review_time,
        })),
        { onConflict: "business_id,google_review_id", ignoreDuplicates: true }
      );
    }
  } catch {
    // La connexion du commerce réussit même si la synchro initiale échoue ;
    // le dashboard proposera un bouton "Sync now" pour réessayer.
  }

  return NextResponse.json({ business });
}
