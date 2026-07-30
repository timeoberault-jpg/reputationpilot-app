import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";
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

  const { data: snapshots } = await supabase
    .from("snapshots")
    .select()
    .eq("business_id", business.id)
    .order("captured_at", { ascending: false })
    .limit(30);

  const latest = snapshots?.[0] ?? null;
  const previous = snapshots?.[1] ?? null;

  const newReviews =
    latest?.review_count != null && previous?.review_count != null
      ? latest.review_count - previous.review_count
      : null;

  const ratingChange =
    latest?.rating != null && previous?.rating != null
      ? Number((latest.rating - previous.rating).toFixed(2))
      : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-medium">{business.name}</h1>
        <div className="flex items-center gap-3">
          <SyncButton />
          <a
            href="/dashboard/compose"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Write a reply
          </a>
          <a
            href="/dashboard/billing"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Billing
          </a>
          <LogoutButton />
        </div>
      </div>

      {latest === null ? (
        <p className="rounded-md bg-gray-50 p-4 text-sm text-gray-600">
          No data yet. Click &ldquo;Sync now&rdquo; to take your first reading.
        </p>
      ) : (
        <>
          {(newReviews ?? 0) > 0 && (
            <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-900">
                {newReviews} new review{newReviews! > 1 ? "s" : ""} since your
                last check
                {ratingChange !== null && ratingChange < 0
                  ? " — and your rating went down."
                  : "."}
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Open your Google listing to read it, then{" "}
                <a href="/dashboard/compose" className="underline">
                  draft a reply
                </a>
                .
              </p>
            </div>
          )}

          <div className="mb-8 grid grid-cols-3 gap-3">
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Current rating</p>
              <p className="text-2xl font-medium">
                {latest.rating ?? "—"}
                <span className="text-base text-gray-400"> / 5</span>
              </p>
              {ratingChange !== null && ratingChange !== 0 && (
                <p
                  className={`text-xs ${
                    ratingChange > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {ratingChange > 0 ? "+" : ""}
                  {ratingChange} since last check
                </p>
              )}
            </div>
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Total reviews</p>
              <p className="text-2xl font-medium">
                {latest.review_count ?? "—"}
              </p>
              {newReviews !== null && newReviews !== 0 && (
                <p className="text-xs text-gray-500">
                  {newReviews > 0 ? "+" : ""}
                  {newReviews} since last check
                </p>
              )}
            </div>
            <div className="rounded-md bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Last checked</p>
              <p className="text-sm font-medium">
                {new Date(latest.captured_at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <h2 className="mb-3 text-sm font-medium">History</h2>
          <div className="overflow-hidden rounded-md border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Rating</th>
                  <th className="px-4 py-2 font-medium">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {(snapshots ?? []).map((s) => (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="px-4 py-2 text-gray-600">
                      {new Date(s.captured_at).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2">{s.rating ?? "—"}</td>
                    <td className="px-4 py-2">{s.review_count ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
