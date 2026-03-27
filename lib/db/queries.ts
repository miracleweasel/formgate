// lib/db/queries.ts
import { and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import {
  clampLimit,
  parseCursor,
  normalizeEmailQuery,
  parseRange,
  lowerBoundJstTs,
  type RangeKey,
  type Cursor,
} from "@/lib/validation/submissionsQuery";

export type FetchSubmissionsOpts = {
  limit?: number;
  before?: string | null;
  email?: string | null;
  range?: string | null;
};

export async function fetchSubmissions(formId: string, opts: FetchSubmissionsOpts = {}) {
  const limit = opts.limit ?? 50;
  const before = parseCursor(opts.before ?? null);
  const emailQuery = normalizeEmailQuery(opts.email ?? null);
  const range = parseRange(opts.range ?? null);

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

  return { items, nextCursor };
}
