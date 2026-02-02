// app/api/forms/[id]/submissions/route.ts
import { NextResponse } from "next/server";
import { and, desc, eq, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { requireAdminFromRequest } from "@/lib/auth/requireAdmin";
import { unauthorized, badRequest } from "@/lib/http/errors";
import {
  clampLimit,
  looksLikeUuid,
  parseCursor,
  normalizeEmailQuery,
  parseRange,
  lowerBoundJstTs,
} from "@/lib/validation/submissionsQuery";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  const { id: formIdRaw } = await Promise.resolve(ctx.params);
  const formId = String(formIdRaw ?? "").trim();

  if (!formId || formId.length > 80) return badRequest("invalid form id");
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
