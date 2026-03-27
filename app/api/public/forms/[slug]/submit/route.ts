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
import { buildMappedIssue } from "@/lib/backlog/issue";
import { createBacklogIssueBestEffort, createBacklogSubTasks, backlogUploadAttachment, type CustomFieldValue } from "@/lib/backlog/client";
import { evaluateAssignmentRule, applyTemplate } from "@/lib/validation/backlogMapping";
import { FILE_MAX_SIZE, FILE_MAX_COUNT, FILE_ALLOWED_TYPES } from "@/lib/validation/fields";
import { decryptString } from "@/lib/crypto";
import { getClientIp, rateLimitOrNull } from "@/lib/http/rateLimit";
import {
  buildSubmissionSchema,
  DEFAULT_FIELDS,
  type FormField,
} from "@/lib/validation/fields";
import { insertSubmissionIfAllowed } from "@/lib/billing/planLimits";

type Primitive = string | number | boolean | null;
type Payload = Record<string, Primitive>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
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
      userEmail: forms.userEmail,
    })
    .from(forms)
    .where(eq(forms.slug, slug))
    .limit(1);

  const form = formRows[0];
  if (!form) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 2) parse body (JSON or FormData)
  const fieldDefs: FormField[] =
    form.fields && form.fields.length > 0 ? form.fields : DEFAULT_FIELDS;

  let rawPayload: unknown;
  const uploadedFiles: { fieldName: string; buffer: Uint8Array; filename: string }[] = [];

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    // FormData mode (with file uploads)
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    }

    // Extract JSON payload from _payload field
    const payloadStr = formData.get("_payload");
    if (typeof payloadStr !== "string") {
      return NextResponse.json({ error: "Missing _payload field" }, { status: 400 });
    }
    try {
      rawPayload = JSON.parse(payloadStr);
    } catch {
      return NextResponse.json({ error: "Invalid _payload JSON" }, { status: 400 });
    }

    // Extract file fields
    const fileFieldNames = new Set(
      fieldDefs.filter((f) => f.type === "file").map((f) => f.name)
    );

    let fileCount = 0;
    for (const [key, value] of formData.entries()) {
      if (key === "_payload") continue;
      if (!fileFieldNames.has(key)) continue;
      if (!(value instanceof File)) continue;
      if (value.size === 0) continue;

      fileCount++;
      if (fileCount > FILE_MAX_COUNT) {
        return NextResponse.json(
          { error: "Too many files", message: `Maximum ${FILE_MAX_COUNT} files allowed` },
          { status: 400 }
        );
      }

      // Validate file size
      const fieldDef = fieldDefs.find((f) => f.name === key);
      const maxSize = (fieldDef && fieldDef.type === "file" && fieldDef.maxFileSize)
        ? fieldDef.maxFileSize
        : FILE_MAX_SIZE;

      if (value.size > maxSize) {
        return NextResponse.json(
          { error: "File too large", field: key, message: `Maximum ${Math.round(maxSize / 1024 / 1024)}MB allowed` },
          { status: 400 }
        );
      }

      // Validate file type
      if (!FILE_ALLOWED_TYPES.some((t) => value.type === t || (t.endsWith("/*") && value.type.startsWith(t.replace("/*", "/"))))) {
        return NextResponse.json(
          { error: "Invalid file type", field: key, message: "File type not allowed" },
          { status: 400 }
        );
      }

      const arrayBuffer = await value.arrayBuffer();
      uploadedFiles.push({
        fieldName: key,
        buffer: new Uint8Array(arrayBuffer),
        filename: value.name,
      });
    }

    // Validate required file fields
    for (const fd of fieldDefs) {
      if (fd.type === "file" && fd.required) {
        if (!uploadedFiles.some((f) => f.fieldName === fd.name)) {
          return NextResponse.json(
            { error: "Validation failed", field: fd.name, message: `${fd.label} is required` },
            { status: 400 }
          );
        }
      }
    }
  } else {
    // Standard JSON mode
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    rawPayload = (body as any)?.payload;
  }

  if (!isPlainObject(rawPayload)) {
    return NextResponse.json(
      { error: "Invalid payload (must be an object)" },
      { status: 400 }
    );
  }

  // 3) Validate payload against field schema (file fields are skipped)
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

  // 4) Atomic billing check + submission insert (prevents race conditions)
  const submissionId = crypto.randomUUID();
  const ownerEmail = form.userEmail;

  if (ownerEmail) {
    const result = await insertSubmissionIfAllowed(ownerEmail, {
      id: submissionId,
      formId: form.id,
      payload,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: result.reason },
        { status: 429 }
      );
    }
  } else {
    // No owner (legacy form) — insert directly
    await db.insert(submissions).values({
      id: submissionId,
      formId: form.id,
      payload,
    });
  }

  // 5) Best-effort email notification to form owner
  if (ownerEmail) {
    void (async () => {
      try {
        const { sendSubmissionNotification } = await import("@/lib/email/send");
        await sendSubmissionNotification(ownerEmail, form.name, payload);
      } catch {
        console.error("[public/submit][notify] email failed");
      }
    })();
  }

  // 6) Best-effort Backlog issue creation (NEVER block submit response)
  void (async () => {
    try {
      // Form-level setting enabled?
      const [setting] = await db
        .select({
          enabled: integrationBacklogFormSettings.enabled,
          projectKey: integrationBacklogFormSettings.projectKey,
          fieldMapping: integrationBacklogFormSettings.fieldMapping,
        })
        .from(integrationBacklogFormSettings)
        .where(eq(integrationBacklogFormSettings.formId, form.id))
        .limit(1);

      if (!setting || !setting.enabled) return;

      // Get Backlog connection for the form owner
      if (!ownerEmail) return;

      const [conn] = await db
        .select({
          spaceUrl: integrationBacklogConnections.spaceUrl,
          apiKey: integrationBacklogConnections.apiKey,
          defaultProjectKey: integrationBacklogConnections.defaultProjectKey,
        })
        .from(integrationBacklogConnections)
        .where(eq(integrationBacklogConnections.userEmail, ownerEmail))
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

      // Build issue using field mapping
      const issueData = buildMappedIssue({
        formName: form.name,
        formSlug: form.slug,
        submissionId,
        payload,
        mapping: setting.fieldMapping,
      });

      // Build custom field values if mapping exists
      const customFields: CustomFieldValue[] = [];
      if (setting.fieldMapping?.customFields) {
        for (const cf of setting.fieldMapping.customFields) {
          const value = payload[cf.formFieldName];
          if (value !== undefined) {
            customFields.push({
              backlogFieldId: cf.backlogFieldId,
              value,
            });
          }
        }
      }

      // Evaluate assignment rule
      const assigneeId = evaluateAssignmentRule(
        setting.fieldMapping?.assignmentRule,
        payload
      );

      // Upload file attachments to Backlog if any
      const attachmentIds: number[] = [];
      if (uploadedFiles.length > 0) {
        for (const uf of uploadedFiles) {
          const uploadRes = await backlogUploadAttachment(
            { spaceUrl, apiKey },
            uf.buffer,
            uf.filename
          );
          if (uploadRes.ok) {
            attachmentIds.push(uploadRes.id);
          }
        }
      }

      const result = await createBacklogIssueBestEffort({
        spaceUrl,
        apiKey,
        projectKey,
        summary: issueData.summary,
        description: issueData.description,
        priorityId: issueData.priorityId,
        issueTypeId: issueData.issueTypeId,
        customFields: customFields.length > 0 ? customFields : undefined,
        assigneeId,
        attachmentId: attachmentIds.length > 0 ? attachmentIds : undefined,
      });

      // Create sub-tasks if configured and parent issue was created
      if (
        result.ok &&
        setting.fieldMapping?.subTasks &&
        setting.fieldMapping.subTasks.length > 0
      ) {
        const resolvedSubTasks = setting.fieldMapping.subTasks.map((st) => ({
          summary: applyTemplate(st.summary, payload),
          assigneeId: st.assigneeId,
        }));

        await createBacklogSubTasks({
          spaceUrl,
          apiKey,
          parentIssueId: result.issueId,
          projectId: result.projectId,
          issueTypeId: result.issueTypeId,
          subTasks: resolvedSubTasks,
        });
      }
    } catch {
      // Neutral server log ONLY (no apiKey, no headers, no payload dump)
      console.error("[public/submit][backlog] failed");
    }
  })();

  return NextResponse.json({ ok: true, submissionId });
}
