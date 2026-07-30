import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendRatingAlert } from "@/lib/resend/client";

/**
 * Envoie un email d'alerte d'exemple à l'utilisateur connecté.
 * Sert uniquement à vérifier que la configuration Resend fonctionne,
 * sans attendre le cron quotidien.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("user_id", user.id)
    .single();

  try {
    await sendRatingAlert({
      to: user.email,
      businessName: business?.name ?? "Your business",
      newReviews: 1,
      rating: 3.8,
      ratingChange: -0.1,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });
  } catch (err: any) {
    const detail =
      err?.message || err?.error?.message || "Unknown error";
    return NextResponse.json({ error: `Email error: ${detail}` }, { status: 502 });
  }

  return NextResponse.json({ sent: true, to: user.email });
}
