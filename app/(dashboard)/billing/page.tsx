// app/(dashboard)/billing/page.tsx
"use client";

export default function BillingPage() {
  async function subscribe() {
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Billing</h1>

      <button
        onClick={subscribe}
        className="rounded-md bg-black px-4 py-2 text-sm text-white"
      >
        Subscribe
      </button>
    </div>
  );
}
