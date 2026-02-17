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

  const rangeButtons: { key: RangeKey; label: string }[] = [
    { key: "", label: t.submissions.all },
    { key: "today", label: t.submissions.today },
    { key: "7d", label: t.submissions.last7Days },
    { key: "30d", label: t.submissions.last30Days },
  ];

  return (
    <div className="space-y-6">
      {/* Filter bar - white, clean */}
      <div
        className="card sticky top-16 z-20"
        style={{ padding: "var(--space-4) var(--space-6)" }}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Range pills */}
          <div className="flex items-center gap-1.5">
            {rangeButtons.map((rb) => (
              <button
                key={rb.key}
                type="button"
                className="btn btn-sm"
                style={
                  activeRange === rb.key
                    ? {
                        background: "var(--color-accent-600)",
                        color: "white",
                        borderColor: "var(--color-accent-600)",
                        borderRadius: "var(--radius-full)",
                      }
                    : {
                        background: "var(--color-neutral-0)",
                        color: "var(--color-neutral-600)",
                        border: "1.5px solid var(--color-neutral-200)",
                        borderRadius: "var(--radius-full)",
                      }
                }
                onClick={() => setRange(rb.key)}
                disabled={loading}
              >
                {rb.label}
              </button>
            ))}
          </div>

          {/* Separator */}
          <div className="hidden md:block h-6 w-px" style={{ background: "var(--color-neutral-200)" }} />

          {/* Email search */}
          <div className="flex items-center gap-2">
            <input
              className="input"
              style={{ width: "220px", maxWidth: "100%", fontSize: "0.875rem", padding: "8px 14px" }}
              placeholder={t.submissions.searchByEmail}
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onSearch}
              disabled={loading}
            >
              {t.submissions.search}
            </button>
            {activeEmailLabel && (
              <button
                type="button"
                className="btn btn-tertiary btn-sm"
                onClick={onClearSearch}
                disabled={loading}
              >
                {t.submissions.clear}
              </button>
            )}
          </div>

          {/* Status */}
          <div className="text-xs ml-auto" style={{ color: "var(--color-neutral-400)" }}>
            {loadedCount}{" "}
            {hasMore ? `• ${t.submissions.moreAvailable}` : `• ${t.submissions.end}`}
          </div>
        </div>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "var(--space-10) var(--space-6)" }}>
            <div className="empty-state-icon">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div className="empty-state-title">{emptyLabel}</div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-neutral-150)" }}>
                <th
                  className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wide"
                  style={{ color: "var(--color-neutral-400)", background: "var(--color-neutral-50)" }}
                >
                  {t.submissions.date}
                </th>
                <th
                  className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wide"
                  style={{ color: "var(--color-neutral-400)", background: "var(--color-neutral-50)" }}
                >
                  {t.submissions.email}
                </th>
                <th
                  className="text-left px-6 py-3 font-medium text-xs uppercase tracking-wide"
                  style={{ color: "var(--color-neutral-400)", background: "var(--color-neutral-50)" }}
                >
                  {t.submissions.message}
                </th>
              </tr>
            </thead>
            <tbody>
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
                  <tr key={s.id} style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                    <td className="px-6 py-3.5 whitespace-nowrap" style={{ color: "var(--color-neutral-500)" }}>
                      {fmtDate(s.created_at)}
                    </td>
                    <td className="px-6 py-3.5" style={{ color: "var(--color-neutral-700)" }}>
                      {email}
                    </td>
                    <td className="px-6 py-3.5 max-w-sm truncate" style={{ color: "var(--color-neutral-600)" }}>
                      {message}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Load more */}
      {nextCursor ? (
        <div className="text-center">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? t.common.loading : t.submissions.loadMore}
          </button>
        </div>
      ) : null}

      {/* Go to top */}
      {showGoTop ? (
        <button
          type="button"
          onClick={goTop}
          className="btn fixed bottom-6 right-6 z-20"
          style={{
            background: "var(--color-neutral-0)",
            color: "var(--color-neutral-700)",
            borderRadius: "var(--radius-full)",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--color-neutral-200)",
            padding: "10px 16px",
            fontSize: "0.8125rem",
          }}
          aria-label={t.submissions.goToTop}
        >
          ↑ {t.submissions.goToTop}
        </button>
      ) : null}
    </div>
  );
}
