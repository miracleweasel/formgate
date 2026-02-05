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
import { decryptString } from "@/lib/crypto";
import { getClientIp, rateLimitOrNull } from "@/lib/http/rateLimit";
import {
  buildSubmissionSchema,
  DEFAULT_FIELDS,
  type FormField,
} from "@/lib/validation/fields";

type Primitive = string | number | boolean | null;
type Payload = Record<string, Primitive>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeEmail(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim().toLowerCase() : "";
  return s ? s : null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limit: 10 requests per minute per IP (anti-spam)
  const ip = getClientIp(req);
  const limited = rateLimitOrNull({
    key: `public_submit:${ip}`,
    limit: 10,
    windowMs: 60 * 1000, // 1 minute
    addRetryAfter: true,
  });
  if (limited) return limited;

  const { slug } = await Promise.resolve(params);

  // 1) form exists?
  const formRows = await db
    .select({
      id: forms.id,
      name: forms.name,
      slug: forms.slug,
      fields: forms.fields,
    })
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

  const rawPayload = (body as any)?.payload;
  if (!isPlainObject(rawPayload)) {
    return NextResponse.json(
      { error: "Invalid payload (must be an object)" },
      { status: 400 }
    );
  }

  // 3) Validate payload against field schema
  // Use form's custom fields or fall back to default fields
  const fieldDefs: FormField[] =
    form.fields && form.fields.length > 0 ? form.fields : DEFAULT_FIELDS;

  const submissionSchema = buildSubmissionSchema(fieldDefs);
  const validationResult = submissionSchema.safeParse(rawPayload);

  if (!validationResult.success) {
    const firstError = validationResult.error.issues[0];
    return NextResponse.json(
      {
        error: "Validation failed",
        field: firstError?.path[0] ?? null,
        message: firstError?.message ?? "Invalid input",
      },
      { status: 400 }
    );
  }

  // Cast validated data to Payload type (safe because Zod only allows primitives)
  const payload = validationResult.data as Payload;

  // 4) create submission
  const submissionId = crypto.randomUUID();

  await db.insert(submissions).values({
    id: submissionId,
    formId: form.id,
    payload,
  });

  // 5) Best-effort Backlog issue creation (NEVER block submit response)
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
      const encryptedApiKey = String(conn.apiKey ?? "").trim();
      if (!spaceUrl || !encryptedApiKey) return;

      // Decrypt API key
      let apiKey: string;
      try {
        apiKey = decryptString(encryptedApiKey);
      } catch {
        console.error("[public/submit][backlog] decrypt failed");
        return;
      }

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
