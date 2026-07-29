"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SearchResult = {
  id: string;
  displayName: string;
  address: string;
};

export default function ConnectBusinessPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    const res = await fetch("/api/places/search", {
      method: "POST",
      body: JSON.stringify({ query }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Search failed. Try a more specific business name and city.");
      return;
    }

    const data = await res.json();
    setResults(data.results);
  }

  async function handleConnect(result: SearchResult) {
    setSaving(true);
    setError(null);

    const res = await fetch("/api/business/connect", {
      method: "POST",
      body: JSON.stringify({ placeId: result.id, name: result.displayName }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Could not connect this business. Please try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <h1 className="mb-1 text-xl font-medium">Connect your business</h1>
      <p className="mb-6 text-sm text-gray-500">
        Search for your business exactly as it appears on Google Maps.
      </p>

      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          required
          placeholder="e.g. Blue Bottle Coffee, San Francisco"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 flex-1 rounded-md border border-gray-300 px-3 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-md bg-brand px-4 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-2">
        {results.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{r.displayName}</p>
              <p className="text-xs text-gray-500">{r.address}</p>
            </div>
            <button
              onClick={() => handleConnect(r)}
              disabled={saving}
              className="h-8 rounded-md border border-gray-300 px-3 text-xs font-medium disabled:opacity-60"
            >
              Connect
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
