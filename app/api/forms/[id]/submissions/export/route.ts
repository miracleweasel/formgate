// app/api/forms/[id]/submissions/export/route.ts

import { NextResponse } from "next/server";
import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { toCsv, formatJstForCsv } from "@/lib/csv";
import { requireAdminFromRequest } from "@/lib/auth/requireAdmin";
import { unauthorized } from "@/lib/http/errors";

type Params = { id: string };

function clampLatestLimit(v: string | null): number {
  if (v === null) return 50;
  const n = Number(v);
  if (!Number.isFinite(n)) return 50;
  return Math.max(1, Math.min(50, Math.floor(n)));
}

function getStringFromPayload(payload: unknown, key: string): string {
  if (!payload || typeof payload !== "object") return "";
  const v = (payload as Record<string, unknown>)[key];
  if (typeof v === "string") return v;
  if (v === null || v === undefined) return "";
  // Si quelqu’un a envoyé number/bool → on stringify
  return String(v);
}

export async function GET(
  req: Request,
  ctx: { params: Promise<Params> }
) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  const { id: formId } = await Promise.resolve(ctx.params);

  const url = new URL(req.url);
  const mode = (url.searchParams.get("mode") ?? "latest").toLowerCase();
  const latestLimit = clampLatestLimit(url.searchParams.get("limit"));

  const baseQuery = db
    .select({
      id: submissions.id,
      created_at: submissions.createdAt,
      payload: submissions.payload,
    })
    .from(submissions)
    .where(eq(submissions.formId, formId))
    // on garde le même "typed order" que ton endpoint pagination
    .orderBy(
      desc(sql`${submissions.createdAt}::timestamp`),
      desc(sql`${submissions.id}::text`)
    );

  const rows =
    mode === "all" ? await baseQuery : await baseQuery.limit(latestLimit);

  const csvRows = rows.map((r) => {
    const d = r.created_at instanceof Date ? r.created_at : new Date(String(r.created_at));
    const email = getStringFromPayload(r.payload, "email");
    const message = getStringFromPayload(r.payload, "message");

    return [formatJstForCsv(d), email, message];
  });

  const csv = toCsv(["created_at", "email", "message"], csvRows, { bom: true });

  const suffix = mode === "all" ? "all" : `latest-${latestLimit}`;
  const filename = `form_${formId}_submissions_${suffix}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
