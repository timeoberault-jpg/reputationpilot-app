import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UpgradeButtons from "./upgrade-buttons";
import ManageSubscriptionButton from "./manage-subscription-button";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("accounts")
    .select()
    .eq("user_id", user.id)
    .single();

  const isPaid = account?.subscription_status === "active";
  const trialEndsAt = account?.trial_ends_at
    ? new Date(account.trial_ends_at)
    : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(
        0,
        Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-1 text-xl font-medium">Billing</h1>

      {isPaid ? (
        <p className="mb-6 text-sm text-gray-500">
          You're on the <span className="font-medium">{account.plan}</span>{" "}
          plan.
        </p>
      ) : trialDaysLeft > 0 ? (
        <p className="mb-6 text-sm text-gray-500">
          Free trial — {trialDaysLeft} day{trialDaysLeft > 1 ? "s" : ""} left.
        </p>
      ) : (
        <p className="mb-6 text-sm text-red-600">
          Your free trial has ended. Subscribe to keep using ReputationPilot.
        </p>
      )}

      {isPaid ? <ManageSubscriptionButton /> : <UpgradeButtons />}
    </main>
  );
}
