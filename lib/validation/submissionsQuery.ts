// lib/validation/submissionsQuery.ts
import { sql } from "drizzle-orm";

export function clampLimit(v: string | null): number {
  if (v === null) return 50;
  const n = Number(v);
  if (!Number.isFinite(n)) return 50;
  return Math.max(1, Math.min(50, Math.floor(n)));
}

export function looksLikeUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

export type Cursor = { createdAtIsoUtc: string; id: string };

export function parseCursor(raw: string | null): Cursor | null {
  if (!raw) return null;
  if (raw.length > 300) return null;

  const [iso, id] = raw.split("__");
  if (!iso || !id) return null;

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const safeId = String(id).trim();
  if (!safeId || safeId.length > 80) return null;

  return { createdAtIsoUtc: d.toISOString(), id: safeId };
}

export function normalizeEmailQuery(raw: string | null): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  return v.length > 200 ? v.slice(0, 200) : v;
}

export type RangeKey = "today" | "7d" | "30d";

export function parseRange(raw: string | null): RangeKey | null {
  const v = String(raw ?? "").trim().toLowerCase();
  if (v === "today" || v === "7d" || v === "30d") return v;
  return null;
}

export function lowerBoundJstTs(range: RangeKey) {
  const nowJstTs = sql`(now() AT TIME ZONE 'Asia/Tokyo')::timestamp`;

  if (range === "today") {
    return sql`date_trunc('day', ${nowJstTs})`;
  }
  if (range === "7d") {
    return sql`${nowJstTs} - interval '7 days'`;
  }
  return sql`${nowJstTs} - interval '30 days'`;
}
