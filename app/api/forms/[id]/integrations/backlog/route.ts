// app/api/forms/[id]/integrations/backlog/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  forms,
  integrationBacklogConnections,
  integrationBacklogFormSettings,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getAdminEmail } from "@/lib/auth/admin";

type Ctx = { params: Promise<{ id: string }> };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function normalizeProjectKey(v: unknown) {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  return s.replace(/\s+/g, "").toUpperCase();
}

async function requireAdminOr401(): Promise<boolean> {
  // getAdminEmail() doit s’appuyer sur ta session cookie côté serveur.
  // Si pas admin/loggé => null/undefined ou throw.
  try {
    const email = await getAdminEmail();
    return !!email;
  } catch {
    return false;
  }
}

// GET: return safe config (spaceUrl + defaultProjectKey + form settings)
export async function GET(_req: Request, ctx: Ctx) {
  const ok = await requireAdminOr401();
  if (!ok) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id: raw } = await Promise.resolve(ctx.params);
  const id = String(raw ?? "").trim();

  const [form] = await db
    .select({ id: forms.id })
    .from(forms)
    .where(eq(forms.id, id))
    .limit(1);

  if (!form) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  // connection (global)
  const [conn] = await db
    .select({
      spaceUrl: integrationBacklogConnections.spaceUrl,
      defaultProjectKey: integrationBacklogConnections.defaultProjectKey,
    })
    .from(integrationBacklogConnections)
    .limit(1);

  if (!conn) {
    // pas configuré globalement -> UI doit pouvoir afficher "—"
    return NextResponse.json({
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

  return NextResponse.json({
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

// PUT: update per-form settings
export async function PUT(req: Request, ctx: Ctx) {
  const ok = await requireAdminOr401();
  if (!ok) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id: raw } = await Promise.resolve(ctx.params);
  const id = String(raw ?? "").trim();

  const [form] = await db
    .select({ id: forms.id })
    .from(forms)
    .where(eq(forms.id, id))
    .limit(1);

  if (!form) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  if (!isPlainObject(body)) {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 }
    );
  }

  const enabled = !!(body as Record<string, unknown>).enabled;
  const projectKey = normalizeProjectKey(
    (body as Record<string, unknown>).projectKey
  );

  // upsert settings
  await db
    .insert(integrationBacklogFormSettings)
    .values({
      formId: id,
      enabled,
      projectKey, // nullable
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: integrationBacklogFormSettings.formId,
      set: {
        enabled,
        projectKey,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ ok: true });
}
