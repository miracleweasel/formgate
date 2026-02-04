// app/(dashboard)/forms/[id]/submissions/SubmissionsListClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { t } from "@/lib/i18n";

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
    if (activeRange === "today") return t.submissions.today;
    if (activeRange === "7d") return t.submissions.last7Days;
    if (activeRange === "30d") return t.submissions.last30Days;
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
      ? t.submissions.noSubmissionsFiltered
      : t.submissions.noSubmissions;

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--color-neutral-500)" }}>
        {t.submissions.filters}
      </div>

      {/* Sticky filter bar */}
      <div
        className="sticky top-0 z-20 -mx-6 px-6 py-3 shadow"
        style={{ background: "var(--color-neutral-800)", borderBottom: "1px solid var(--color-neutral-700)" }}
      >
        <div className="px-6">
          <div className="flex flex-wrap items-center gap-2">
            {/* Range buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="btn btn-sm"
                style={activeRange === ""
                  ? { background: "var(--color-primary-500)", color: "white", borderColor: "var(--color-primary-500)" }
                  : { background: "transparent", color: "var(--color-neutral-300)", borderColor: "var(--color-neutral-600)" }
                }
                onClick={() => setRange("")}
                disabled={loading}
              >
                {t.submissions.all}
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={activeRange === "today"
                  ? { background: "var(--color-primary-500)", color: "white", borderColor: "var(--color-primary-500)" }
                  : { background: "transparent", color: "var(--color-neutral-300)", borderColor: "var(--color-neutral-600)" }
                }
                onClick={() => setRange("today")}
                disabled={loading}
              >
                {t.submissions.today}
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={activeRange === "7d"
                  ? { background: "var(--color-primary-500)", color: "white", borderColor: "var(--color-primary-500)" }
                  : { background: "transparent", color: "var(--color-neutral-300)", borderColor: "var(--color-neutral-600)" }
                }
                onClick={() => setRange("7d")}
                disabled={loading}
              >
                {t.submissions.last7Days}
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={activeRange === "30d"
                  ? { background: "var(--color-primary-500)", color: "white", borderColor: "var(--color-primary-500)" }
                  : { background: "transparent", color: "var(--color-neutral-300)", borderColor: "var(--color-neutral-600)" }
                }
                onClick={() => setRange("30d")}
                disabled={loading}
              >
                {t.submissions.last30Days}
              </button>
            </div>

            {/* Email search */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                className="input"
                style={{ width: "260px", maxWidth: "100%", fontSize: "0.875rem" }}
                placeholder={t.submissions.searchByEmail}
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onSearch}
                disabled={loading}
              >
                {t.submissions.search}
              </button>
              <button
                type="button"
                className="btn btn-tertiary btn-sm"
                onClick={onClearSearch}
                disabled={loading}
              >
                {t.submissions.clear}
              </button>
            </div>

            {/* Counters / status */}
            <div className="text-sm" style={{ color: "var(--color-neutral-400)" }}>
              {t.submissions.loaded}: <span className="font-medium" style={{ color: "var(--color-neutral-200)" }}>{loadedCount}</span>
              {hasMore ? <span className="ml-2">• {t.submissions.moreAvailable}</span> : <span className="ml-2">• {t.submissions.end}</span>}
              {activeRangeLabel ? (
                <>
                  <span className="ml-2">• {t.submissions.range}:</span>{" "}
                  <span className="font-medium" style={{ color: "var(--color-neutral-200)" }}>{activeRangeLabel}</span>
                </>
              ) : null}
              {activeEmailLabel ? (
                <>
                  <span className="ml-2">• {t.auth.email}:</span>{" "}
                  <span className="font-medium" style={{ color: "var(--color-neutral-200)" }}>{activeEmailLabel}</span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="text-sm" style={{ color: "var(--color-neutral-600)" }}>{emptyLabel}</div>
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
              <div key={s.id} className="card" style={{ padding: "var(--space-3)" }}>
                <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>{fmtDate(s.created_at)}</div>
                <div className="text-sm" style={{ color: "var(--color-neutral-700)" }}>
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
          className="btn btn-secondary"
          onClick={loadMore}
          disabled={loading}
        >
          {loading ? t.common.loading : t.submissions.loadMore}
        </button>
      ) : null}

      {/* Go to top */}
      {showGoTop ? (
        <button
          type="button"
          onClick={goTop}
          className="btn fixed bottom-6 right-6 z-20 shadow-lg"
          style={{ background: "var(--color-neutral-0)", color: "var(--color-neutral-700)", borderRadius: "9999px" }}
          aria-label={t.submissions.goToTop}
        >
          {t.submissions.goToTop}
        </button>
      ) : null}
    </div>
  );
}
