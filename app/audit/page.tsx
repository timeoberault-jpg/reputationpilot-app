"use client";

import { useState } from "react";

type SearchResult = { id: string; displayName: string; address: string };
type Report = {
  name: string;
  rating: number | null;
  reviewCount: number | null;
  score: number;
  recentReviews: { author_name: string; rating: number; review_text: string | null }[];
};

export default function AuditPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReport(null);
    const res = await fetch("/api/audit/search", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
    setLoading(false);
    if (res.ok) {
      setResults((await res.json()).results);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Search failed. Please try again.");
    }
  }

  async function handleSelect(placeId: string) {
    setLoading(true);
    setError(null);
    setResults([]);
    const res = await fetch("/api/audit/report", {
      method: "POST",
      body: JSON.stringify({ placeId }),
    });
    setLoading(false);
    if (res.ok) {
      setReport(await res.json());
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Could not load this business.");
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 style={{ fontFamily: "serif" }} className="mb-2 text-3xl text-[#14231D]">
        Free reputation audit
      </h1>
      <p className="mb-8 text-[#6B6F6A]">
        See your Google rating, review count, and reputation score in 10 seconds. No signup required.
      </p>

      {!report && (
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            type="text"
            required
            placeholder="Your business name and city"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 flex-1 rounded-md border border-gray-300 px-3 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-md bg-[#0F6E56] px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "…" : "Check my score"}
          </button>
        </form>
      )}

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {results.map((r) => (
          <button
            key={r.id}
            onClick={() => handleSelect(r.id)}
            className="rounded-md border border-gray-200 px-4 py-3 text-left hover:bg-gray-50"
          >
            <p className="text-sm font-medium">{r.displayName}</p>
            <p className="text-xs text-gray-500">{r.address}</p>
          </button>
        ))}
      </div>

      {report && (
        <div>
          <div className="mb-6 rounded-lg border border-gray-200 p-6 text-center">
            <p className="text-sm text-gray-500">{report.name}</p>
            <p className="mt-2 text-5xl font-medium text-[#0F6E56]">{report.score}</p>
            <p className="text-sm text-gray-500">reputation score / 100</p>
            <p className="mt-3 text-sm text-gray-600">
              {report.rating ?? "—"}★ average · {report.reviewCount ?? 0} reviews on Google
            </p>
          </div>

          {report.recentReviews.length > 0 && (
            <div className="mb-6 flex flex-col gap-2">
              <p className="text-sm font-medium text-[#14231D]">Your most recent reviews</p>
              {report.recentReviews.map((r, i) => (
                <div key={i} className="rounded-md border border-gray-200 px-4 py-3">
                  <p className="text-sm font-medium">
                    {r.author_name} — {"★".repeat(r.rating)}
                  </p>
                  {r.review_text && <p className="mt-1 text-sm text-gray-600">{r.review_text}</p>}
                </div>
              ))}
            </div>
          )}

          <a
            href="/signup"
            className="block rounded-md bg-[#0F6E56] px-4 py-3 text-center text-sm font-medium text-white hover:bg-[#085041]"
          >
            Get alerted and reply faster — start free trial
          </a>
        </div>
      )}
    </main>
  );
}
