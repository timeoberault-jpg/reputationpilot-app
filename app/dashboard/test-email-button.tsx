"use client";

import { useState } from "react";

export default function TestEmailButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function sendTest() {
    setSending(true);
    setStatus(null);

    const res = await fetch("/api/test-email", { method: "POST" });
    const data = await res.json().catch(() => null);

    setSending(false);
    setStatus(
      res.ok
        ? `Test email sent to ${data?.to ?? "your inbox"}.`
        : data?.error ?? "Could not send the test email."
    );
  }

  return (
    <div className="mt-8 rounded-md border border-gray-200 p-4">
      <p className="text-sm font-medium">Email alerts</p>
      <p className="mb-3 text-sm text-gray-500">
        We check your listing once a day and email you when something changes.
        Send yourself a test to make sure it arrives.
      </p>
      <button
        onClick={sendTest}
        disabled={sending}
        className="h-9 rounded-md border border-gray-300 px-4 text-sm font-medium disabled:opacity-60"
      >
        {sending ? "Sending…" : "Send a test email"}
      </button>
      {status && <p className="mt-2 text-sm text-gray-600">{status}</p>}
    </div>
  );
}
