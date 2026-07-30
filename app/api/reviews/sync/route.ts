import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchPlaceReviews } from "@/lib/google/places";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select()
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return NextResponse.json({ error: "No business connected" }, { status: 404 });
  }

  let details;
  try {
    details = await fetchPlaceReviews(business.place_id);
  } catch (err) {
    return NextResponse.json(
      { error: "Could not reach Google. Try again shortly." },
      { status: 502 }
    );
  }

  // Dernier relevé connu, pour comparer avant d'enregistrer le nouveau.
  const { data: previous } = await supabase
    .from("snapshots")
    .select("rating, review_count")
    .eq("business_id", business.id)
    .order("captured_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: insertError } = await supabase.from("snapshots").insert({
    business_id: business.id,
    rating: details.rating,
    review_count: details.userRatingCount,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const newReviews =
    previous?.review_count != null && details.userRatingCount != null
      ? details.userRatingCount - previous.review_count
      : 0;

  const ratingChange =
    previous?.rating != null && details.rating != null
      ? Number((details.rating - previous.rating).toFixed(2))
      : 0;

  return NextResponse.json({
    rating: details.rating,
    reviewCount: details.userRatingCount,
    newReviews,
    ratingChange,
  });
}
