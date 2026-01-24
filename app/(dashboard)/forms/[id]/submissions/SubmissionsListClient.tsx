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

  // Go to top
  const [showGoTop, setShowGoTop] = useState(false);

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

  const loadedCount = items.length;
  const hasMore = Boolean(nextCursor);

  useEffect(() => {
    // Reset when switching forms
    setItems(initialItems);
    setNextCursor(initialNextCursor);
    setLoading(false);
    setInputEmail("");
    setActiveEmail("");
    setActiveRange("");
    setShowGoTop(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  useEffect(() => {
    function onScroll() {
      setShowGoTop(window.scrollY > 200);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  function goTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const emptyLabel =
    activeEmailLabel || activeRangeLabel
      ? `No submissions${activeEmailLabel ? ` for "${activeEmailLabel}"` : ""}${
          activeRangeLabel ? ` in ${activeRangeLabel}` : ""
        }.`
      : "No submissions yet.";

  return (
    <div className="space-y-4">
      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 -mx-6 px-6 py-3 bg-white/90 backdrop-blur border-b">
        <div className="flex flex-wrap items-center gap-2">
          {/* Range buttons */}
          <div className="flex flex-wrap items-center gap-2">
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
              className={`border rounded px-3 py-2 text-sm ${
                activeRange === "today" ? "bg-black text-white" : ""
              }`}
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
              className={`border rounded px-3 py-2 text-sm ${
                activeRange === "30d" ? "bg-black text-white" : ""
              }`}
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

          {/* Counters / status */}
          <div className="text-sm text-gray-600">
            Loaded: <span className="font-medium">{loadedCount}</span>
            {hasMore ? <span className="ml-2">• More available</span> : <span className="ml-2">• End</span>}
            {activeRangeLabel ? (
              <>
                <span className="ml-2">• Range:</span>{" "}
                <span className="font-medium">{activeRangeLabel}</span>
              </>
            ) : null}
            {activeEmailLabel ? (
              <>
                <span className="ml-2">• Email:</span>{" "}
                <span className="font-medium">{activeEmailLabel}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-sm text-gray-600">{emptyLabel}</div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => {
            const payload = (s.payload ?? {}) as Record<string, unknown>;
            const email =
              typeof payload.email === "string" && payload.email.trim() ? payload.email.trim() : "—";
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

      {/* Load more */}
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

      {/* Go to top */}
      {showGoTop ? (
        <button
          type="button"
          onClick={goTop}
          className="fixed bottom-6 right-6 z-20 rounded-full border bg-white px-4 py-3 text-sm shadow"
          aria-label="Go to top"
        >
          ↑ Top
        </button>
      ) : null}
    </div>
  );
}
