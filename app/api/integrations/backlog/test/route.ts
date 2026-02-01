// app/api/integrations/backlog/test/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { integrationBacklogConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { unauthorized, internalError } from "@/lib/http/errors";
import { backlogGetJson } from "@/lib/backlog/client";
import { normalizeEmail } from "@/lib/backlog/validators";
import { requireAdminFromRequest } from "@/lib/auth/requireAdmin";

/**
 * POST /api/integrations/backlog/test
 * - calls Backlog official API: GET /api/v2/users/myself
 * - never logs apiKey or headers
 * - returns neutral error on failure
 */
export async function POST(req: Request) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || !adminEmail.trim()) {
      return NextResponse.json({ error: "Unable to connect" }, { status: 400 });
    }

    const email = normalizeEmail(adminEmail.trim());

    const rows = await db
      .select({
        spaceUrl: integrationBacklogConnections.spaceUrl,
        apiKey: integrationBacklogConnections.apiKey,
      })
      .from(integrationBacklogConnections)
      .where(eq(integrationBacklogConnections.userEmail, email))
      .limit(1);

    const cfg = rows[0];
    if (!cfg || !cfg.spaceUrl || !cfg.apiKey) {
      return NextResponse.json({ error: "Unable to connect" }, { status: 400 });
    }

    const result = await backlogGetJson<{ id: number; name: string; mailAddress?: string }>(
      { spaceUrl: cfg.spaceUrl, apiKey: cfg.apiKey },
      "/api/v2/users/myself"
    );

    if (!result.ok) {
      // neutral logs (no apiKey)
      console.error("[integrations/backlog/test] failed", {
        status: result.status,
        error: result.error,
      });
      return NextResponse.json({ error: "Unable to connect" }, { status: 400 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (_e) {
    console.error("[integrations/backlog/test] error");
    return internalError();
  }
}
