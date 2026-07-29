import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
import ReviewCard from "./review-card";
import SyncButton from "./sync-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: account } = await supabase
    .from("accounts")
    .select()
    .eq("user_id", user.id)
    .single();

  const isPaid = account?.subscription_status === "active";
  const trialExpired =
    account?.trial_ends_at &&
    new Date(account.trial_ends_at).getTime() < Date.now();

  if (!isPaid && trialExpired) {
    redirect("/dashboard/billing");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select()
    .eq("user_id", user.id)
    .single();

  if (!business) {
    redirect("/dashboard/connect");
  }

  const { data: reviews } = await supabase
    .from("reviews")
    .select()
    .eq("business_id", business.id)
    .order("review_time", { ascending: false });

  const needsReplyCount = (reviews ?? []).filter((r) => !r.replied).length;
  const averageRating = reviews?.length
    ? (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      ).toFixed(1)
    : "—";

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-medium">{business.name}</h1>
        <div className="flex items-center gap-3">
          <SyncButton />
          <a href="/dashboard/billing" className="text-sm text-gray-500 hover:text-gray-800">
            Billing
          </a>
          <LogoutButton />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Average rating</p>
          <p className="text-xl font-medium">{averageRating}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Total reviews</p>
          <p className="text-xl font-medium">{reviews?.length ?? 0}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs text-gray-500">Awaiting reply</p>
          <p className="text-xl font-medium text-red-600">
            {needsReplyCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {(reviews ?? []).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
        {(reviews ?? []).length === 0 && (
          <p className="text-sm text-gray-500">
            No reviews synced yet. Google only returns your 5 most recent
            reviews via this API.
          </p>
        )}
      </div>
    </main>
  );
}
