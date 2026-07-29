"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  author_name: string;
  rating: number;
  review_text: string | null;
  replied: boolean;
  ai_draft?: string | null;
};

export default function ReviewCard({ review }: { review: Review }) {
  const supabase = createClient();
  const [replied, setReplied] = useState(review.replied);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState(review.ai_draft ?? "");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleReplied() {
    setSaving(true);
    const { error } = await supabase
      .from("reviews")
      .update({ replied: !replied })
      .eq("id", review.id);

    setSaving(false);
    if (!error) setReplied(!replied);
  }

  async function generateDraft() {
    setGenerating(true);
    setError(null);
    setCopied(false);

    const res = await fetch("/api/reviews/draft-reply", {
      method: "POST",
      body: JSON.stringify({ reviewId: review.id }),
    });

    setGenerating(false);

    if (!res.ok) {
      setError("Couldn't generate a reply. Try again.");
      return;
    }

    const data = await res.json();
    setDraft(data.draft);
  }

  function openModal() {
    setModalOpen(true);
    if (!draft) generateDraft();
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative rounded-md border border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {review.author_name}
          <span className="ml-2 text-amber-500">
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - review.rating)}
          </span>
        </p>
        <span
          className={`rounded px-2 py-0.5 text-xs ${
            replied
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {replied ? "Replied" : "Needs reply"}
        </span>
      </div>

      {review.review_text && (
        <p className="mt-1.5 text-sm text-gray-600">{review.review_text}</p>
      )}

      <div className="mt-2 flex gap-2">
        {!replied && (
          <button
            onClick={openModal}
            className="h-7 rounded-md border border-gray-300 px-2.5 text-xs font-medium"
          >
            Draft reply with AI
          </button>
        )}
        <button
          onClick={toggleReplied}
          disabled={saving}
          className="h-7 rounded-md border border-gray-300 px-2.5 text-xs font-medium disabled:opacity-60"
        >
          {replied ? "Mark as needs reply" : "Mark as replied"}
        </button>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 left-0 top-0 z-10 flex min-h-screen w-screen items-center justify-center bg-black/40"
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-md bg-white p-5"
          >
            <p className="mb-2 text-sm font-medium">
              Reply to {review.author_name}
            </p>

            {generating ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Writing a draft…
              </p>
            ) : (
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-gray-300 p-2 text-sm"
              />
            )}

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

            <div className="mt-3 flex justify-between">
              <button
                onClick={generateDraft}
                disabled={generating}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                Regenerate
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="h-8 rounded-md border border-gray-300 px-3 text-xs font-medium"
                >
                  Close
                </button>
                <button
                  onClick={copyDraft}
                  disabled={generating || !draft}
                  className="h-8 rounded-md bg-brand px-3 text-xs font-medium text-white disabled:opacity-60"
                >
                  {copied ? "Copied!" : "Copy reply"}
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Paste this into your Google Business Profile to publish it,
              then mark this review as replied.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
