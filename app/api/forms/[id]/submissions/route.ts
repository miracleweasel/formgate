// app/api/forms/[id]/submissions/route.ts
import { NextResponse } from "next/server";

import { requireUserFromRequest } from "@/lib/auth/requireUser";
import { unauthorized, badRequest } from "@/lib/http/errors";
import { clampLimit, looksLikeUuid } from "@/lib/validation/submissionsQuery";
import { fetchSubmissions } from "@/lib/db/queries";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const email = await requireUserFromRequest(req);
  if (!email) return unauthorized();

  const { id: formIdRaw } = await Promise.resolve(ctx.params);
  const formId = String(formIdRaw ?? "").trim();

  if (!formId || formId.length > 80) return badRequest("invalid form id");
  if (!looksLikeUuid(formId)) return badRequest("invalid form id");

  const url = new URL(req.url);
  const limit = clampLimit(url.searchParams.get("limit"));

  const data = await fetchSubmissions(formId, {
    limit,
    before: url.searchParams.get("before"),
    email: url.searchParams.get("email"),
    range: url.searchParams.get("range"),
  });

  return NextResponse.json(data);
}
