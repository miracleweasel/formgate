// lib/backlog/form-settings-handlers.ts
import {
  parseSessionCookieValue,
  isSessionValid,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { getCookieValue } from "@/lib/auth/cookies";
import { BacklogFieldMappingSchema, type BacklogFieldMapping } from "@/lib/validation/backlogMapping";

type DbLike = {
  select: (...args: any[]) => any;
  insert: (...args: any[]) => any;
};

type EqFn = (...args: any[]) => any;

type SchemaLike = {
  forms: { id: any; userEmail: any };
  integrationBacklogConnections: { spaceUrl: any; defaultProjectKey: any; userEmail: any };
  integrationBacklogFormSettings: {
    formId: any;
    enabled: any;
    projectKey: any;
    fieldMapping: any;
    updatedAt: any;
  };
};

type UserLookupFn = (email: string) => Promise<boolean>;

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init?.headers ?? {}) },
  });
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeProjectKey(v: unknown) {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  return s.replace(/\s+/g, "").toUpperCase();
}

/**
 * Validates session cookie and returns the user email.
 */
async function requireUserOr401(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const raw = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);

    const session = await parseSessionCookieValue(raw);
    if (!session || !isSessionValid(session)) {
      return { ok: false as const, email: "", res: json({ ok: false, error: "unauthorized" }, { status: 401 }) };
    }

    return { ok: true as const, email: session.email.toLowerCase(), res: null as unknown as Response };
  } catch {
    return { ok: false as const, email: "", res: json({ ok: false, error: "unauthorized" }, { status: 401 }) };
  }
}

export function makeBacklogFormSettingsHandlers(deps: {
  db: DbLike;
  schema: SchemaLike;
  eq: EqFn;
}) {
  const { db, schema, eq } = deps;
  const { forms, integrationBacklogConnections, integrationBacklogFormSettings } = schema;

  async function GET(req: Request, ctx: Ctx) {
    const guard = await requireUserOr401(req);
    if (!guard.ok) return guard.res;

    const { id: raw } = await Promise.resolve(ctx.params as any);
    const id = String(raw ?? "").trim();

    // form exists and belongs to this user?
    const [form] = await db
      .select({ id: forms.id, userEmail: forms.userEmail })
      .from(forms)
      .where(eq(forms.id, id))
      .limit(1);

    if (!form) {
      return json({ ok: false, error: "not_found" }, { status: 404 });
    }

    // Verify ownership
    if (form.userEmail && form.userEmail !== guard.email) {
      return json({ ok: false, error: "not_found" }, { status: 404 });
    }

    // global connection for this user
    const [conn] = await db
      .select({
        spaceUrl: integrationBacklogConnections.spaceUrl,
        defaultProjectKey: integrationBacklogConnections.defaultProjectKey,
      })
      .from(integrationBacklogConnections)
      .where(eq(integrationBacklogConnections.userEmail, guard.email))
      .limit(1);

    if (!conn) {
      return json({
        ok: true,
        connection: { spaceUrl: "", defaultProjectKey: "" },
        settings: { enabled: false, projectKey: null },
      });
    }

    // per-form settings
    const [settings] = await db
      .select({
        enabled: integrationBacklogFormSettings.enabled,
        projectKey: integrationBacklogFormSettings.projectKey,
        fieldMapping: integrationBacklogFormSettings.fieldMapping,
      })
      .from(integrationBacklogFormSettings)
      .where(eq(integrationBacklogFormSettings.formId, id))
      .limit(1);

    return json({
      ok: true,
      connection: {
        spaceUrl: conn.spaceUrl ?? "",
        defaultProjectKey: conn.defaultProjectKey ?? "",
      },
      settings: {
        enabled: !!settings?.enabled,
        projectKey: settings?.projectKey ?? null,
        fieldMapping: settings?.fieldMapping ?? null,
      },
    });
  }

  async function PUT(req: Request, ctx: Ctx) {
    const guard = await requireUserOr401(req);
    if (!guard.ok) return guard.res;

    const { id: raw } = await Promise.resolve(ctx.params as any);
    const id = String(raw ?? "").trim();

    // form exists and belongs to this user?
    const [form] = await db
      .select({ id: forms.id, userEmail: forms.userEmail })
      .from(forms)
      .where(eq(forms.id, id))
      .limit(1);

    if (!form) {
      return json({ ok: false, error: "not_found" }, { status: 404 });
    }

    // Verify ownership
    if (form.userEmail && form.userEmail !== guard.email) {
      return json({ ok: false, error: "not_found" }, { status: 404 });
    }

    // parse json
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    if (!isPlainObject(body)) {
      return json({ ok: false, error: "invalid_body" }, { status: 400 });
    }

    const enabled = !!(body as Record<string, unknown>).enabled;
    const projectKey = normalizeProjectKey((body as Record<string, unknown>).projectKey);

    // Validate field mapping if provided
    let fieldMapping: BacklogFieldMapping | null = null;
    const rawMapping = (body as Record<string, unknown>).fieldMapping;
    if (rawMapping !== undefined && rawMapping !== null) {
      const mappingResult = BacklogFieldMappingSchema.safeParse(rawMapping);
      if (!mappingResult.success) {
        return json({ ok: false, error: "invalid_field_mapping" }, { status: 400 });
      }
      fieldMapping = mappingResult.data;
    }

    await db
      .insert(integrationBacklogFormSettings)
      .values({
        formId: id,
        enabled,
        projectKey,
        fieldMapping,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: integrationBacklogFormSettings.formId,
        set: { enabled, projectKey, fieldMapping, updatedAt: new Date() },
      });

    return json({ ok: true });
  }

  return { GET, PUT };
}
