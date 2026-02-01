// app/api/forms/[id]/integrations/backlog/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms, integrationBacklogFormSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { parseSessionCookieValue, isSessionValid } from "@/lib/auth/session";
import { getAdminEmail } from "@/lib/auth/admin";
import { unauthorized, internalError } from "@/lib/http/errors";
import { backlogFormSettingsUpsertSchema, normalizeEmail } from "@/lib/backlog/validators";

function getCookieValue(cookieHeader: string, name: string) {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function requireAdmin(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const raw = getCookieValue(cookieHeader, "fg_session");

  const session = await parseSessionCookieValue(raw);
  if (!session || !isSessionValid(session)) return false;

  return normalizeEmail(session.email) === getAdminEmail();
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

// GET: read settings for form
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(req))) return unauthorized();

  const { id: raw } = await Promise.resolve(params);
  const formId = String(raw ?? "").trim();
  if (!isUuid(formId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    // ensure form exists
    const f = await db.select({ id: forms.id }).from(forms).where(eq(forms.id, formId)).limit(1);
    if (!f[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const rows = await db
      .select({
        enabled: integrationBacklogFormSettings.enabled,
        projectKey: integrationBacklogFormSettings.projectKey,
      })
      .from(integrationBacklogFormSettings)
      .where(eq(integrationBacklogFormSettings.formId, formId))
      .limit(1);

    const row = rows[0];
    if (!row) {
      return NextResponse.json({ settings: { enabled: false, projectKey: null } }, { status: 200 });
    }

    return NextResponse.json(
      { settings: { enabled: row.enabled, projectKey: row.projectKey ?? null } },
      { status: 200 }
    );
  } catch (e) {
    console.error("[forms/:id/integrations/backlog][GET] error", e);
    return internalError();
  }
}

// POST: upsert settings for form
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(req))) return unauthorized();

  const { id: raw } = await Promise.resolve(params);
  const formId = String(raw ?? "").trim();
  if (!isUuid(formId)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = backlogFormSettingsUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    // ensure form exists
    const f = await db.select({ id: forms.id }).from(forms).where(eq(forms.id, formId)).limit(1);
    if (!f[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = await db
      .select({ formId: integrationBacklogFormSettings.formId })
      .from(integrationBacklogFormSettings)
      .where(eq(integrationBacklogFormSettings.formId, formId))
      .limit(1);

    const found = existing[0];

    const projectKey =
      parsed.data.projectKey === undefined ? null : (parsed.data.projectKey as any);

    if (found) {
      await db
        .update(integrationBacklogFormSettings)
        .set({
          enabled: parsed.data.enabled,
          projectKey,
          updatedAt: new Date(),
        })
        .where(eq(integrationBacklogFormSettings.formId, formId));
    } else {
      await db.insert(integrationBacklogFormSettings).values({
        formId,
        enabled: parsed.data.enabled,
        projectKey,
      });
    }

    return NextResponse.json(
      { ok: true, settings: { enabled: parsed.data.enabled, projectKey } },
      { status: 200 }
    );
  } catch (e) {
    console.error("[forms/:id/integrations/backlog][POST] error", e);
    return internalError();
  }
}
