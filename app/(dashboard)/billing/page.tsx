// app/(dashboard)/billing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

type BillingData = {
  status: "active" | "inactive";
  plan: string;
  usage: { forms: number; submissionsThisMonth: number } | null;
  limits: { maxForms: number | null; maxSubmissionsPerMonth: number | null } | null;
};

const PLANS = [
  {
    id: "free",
    name: t.billing.free,
    price: t.landing.pricing.free.price,
    features: t.landing.pricing.free.features,
    highlight: false,
  },
  {
    id: "starter",
    name: t.billing.starter,
    price: t.landing.pricing.starter.price,
    features: t.landing.pricing.starter.features,
    highlight: true,
  },
  {
    id: "pro",
    name: t.billing.pro,
    price: t.landing.pricing.pro.price,
    features: t.landing.pricing.pro.features,
    highlight: false,
  },
] as const;

function UsageBar({ label, used, max }: { label: string; used: number; max: number | null }) {
  const percent = max ? Math.min((used / max) * 100, 100) : 0;
  const isHigh = max ? percent >= 80 : false;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span style={{ color: "var(--color-neutral-600)" }}>{label}</span>
        <span style={{ color: isHigh ? "var(--color-error-600)" : "var(--color-neutral-700)" }} className="font-medium">
          {used} / {max ?? t.billing.unlimited}
        </span>
      </div>
      {max !== null && (
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "var(--color-neutral-100)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${percent}%`,
              background: isHigh ? "var(--color-error-500)" : "var(--color-accent-500)",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function refreshStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/status", { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshStatus();
  }, []);

  async function subscribe() {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const json = await res.json();
      if (res.status === 503) {
        setCheckoutError(t.billing.billingNotConfigured);
        return;
      }
      if (json?.url) window.location.href = json.url;
    } catch {
      setCheckoutError(t.errors.network);
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function manageSubscription() {
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const json = await res.json();
      if (json?.url) window.location.href = json.url;
    } catch {
      // silent fail
    }
  }

  const currentPlan = data?.plan ?? "free";
  const isActive = data?.status === "active";

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-8">
      <div className="page-header">
        <h1 className="page-header-title">
          {t.billing.title}
        </h1>
        <button
          onClick={refreshStatus}
          disabled={loading}
          className="btn btn-tertiary btn-sm"
        >
          {loading ? "..." : "↻"}
        </button>
      </div>

      {/* Usage */}
      {data?.usage && data?.limits && (
        <div className="card space-y-5">
          <h2 className="font-medium" style={{ color: "var(--color-neutral-800)" }}>
            {t.billing.usage}
          </h2>
          <UsageBar
            label={t.billing.formsUsed}
            used={data.usage.forms}
            max={data.limits.maxForms}
          />
          <UsageBar
            label={t.billing.submissionsUsed}
            used={data.usage.submissionsThisMonth}
            max={data.limits.maxSubmissionsPerMonth}
          />
        </div>
      )}

      {/* Plan Comparison */}
      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className="card relative"
              style={{
                padding: "var(--space-10)",
                ...(plan.highlight
                  ? { border: "2px solid var(--color-accent-500)" }
                  : isCurrent
                    ? { border: "2px solid var(--color-success-500)" }
                    : {}),
              }}
            >
              {isCurrent && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 text-xs font-medium rounded-full"
                  style={{
                    background: "var(--color-success-500)",
                    color: "white",
                  }}
                >
                  {t.billing.currentPlan}
                </div>
              )}
              <h3 className="font-semibold text-lg" style={{ color: "var(--color-neutral-800)" }}>
                {plan.name}
              </h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold" style={{ color: "var(--color-neutral-900)" }}>
                  {plan.price}
                </span>
                <span className="text-sm ml-1" style={{ color: "var(--color-neutral-500)" }}>
                  {t.billing.perMonth}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--color-neutral-600)" }}>
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--color-success-500)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent && isActive ? (
                <button onClick={manageSubscription} className="btn btn-secondary w-full">
                  {t.billing.manageSubscription}
                </button>
              ) : !isCurrent && plan.id !== "free" && !isActive ? (
                <button
                  onClick={subscribe}
                  disabled={checkoutLoading}
                  className="btn btn-primary w-full"
                >
                  {checkoutLoading ? "..." : t.billing.upgrade}
                </button>
              ) : null}
            </div>
          );
        })}
      </div>

      {checkoutError && (
        <div className="alert alert-error text-sm">
          {checkoutError}
        </div>
      )}
    </div>
  );
}
