// app/login/LoginClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { t } from "@/lib/i18n";

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const next = useMemo(() => {
    const n = sp.get("next");
    return n && n.startsWith("/") ? n : "/forms";
  }, [sp]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Map API errors to localized messages
        const errorKey = data?.error;
        if (errorKey === "invalid credentials") {
          setError(t.errors.invalidCredentials);
        } else if (errorKey === "rate_limited") {
          setError(t.errors.rateLimited);
        } else {
          setError(t.errors.generic);
        }
        return;
      }

      router.replace(next);
    } catch {
      setError(t.errors.network);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="public-form-container">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
            {t.common.appName}
          </Link>
        </div>

        {/* Card */}
        <div className="card card-elevated animate-scale-in">
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-neutral-900)" }}>
            {t.auth.loginTitle}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-neutral-500)" }}>
            {t.auth.loginSubtitle}
          </p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
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

            <div className="form-field">
              <label className="form-label" htmlFor="password">
                {t.auth.password}
              </label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {busy ? t.auth.signingIn : t.auth.signIn}
            </button>
          </form>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
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
