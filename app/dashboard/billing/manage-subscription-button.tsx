"use client";

import { useState } from "react";

export default function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (data.url) window.location.href = data.url;
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="h-9 rounded-md border border-gray-300 px-4 text-sm font-medium disabled:opacity-60"
    >
      {loading ? "Loading…" : "Manage subscription"}
    </button>
  );
}
