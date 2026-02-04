// app/(dashboard)/billing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";

type SubStatus = "active" | "inactive";

export default function BillingPage() {
  const [status, setStatus] = useState<SubStatus>("inactive");
  const [loading, setLoading] = useState(true);

  async function refreshStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/status", { cache: "no-store" });
      const data = await res.json();
      setStatus(data?.status === "active" ? "active" : "inactive");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshStatus();
  }, []);

  async function subscribe() {
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json();
    if (data?.url) window.location.href = data.url;
  }

  function getStatusLabel() {
    if (loading) return t.common.loading;
    return status === "active" ? t.billing.starter : t.billing.free;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold" style={{ color: "var(--color-neutral-900)" }}>{t.billing.title}</h1>

      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>{t.billing.currentPlan}</div>
            <div className="text-lg font-medium" style={{ color: "var(--color-neutral-800)" }}>{getStatusLabel()}</div>
          </div>

          <button
            onClick={refreshStatus}
            disabled={loading}
            className="btn btn-tertiary btn-sm"
          >
            {loading ? "..." : "↻"}
          </button>
        </div>
      </div>

      {status !== "active" ? (
        <div className="card space-y-4">
          <div>
            <div className="font-medium" style={{ color: "var(--color-neutral-800)" }}>{t.billing.starter}</div>
            <div className="text-sm" style={{ color: "var(--color-neutral-600)" }}>
              {t.landing.pricing.starter.features.join(" · ")}
            </div>
          </div>
          <button
            onClick={subscribe}
            className="btn btn-primary"
          >
            {t.billing.upgrade}
          </button>
        </div>
      ) : (
        <div className="alert alert-success">
          <span style={{ color: "var(--color-success-500)" }}>✓</span>
          {t.billing.starter} - {t.integrations.backlog.enabled}
        </div>
      )}
    </div>
  );
}
