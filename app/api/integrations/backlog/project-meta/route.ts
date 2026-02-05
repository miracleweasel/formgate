// app/api/integrations/backlog/project-meta/route.ts
// GET: fetch issue types + custom fields for a Backlog project (admin-only)

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { integrationBacklogConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminFromRequest } from "@/lib/auth/requireAdmin";
import { unauthorized, internalError } from "@/lib/http/errors";
import { normalizeEmail } from "@/lib/backlog/validators";
import { backlogGetJson, getProjectCustomFields } from "@/lib/backlog/client";
import { decryptString } from "@/lib/crypto";

type BacklogIssueType = { id: number; name: string; color: string };
type BacklogPriority = { id: number; name: string };

/**
 * GET /api/integrations/backlog/project-meta?projectKey=XXX
 * Returns: { issueTypes, customFields, priorities } for the given project
 * Used by the field mapping UI to populate dropdowns
 */
export async function GET(req: Request) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  try {
    const url = new URL(req.url);
    const projectKey = (url.searchParams.get("projectKey") ?? "").trim();

    if (!projectKey) {
      return NextResponse.json({ error: "projectKey required" }, { status: 400 });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || !adminEmail.trim()) {
      return NextResponse.json({ error: "Not configured" }, { status: 400 });
    }

    const email = normalizeEmail(adminEmail.trim());

    const [conn] = await db
      .select({
        spaceUrl: integrationBacklogConnections.spaceUrl,
        apiKey: integrationBacklogConnections.apiKey,
      })
      .from(integrationBacklogConnections)
      .where(eq(integrationBacklogConnections.userEmail, email))
      .limit(1);

    if (!conn || !conn.spaceUrl || !conn.apiKey) {
      return NextResponse.json({ error: "No Backlog connection" }, { status: 400 });
    }

    let apiKey: string;
    try {
      apiKey = decryptString(conn.apiKey);
    } catch {
      console.error("[integrations/backlog/project-meta] decrypt failed");
      return NextResponse.json({ error: "Connection error" }, { status: 400 });
    }

    const cfg = { spaceUrl: conn.spaceUrl, apiKey };

    // Fetch issue types, custom fields, and priorities in parallel
    const [issueTypesRes, customFieldsRes, prioritiesRes] = await Promise.all([
      backlogGetJson<BacklogIssueType[]>(cfg, `/api/v2/projects/${projectKey}/issueTypes`),
      getProjectCustomFields(cfg, projectKey),
      backlogGetJson<BacklogPriority[]>(cfg, "/api/v2/priorities"),
    ]);

    return NextResponse.json({
      ok: true,
      issueTypes: issueTypesRes.ok ? issueTypesRes.data : [],
      customFields: customFieldsRes.ok ? customFieldsRes.data : [],
      priorities: prioritiesRes.ok ? prioritiesRes.data : [],
    });
  } catch {
    console.error("[integrations/backlog/project-meta] error");
    return internalError();
  }
}
