// app/(dashboard)/forms/[id]/submissions/SubmissionsListClient.tsx
"use client";

import { useState } from "react";

type SubmissionRow = {
  id: string;
  created_at: string;
  payload: Record<string, unknown>;
};

function fmtDate(v: string) {
  try {
    return new Date(v).toLocaleString();
  } catch {
    return "—";
  }
}

export default function SubmissionsListClient(props: {
  formId: string;
  initialItems: SubmissionRow[];
  initialNextCursor: string | null;
  limit: number;
}) {
  const { formId, initialItems, initialNextCursor, limit } = props;

  const [items, setItems] = useState<SubmissionRow[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", String(limit));
      qs.set("before", nextCursor);

      const res = await fetch(`/api/forms/${formId}/submissions?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = (await res.json()) as {
        items: SubmissionRow[];
        nextCursor: string | null;
      };

      const newItems = data.items ?? [];

      // append + dedupe (safe)
      setItems((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        const merged = [...prev];
        for (const it of newItems) {
          if (!seen.has(it.id)) merged.push(it);
        }
        return merged;
      });

      setNextCursor(data.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return <div className="text-sm text-gray-600">No submissions yet.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((s) => {
          const payload = (s.payload ?? {}) as Record<string, unknown>;
          const email =
            typeof payload.email === "string" && payload.email.trim()
              ? payload.email.trim()
              : "—";
          const message =
            typeof payload.message === "string" && payload.message.trim()
              ? payload.message.trim()
              : "—";

          return (
            <div key={s.id} className="border rounded p-3">
              <div className="text-xs text-gray-600">{fmtDate(s.created_at)}</div>
              <div className="text-sm">
                <div>
                  <span className="font-medium">Email:</span> {email}
                </div>
                <div className="mt-1">
                  <span className="font-medium">Message:</span>{" "}
                  <span className="whitespace-pre-wrap">{message}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {nextCursor ? (
        <button
          type="button"
          className="border rounded px-3 py-2 text-sm"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load more"}
        </button>
      ) : null}
    </div>
  );
}
