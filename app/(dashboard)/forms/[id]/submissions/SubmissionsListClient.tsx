// app/(dashboard)/forms/[id]/submissions/SubmissionsListClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

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

function normalizeQuery(v: string): string {
  return v.trim();
}

type RangeKey = "" | "today" | "7d" | "30d";

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

  // Search
  const [inputEmail, setInputEmail] = useState("");
  const [activeEmail, setActiveEmail] = useState<string>("");

  // Range filter
  const [activeRange, setActiveRange] = useState<RangeKey>("");

  const activeEmailLabel = useMemo(() => {
    const q = activeEmail.trim();
    return q ? q : null;
  }, [activeEmail]);

  const activeRangeLabel = useMemo(() => {
    if (activeRange === "today") return "Today";
    if (activeRange === "7d") return "Last 7 days";
    if (activeRange === "30d") return "Last 30 days";
    return null;
  }, [activeRange]);

  useEffect(() => {
    setItems(initialItems);
    setNextCursor(initialNextCursor);
    setLoading(false);
    setInputEmail("");
    setActiveEmail("");
    setActiveRange("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  function buildQs(before?: string | null, email?: string, range?: RangeKey) {
    const qs = new URLSearchParams();
    qs.set("limit", String(limit));
    if (before) qs.set("before", before);

    const e = normalizeQuery(email ?? "");
    if (e) qs.set("email", e);

    if (range) qs.set("range", range);

    return qs;
  }

  async function fetchFirstPage(email: string, range: RangeKey) {
    setLoading(true);
    try {
      const qs = buildQs(null, email, range);
      const res = await fetch(`/api/forms/${formId}/submissions?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = (await res.json()) as {
        items: SubmissionRow[];
        nextCursor: string | null;
      };

      setItems(data.items ?? []);
      setNextCursor(data.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const qs = buildQs(nextCursor, activeEmail, activeRange);

      const res = await fetch(`/api/forms/${formId}/submissions?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`API ${res.status}`);

      const data = (await res.json()) as {
        items: SubmissionRow[];
        nextCursor: string | null;
      };

      const newItems = data.items ?? [];

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

  async function onSearch() {
    const q = normalizeQuery(inputEmail);
    setActiveEmail(q);
    await fetchFirstPage(q, activeRange);
  }

  async function onClearSearch() {
    setInputEmail("");
    setActiveEmail("");
    await fetchFirstPage("", activeRange);
  }

  async function setRange(r: RangeKey) {
    setActiveRange(r);
    await fetchFirstPage(activeEmail, r);
  }

  const emptyLabel = activeEmailLabel || activeRangeLabel
    ? `No submissions${activeEmailLabel ? ` for "${activeEmailLabel}"` : ""}${activeRangeLabel ? ` in ${activeRangeLabel}` : ""}.`
    : "No submissions yet.";

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Range buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`border rounded px-3 py-2 text-sm ${activeRange === "" ? "bg-black text-white" : ""}`}
            onClick={() => setRange("")}
            disabled={loading}
          >
            All
          </button>
          <button
            type="button"
            className={`border rounded px-3 py-2 text-sm ${activeRange === "today" ? "bg-black text-white" : ""}`}
            onClick={() => setRange("today")}
            disabled={loading}
          >
            Today
          </button>
          <button
            type="button"
            className={`border rounded px-3 py-2 text-sm ${activeRange === "7d" ? "bg-black text-white" : ""}`}
            onClick={() => setRange("7d")}
            disabled={loading}
          >
            Last 7 days
          </button>
          <button
            type="button"
            className={`border rounded px-3 py-2 text-sm ${activeRange === "30d" ? "bg-black text-white" : ""}`}
            onClick={() => setRange("30d")}
            disabled={loading}
          >
            Last 30 days
          </button>
        </div>

        {/* Email search */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="border rounded px-3 py-2 text-sm w-[260px] max-w-full"
            placeholder="Search by email"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
          />
          <button
            type="button"
            className="border rounded px-3 py-2 text-sm"
            onClick={onSearch}
            disabled={loading}
          >
            Search
          </button>
          <button
            type="button"
            className="text-sm underline"
            onClick={onClearSearch}
            disabled={loading}
          >
            Clear
          </button>
        </div>

        {(activeEmailLabel || activeRangeLabel) ? (
          <div className="text-sm text-gray-600">
            {activeRangeLabel ? (
              <>
                Range: <span className="font-medium">{activeRangeLabel}</span>
              </>
            ) : null}
            {activeRangeLabel && activeEmailLabel ? <span className="mx-2">•</span> : null}
            {activeEmailLabel ? (
              <>
                Filter: <span className="font-medium">{activeEmailLabel}</span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-gray-600">{emptyLabel}</div>
      ) : (
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
      )}

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
