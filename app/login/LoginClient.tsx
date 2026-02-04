// app/login/LoginClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    <div className="min-h-[calc(100vh-0px)] flex items-center justify-center p-6" style={{ background: "var(--color-neutral-50)" }}>
      <div className="card w-full max-w-sm">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-neutral-900)" }}>{t.auth.loginTitle}</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-neutral-600)" }}>{t.auth.loginSubtitle}</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>{t.auth.email}</label>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>{t.auth.password}</label>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error ? (
            <div className="alert alert-error">
              {error}
            </div>
          ) : null}

          <button
            className="btn btn-primary w-full"
            disabled={busy}
          >
            {busy ? t.auth.signingIn : t.auth.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}
