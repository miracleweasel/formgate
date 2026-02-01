// app/(dashboard)/billing/page.tsx
"use client";

import { useEffect, useState } from "react";

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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Billing</h1>

      <div className="rounded-md border p-3 text-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Status</div>
            <div className="text-gray-600">
              {loading ? "Loading…" : status === "active" ? "Active" : "Inactive"}
            </div>
          </div>

          <button
            onClick={refreshStatus}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {status !== "active" ? (
        <button
          onClick={subscribe}
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Subscribe
        </button>
      ) : (
        <div className="text-sm text-gray-600">✅ Subscription active.</div>
      )}
    </div>
  );
}
