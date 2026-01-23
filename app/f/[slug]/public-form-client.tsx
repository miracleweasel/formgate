// app/f/[slug]/public-form-client.tsx
"use client";

import { useState } from "react";

type Props = { slug: string };

export default function PublicFormClient({ slug }: Props) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const msg = message.trim();
    if (!msg) {
      setError("Message is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/forms/${encodeURIComponent(slug)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: {
            email: email.trim() ? email.trim() : null,
            message: msg,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Submit failed");
      }

      setDone(true);
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section className="rounded border p-4">
        <p className="font-medium">Merci.</p>
        <p className="text-sm text-neutral-600">Votre message a bien été envoyé.</p>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded border p-4">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="email">
          Email (optional)
        </label>
        <input
          id="email"
          className="w-full rounded border px-3 py-2"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="message">
          Message <span className="text-red-600">*</span>
        </label>
        <textarea
          id="message"
          className="w-full rounded border px-3 py-2 min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={submitting}
          required
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Submit"}
      </button>
    </form>
  );
}
