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

  const { authorName, rating, reviewText } = await request.json();

  if (!reviewText || typeof reviewText !== "string") {
    return NextResponse.json({ error: "Review text is required" }, { status: 400 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("user_id", user.id)
    .single();

  let draft: string;
  try {
    draft = await draftReviewReply({
      businessName: business?.name ?? "the business",
      authorName: authorName || "there",
      rating: Number(rating) || 3,
      reviewText,
    });
  } catch (err: any) {
    // On renvoie le message réel pour pouvoir diagnostiquer.
    const detail =
      err?.error?.error?.message || err?.message || "Unknown error";
    return NextResponse.json(
      { error: `AI error: ${detail}` },
      { status: 502 }
    );
  }

  return NextResponse.json({ draft });
}
