import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await request.json();
  if (plan !== "starter" && plan !== "pro") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: account } = await supabase
    .from("accounts")
    .select()
    .eq("user_id", user.id)
    .single();

  // Réutilise le customer Stripe existant s'il y en a déjà un (ex : après
  // une annulation), sinon Stripe Checkout en crée un nouveau automatiquement.
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: account?.stripe_customer_id ?? undefined,
    customer_email: account?.stripe_customer_id ? undefined : user.email,
    client_reference_id: user.id,
    line_items: [{ price: PRICE_IDS[plan as "starter" | "pro"], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    metadata: { user_id: user.id, plan },
  });

  return NextResponse.json({ url: session.url });
}
