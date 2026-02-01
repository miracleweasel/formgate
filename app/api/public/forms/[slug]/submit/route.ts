// app/api/public/forms/[slug]/submit/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  forms,
  submissions,
  integrationBacklogConnections,
  integrationBacklogFormSettings,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminEmail } from "@/lib/auth/admin";
import { buildIssueDescription, buildIssueSummary } from "@/lib/backlog/issue";
import { createBacklogIssueBestEffort } from "@/lib/backlog/client";

type Primitive = string | number | boolean | null;
type Payload = Record<string, Primitive>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPrimitive(v: unknown): v is Primitive {
  return (
    v === null ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  );
}

function validatePayload(payload: unknown): payload is Payload {
  if (!isPlainObject(payload)) return false;

  const keys = Object.keys(payload);
  if (keys.length === 0) return true;
  if (keys.length > 50) return false;

  for (const k of keys) {
    const value = (payload as Record<string, unknown>)[k];
    if (!isPrimitive(value)) return false;
  }
  return true;
}

function normalizeEmail(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  return s ? s : null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await Promise.resolve(params);

  // 1) form exists?
  const formRows = await db
    .select({ id: forms.id, name: forms.name, slug: forms.slug })
    .from(forms)
    .where(eq(forms.slug, slug))
    .limit(1);

  const form = formRows[0];
  if (!form) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 2) parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = (body as any)?.payload;
  if (!validatePayload(payload)) {
    return NextResponse.json(
      { error: "Invalid payload (object, <=50 keys, primitive values only)" },
      { status: 400 }
    );
  }

  // 3) create submission
  const submissionId = crypto.randomUUID();

  await db.insert(submissions).values({
    id: submissionId,
    formId: form.id,
    payload,
  });

  // 4) Best-effort Backlog issue creation (NEVER block submit response)
  void (async () => {
    try {
      // Form-level setting enabled?
      const [setting] = await db
        .select({
          enabled: integrationBacklogFormSettings.enabled,
          projectKey: integrationBacklogFormSettings.projectKey,
        })
        .from(integrationBacklogFormSettings)
        .where(eq(integrationBacklogFormSettings.formId, form.id))
        .limit(1);

      if (!setting || !setting.enabled) return;

      // ✅ getAdminEmail() est async => await + normalisation string
      const adminEmailRaw = await getAdminEmail();
      const adminEmail = normalizeEmail(adminEmailRaw);
      if (!adminEmail) return;

      const [conn] = await db
        .select({
          spaceUrl: integrationBacklogConnections.spaceUrl,
          apiKey: integrationBacklogConnections.apiKey,
          defaultProjectKey: integrationBacklogConnections.defaultProjectKey,
        })
        .from(integrationBacklogConnections)
        .where(eq(integrationBacklogConnections.userEmail, adminEmail))
        .limit(1);

      if (!conn) return;

      // garde-fous (ne jamais throw sur champs manquants)
      const spaceUrl = String(conn.spaceUrl ?? "").trim();
      const apiKey = String(conn.apiKey ?? "").trim();
      if (!spaceUrl || !apiKey) return;

      const projectKey = String(
        (setting.projectKey || conn.defaultProjectKey || "") ?? ""
      ).trim();
      if (!projectKey) return;

      const summary = buildIssueSummary(form.name, form.slug);
      const description = buildIssueDescription({
        formName: form.name,
        formSlug: form.slug,
        submissionId,
        payload,
      });

      await createBacklogIssueBestEffort({
        spaceUrl,
        apiKey,
        projectKey,
        summary,
        description,
      });
    } catch {
      // Neutral server log ONLY (no apiKey, no headers, no payload dump)
      console.error("[public/submit][backlog] failed");
    }
  })();

  return NextResponse.json({ ok: true, submissionId });
}
