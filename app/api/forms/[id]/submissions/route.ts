// app/api/forms/[id]/submissions/route.ts
import { NextResponse } from "next/server";
import { and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";

function clampLimit(v: string | null): number {
  if (v === null) return 50; // ✅ vrai default
  const n = Number(v);
  if (!Number.isFinite(n)) return 50;
  return Math.max(1, Math.min(50, Math.floor(n)));
}

// Cursor format: `${createdAtISO}__${id}`
// createdAtISO is UTC ISO like 2026-01-23T05:25:52.651Z
function parseCursor(
  raw: string | null
): { createdAtIsoUtc: string; id: string } | null {
  if (!raw) return null;
  const [iso, id] = raw.split("__");
  if (!iso || !id) return null;
  return { createdAtIsoUtc: iso, id };
}

function normalizeEmailQuery(raw: string | null): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  // clamp anti-abus (et évite patterns géants)
  return v.length > 200 ? v.slice(0, 200) : v;
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id: formId } = await Promise.resolve(ctx.params);

  const url = new URL(req.url);
  const limit = clampLimit(url.searchParams.get("limit"));
  const before = parseCursor(url.searchParams.get("before"));
  const emailQuery = normalizeEmailQuery(url.searchParams.get("email"));

  // Convert cursor UTC -> JST "timestamp without time zone"
  // (timestamptz AT TIME ZONE 'Asia/Tokyo') returns a timestamp (no tz) in JST.
  const cursorJstTs = before
    ? sql`((${before.createdAtIsoUtc}::timestamptz) AT TIME ZONE 'Asia/Tokyo')`
    : null;

  // Optional email filter (payload->>'email' ILIKE %q%)
  const emailCond = emailQuery
    ? sql`${submissions.payload} ->> 'email' ILIKE ${"%" + emailQuery + "%"}`
    : null;

  const baseCond = emailCond
    ? and(eq(submissions.formId, formId), emailCond)
    : eq(submissions.formId, formId);

  const whereClause = before
    ? and(
        baseCond,
        or(
          // created_at < cursor (both compared as timestamp without tz, JST)
          sql`${submissions.createdAt}::timestamp < ${cursorJstTs!}`,
          // OR (created_at = cursor AND id < cursorId)
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
    // Order must match the same typed expressions used in the cursor comparison
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
      ? `${new Date(last.created_at).toISOString()}__${last.id}`
      : null;

  return NextResponse.json({ items, nextCursor });
}
