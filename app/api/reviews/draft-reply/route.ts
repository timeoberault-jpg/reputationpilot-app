import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { draftReviewReply } from "@/lib/anthropic/client";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId } = await request.json();

  // La policy RLS garantit que l'utilisateur ne peut lire que les avis
  // liés à son propre commerce.
  const { data: review } = await supabase
    .from("reviews")
    .select("*, businesses(name)")
    .eq("id", reviewId)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  let draft: string;
  try {
    draft = await draftReviewReply({
      businessName: (review as any).businesses.name,
      authorName: review.author_name,
      rating: review.rating,
      reviewText: review.review_text,
    });
  } catch {
    return NextResponse.json(
      { error: "AI generation failed. Please try again." },
      { status: 502 }
    );
  }

  await supabase
    .from("reviews")
    .update({ ai_draft: draft })
    .eq("id", reviewId);

  return NextResponse.json({ draft });
}
