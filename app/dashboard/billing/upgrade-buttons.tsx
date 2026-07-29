"use client";

import { useState } from "react";

const PLANS = [
  { id: "starter", name: "Starter", price: "$19/mo", desc: "Google reviews, AI replies" },
  { id: "pro", name: "Pro", price: "$39/mo", desc: "+ Facebook, widget, stats" },
] as const;

export default function UpgradeButtons() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function subscribe(plan: string) {
    setLoadingPlan(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setLoadingPlan(null);
    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="flex flex-col gap-3">
      {PLANS.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium">
              {p.name} — {p.price}
            </p>
            <p className="text-xs text-gray-500">{p.desc}</p>
          </div>
          <button
            onClick={() => subscribe(p.id)}
            disabled={loadingPlan !== null}
            className="h-8 rounded-md bg-brand px-3 text-xs font-medium text-white disabled:opacity-60"
          >
            {loadingPlan === p.id ? "Redirecting…" : "Subscribe"}
          </button>
        </div>
      ))}
    </div>
  );
}
