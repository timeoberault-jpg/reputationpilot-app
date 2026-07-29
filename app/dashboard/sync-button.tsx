"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SyncButton() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    await fetch("/api/reviews/sync", { method: "POST" });
    setSyncing(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-60"
    >
      {syncing ? "Syncing…" : "Sync now"}
    </button>
  );
}
