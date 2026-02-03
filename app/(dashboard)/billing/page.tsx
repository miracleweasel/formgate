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
      <h1 className="text-xl font-semibold">{t.billing.title}</h1>

      <div className="rounded-md border bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">{t.billing.currentPlan}</div>
            <div className="text-lg font-medium">{getStatusLabel()}</div>
          </div>

          <button
            onClick={refreshStatus}
            disabled={loading}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "..." : "↻"}
          </button>
        </div>
      </div>

      {status !== "active" ? (
        <div className="rounded-md border bg-white p-4 space-y-4">
          <div>
            <div className="font-medium">{t.billing.starter}</div>
            <div className="text-sm text-gray-600">
              {t.landing.pricing.starter.features.join(" · ")}
            </div>
          </div>
          <button
            onClick={subscribe}
            className="rounded-md bg-black px-4 py-2 text-sm text-white"
          >
            {t.billing.upgrade}
          </button>
        </div>
      ) : (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {t.billing.starter} - {t.integrations.backlog.enabled}
        </div>
      )}
    </div>
  );
}
