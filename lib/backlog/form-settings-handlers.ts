// lib/backlog/form-settings-handlers.ts
import {
  parseSessionCookieValue,
  isSessionValid,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

type DbLike = {
  select: (...args: any[]) => any;
  insert: (...args: any[]) => any;
};

type EqFn = (...args: any[]) => any;

type GetAdminEmailFn = () => Promise<string | null | undefined>;

type SchemaLike = {
  forms: { id: any };
  integrationBacklogConnections: { spaceUrl: any; defaultProjectKey: any };
  integrationBacklogFormSettings: {
    formId: any;
    enabled: any;
    projectKey: any;
    updatedAt: any;
  };
};

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

function getCookieValue(cookieHeader: string, name: string) {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Validates both:
 * 1. Request has valid session cookie
 * 2. Session email matches admin email
 */
async function requireAdminOr401(req: Request, getAdminEmail: GetAdminEmailFn) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const raw = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);

    const session = await parseSessionCookieValue(raw);
    if (!session || !isSessionValid(session)) {
      return { ok: false as const, res: json({ ok: false, error: "unauthorized" }, { status: 401 }) };
    }

    const adminEmail = await getAdminEmail();
    if (!adminEmail) {
      return { ok: false as const, res: json({ ok: false, error: "unauthorized" }, { status: 401 }) };
    }

    if (session.email.toLowerCase() !== adminEmail.toLowerCase()) {
      return { ok: false as const, res: json({ ok: false, error: "unauthorized" }, { status: 401 }) };
    }

    return { ok: true as const, res: null as unknown as Response };
  } catch {
    return { ok: false as const, res: json({ ok: false, error: "unauthorized" }, { status: 401 }) };
  }
}

export function makeBacklogFormSettingsHandlers(deps: {
  db: DbLike;
  schema: SchemaLike;
  eq: EqFn;
  getAdminEmail: GetAdminEmailFn;
}) {
  const { db, schema, eq, getAdminEmail } = deps;
  const { forms, integrationBacklogConnections, integrationBacklogFormSettings } = schema;

  async function GET(req: Request, ctx: Ctx) {
    const guard = await requireAdminOr401(req, getAdminEmail);
    if (!guard.ok) return guard.res;

    const { id: raw } = await Promise.resolve(ctx.params as any);
    const id = String(raw ?? "").trim();

    // form exists?
    const [form] = await db
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.id, id))
      .limit(1);

    if (!form) {
      return json({ ok: false, error: "not_found" }, { status: 404 });
    }

    // global connection (safe)
    const [conn] = await db
      .select({
        spaceUrl: integrationBacklogConnections.spaceUrl,
        defaultProjectKey: integrationBacklogConnections.defaultProjectKey,
      })
      .from(integrationBacklogConnections)
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
      },
    });
  }

  async function PUT(req: Request, ctx: Ctx) {
    const guard = await requireAdminOr401(req, getAdminEmail);
    if (!guard.ok) return guard.res;

    const { id: raw } = await Promise.resolve(ctx.params as any);
    const id = String(raw ?? "").trim();

    // form exists?
    const [form] = await db
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.id, id))
      .limit(1);

    if (!form) {
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

    await db
      .insert(integrationBacklogFormSettings)
      .values({
        formId: id,
        enabled,
        projectKey,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: integrationBacklogFormSettings.formId,
        set: { enabled, projectKey, updatedAt: new Date() },
      });

    return json({ ok: true });
  }

  return { GET, PUT };
}
