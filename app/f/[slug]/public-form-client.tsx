// app/f/[slug]/public-form-client.tsx
"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

type Props = { slug: string; showBranding?: boolean };

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
      setError(t.errors.required);
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
        if (data?.error === "rate_limited") {
          throw new Error(t.errors.rateLimited);
        }
        throw new Error(t.errors.generic);
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
      <section className="card" style={{ borderColor: "var(--color-success-300)", background: "var(--color-success-50)" }}>
        <p className="font-medium" style={{ color: "var(--color-success-700)" }}>{t.publicForm.thankYou}</p>
        <p className="text-sm" style={{ color: "var(--color-success-600)" }}>{t.publicForm.thankYouMessage}</p>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="email" style={{ color: "var(--color-neutral-700)" }}>
          {t.publicForm.emailLabel} ({t.common.optional})
        </label>
        <input
          id="email"
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          placeholder={t.publicForm.emailPlaceholder}
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="message" style={{ color: "var(--color-neutral-700)" }}>
          {t.publicForm.messageLabel} <span style={{ color: "var(--color-error-500)" }}>*</span>
        </label>
        <textarea
          id="message"
          className="input min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={submitting}
          placeholder={t.publicForm.messagePlaceholder}
          required
        />
      </div>

      {error ? <p className="text-sm" style={{ color: "var(--color-error-500)" }}>{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary"
      >
        {submitting ? t.publicForm.submitting : t.publicForm.submit}
      </button>
    </form>
  );
}
