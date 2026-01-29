// app/api/forms/[id]/submissions/route.ts
import { NextResponse } from "next/server";
import { and, desc, eq, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { parseSessionCookieValue, isSessionValid } from "@/lib/auth/session";
import { getAdminEmail } from "@/lib/auth/admin";
import { unauthorized, badRequest } from "@/lib/http/errors";

function getCookieValue(cookieHeader: string, name: string) {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function requireAdmin(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const raw = getCookieValue(cookieHeader, "fg_session");

  const session = await parseSessionCookieValue(raw);
  if (!session || !isSessionValid(session)) return false;

  return session.email.toLowerCase() === getAdminEmail();
}

function clampLimit(v: string | null): number {
  if (v === null) return 50;
  const n = Number(v);
  if (!Number.isFinite(n)) return 50;
  return Math.max(1, Math.min(50, Math.floor(n)));
}

function looksLikeUuid(v: string): boolean {
  // Soft check to reduce attack surface; do not over-enforce to avoid breaking existing ids
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

type Cursor = { createdAtIsoUtc: string; id: string };

function parseCursor(raw: string | null): Cursor | null {
  if (!raw) return null;
  if (raw.length > 300) return null;

  const [iso, id] = raw.split("__");
  if (!iso || !id) return null;

  // Basic ISO date validation (must be parseable)
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const safeId = String(id).trim();
  if (!safeId || safeId.length > 80) return null;

  return { createdAtIsoUtc: d.toISOString(), id: safeId };
}

function normalizeEmailQuery(raw: string | null): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  return v.length > 200 ? v.slice(0, 200) : v;
}

type RangeKey = "today" | "7d" | "30d";
function parseRange(raw: string | null): RangeKey | null {
  const v = String(raw ?? "").trim().toLowerCase();
  if (v === "today" || v === "7d" || v === "30d") return v;
  return null;
}

function lowerBoundJstTs(range: RangeKey) {
  // "now" in JST as timestamp (no tz)
  const nowJstTs = sql`(now() AT TIME ZONE 'Asia/Tokyo')::timestamp`;

  if (range === "today") {
    return sql`date_trunc('day', ${nowJstTs})`;
  }
  if (range === "7d") {
    return sql`${nowJstTs} - interval '7 days'`;
  }
  return sql`${nowJstTs} - interval '30 days'`;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(req))) return unauthorized();

  const { id: formIdRaw } = await Promise.resolve(ctx.params);
  const formId = String(formIdRaw ?? "").trim();

  // Reduce surface: reject empty / absurdly long ids early
  if (!formId || formId.length > 80) return badRequest("invalid form id");
  // If your form ids are UUIDs (likely), we can cheaply filter nonsense inputs.
  // If this ever blocks legit ids, remove this check.
  if (!looksLikeUuid(formId)) return badRequest("invalid form id");

  const url = new URL(req.url);
  const limit = clampLimit(url.searchParams.get("limit"));
  const before = parseCursor(url.searchParams.get("before"));
  const emailQuery = normalizeEmailQuery(url.searchParams.get("email"));
  const range = parseRange(url.searchParams.get("range"));

  // Convert cursor UTC -> JST timestamp (no tz)
  const cursorJstTs = before
    ? sql`((${before.createdAtIsoUtc}::timestamptz) AT TIME ZONE 'Asia/Tokyo')`
    : null;

  // Optional email filter: payload->>'email' ILIKE %q%
  const emailCond =
    emailQuery !== null
      ? sql`${submissions.payload} ->> 'email' ILIKE ${"%" + emailQuery + "%"}`
      : null;

  // Optional range filter (JST timestamp)
  const rangeCond =
    range !== null
      ? sql`${submissions.createdAt}::timestamp >= ${lowerBoundJstTs(range)}`
      : null;

  const conds: Array<ReturnType<typeof eq> | ReturnType<typeof sql>> = [
    eq(submissions.formId, formId),
  ];
  if (emailCond) conds.push(emailCond);
  if (rangeCond) conds.push(rangeCond);

  const baseCond = and(...conds);

  const whereClause = before
    ? and(
        baseCond,
        or(
          sql`${submissions.createdAt}::timestamp < ${cursorJstTs!}`,
          sql`${submissions.createdAt}::timestamp = ${cursorJstTs!} AND (${submissions.id}::text) < (${before.id}::text)`
        )
      )
    : baseCond;

  const rows = await db
    .select({
      id: submissions.id,
      created_at: submissions.createdAt,
      payload: submissions.payload,
    })
    .from(submissions)
    .where(whereClause)
    .orderBy(
      desc(sql`${submissions.createdAt}::timestamp`),
      desc(sql`${submissions.id}::text`)
    )
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;

  const last = items[items.length - 1];
  const nextCursor =
    hasMore && last
      ? `${new Date(last.created_at).toISOString()}__${String(last.id)}`
      : null;

  return NextResponse.json({ items, nextCursor });
}
