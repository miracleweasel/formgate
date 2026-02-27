// app/login/LoginClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { t } from "@/lib/i18n";

export default function LoginClient() {
  const sp = useSearchParams();

  const errorParam = useMemo(() => sp.get("error"), [sp]);

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "invalid_link" ? t.auth.invalidLink :
    errorParam === "expired" ? t.auth.expiredLink :
    null
  );
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errorKey = data?.error;
        if (errorKey === "rate_limited") {
          setError(t.errors.rateLimited);
        } else {
          setError(t.errors.generic);
        }
        return;
      }

      setSent(true);
    } catch {
      setError(t.errors.network);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="public-form-container"
      style={{ background: "linear-gradient(145deg, #f8faff 0%, var(--color-neutral-100) 100%)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
            {t.common.appName}
          </Link>
        </div>

        {/* Card */}
        <div className="card card-elevated animate-scale-in" style={{ padding: "var(--space-10)" }}>
          {sent ? (
            /* Email sent confirmation */
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "var(--color-primary-50)" }}>
                <svg className="w-8 h-8" style={{ color: "var(--color-primary-600)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold" style={{ color: "var(--color-neutral-900)" }}>
                {t.auth.checkEmail}
              </h1>
              <p className="text-sm" style={{ color: "var(--color-neutral-500)", lineHeight: "1.6" }}>
                {t.auth.checkEmailHint}
              </p>
              <button
                type="button"
                className="btn btn-ghost text-sm mt-4"
                onClick={() => { setSent(false); setEmail(""); }}
              >
                {t.common.back}
              </button>
            </div>
          ) : (
            /* Login form */
            <>
              <h1 className="text-xl font-semibold" style={{ color: "var(--color-neutral-900)" }}>
                {t.auth.loginTitle}
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--color-neutral-500)" }}>
                {t.auth.loginSubtitle}
              </p>

              <form className="mt-8 space-y-6" onSubmit={onSubmit}>
                <div className="form-field">
                  <label className="form-label" htmlFor="email">
                    {t.auth.email}
                  </label>
                  <input
                    id="email"
                    className="input"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={busy}
                  />
                </div>

                {error && (
                  <div className="alert alert-error">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-full"
                  disabled={busy}
                >
                  {busy ? t.auth.sendingLink : t.auth.sendLink}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm transition-colors"
            style={{ color: "var(--color-neutral-500)" }}
          >
            ← {t.common.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
