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

  const details = await fetchPlaceReviews(business.place_id);

  if (details.reviews.length > 0) {
    const { error } = await supabase.from("reviews").upsert(
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ synced: details.reviews.length });
}
