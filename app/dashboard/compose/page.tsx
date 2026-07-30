"use client";

import { useState } from "react";

export default function ComposePage() {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState("3");
  const [reviewText, setReviewText] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setCopied(false);

    const res = await fetch("/api/reviews/draft-reply", {
      method: "POST",
      body: JSON.stringify({ authorName, rating, reviewText }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Couldn't generate a reply. Try again.");
      return;
    }

    setDraft((await res.json()).draft);
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-10">
      <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800">
        ← Back to dashboard
      </a>

      <h1 className="mb-1 mt-4 text-xl font-medium">Write a reply</h1>
      <p className="mb-6 text-sm text-gray-500">
        Paste the review from your Google listing and get a reply written for
        you.
      </p>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Reviewer's first name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="h-10 flex-1 rounded-md border border-gray-300 px-3 text-sm"
          />
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="h-10 rounded-md border border-gray-300 px-3 text-sm"
          >
            <option value="1">1 star</option>
            <option value="2">2 stars</option>
            <option value="3">3 stars</option>
            <option value="4">4 stars</option>
            <option value="5">5 stars</option>
          </select>
        </div>

        <textarea
          placeholder="Paste the review text here…"
          rows={5}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          className="rounded-md border border-gray-300 p-3 text-sm"
        />

        <button
          onClick={generate}
          disabled={loading || !reviewText.trim()}
          className="h-10 rounded-md bg-brand text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Writing…" : "Write my reply"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      {draft && (
        <div className="mt-6">
          <p className="mb-2 text-sm font-medium">Suggested reply</p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={5}
            className="w-full rounded-md border border-gray-300 p-3 text-sm"
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={copyDraft}
              className="h-9 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark"
            >
              {copied ? "Copied!" : "Copy reply"}
            </button>
            <button
              onClick={generate}
              disabled={loading}
              className="h-9 rounded-md border border-gray-300 px-4 text-sm font-medium disabled:opacity-60"
            >
              Regenerate
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Paste this into your Google Business Profile to publish it.
          </p>
        </div>
      )}
    </main>
  );
}
