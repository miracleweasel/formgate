// app/api/integrations/backlog/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { integrationBacklogConnections } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminFromRequest } from "@/lib/auth/requireAdmin";
import { unauthorized, internalError } from "@/lib/http/errors";
import { backlogConnectionUpsertSchema, normalizeEmail, safeBoolHasApiKey } from "@/lib/backlog/validators";
import { encryptString } from "@/lib/crypto";

// GET: safe config only
export async function GET(req: Request) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || !adminEmail.trim()) {
      // No admin configured => treat as no integration
      return NextResponse.json({ integration: null }, { status: 200 });
    }

    const email = normalizeEmail(adminEmail.trim());

    const rows = await db
      .select({
        spaceUrl: integrationBacklogConnections.spaceUrl,
        defaultProjectKey: integrationBacklogConnections.defaultProjectKey,
        apiKey: integrationBacklogConnections.apiKey,
      })
      .from(integrationBacklogConnections)
      .where(eq(integrationBacklogConnections.userEmail, email))
      .limit(1);

    const row = rows[0];
    if (!row) return NextResponse.json({ integration: null }, { status: 200 });

    return NextResponse.json(
      {
        integration: {
          spaceUrl: row.spaceUrl,
          defaultProjectKey: row.defaultProjectKey,
          hasApiKey: safeBoolHasApiKey(row.apiKey),
        },
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("[integrations/backlog][GET] error"); // Never log error object (may contain sensitive data)
    return internalError();
  }
}

// POST: upsert config (admin-only)
export async function POST(req: Request) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = backlogConnectionUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || !adminEmail.trim()) {
      console.error("[integrations/backlog][POST] Missing ADMIN_EMAIL env var");
      return internalError();
    }

    const email = normalizeEmail(adminEmail.trim());

    const existing = await db
      .select({ id: integrationBacklogConnections.id })
      .from(integrationBacklogConnections)
      .where(eq(integrationBacklogConnections.userEmail, email))
      .limit(1);

    const found = existing[0];

    // Encrypt API key before storing
    const encryptedApiKey = encryptString(parsed.data.apiKey);

    if (found) {
      await db
        .update(integrationBacklogConnections)
        .set({
          spaceUrl: parsed.data.spaceUrl,
          apiKey: encryptedApiKey,
          defaultProjectKey: parsed.data.defaultProjectKey,
          // updatedAt auto via $onUpdate, but that's runtime; drizzle update won't trigger it automatically.
          updatedAt: new Date(),
        })
        .where(eq(integrationBacklogConnections.id, found.id));
    } else {
      await db.insert(integrationBacklogConnections).values({
        id: crypto.randomUUID(),
        userEmail: email,
        spaceUrl: parsed.data.spaceUrl,
        apiKey: encryptedApiKey,
        defaultProjectKey: parsed.data.defaultProjectKey,
      });
    }

    // return safe config
    return NextResponse.json(
      {
        ok: true,
        integration: {
          spaceUrl: parsed.data.spaceUrl,
          defaultProjectKey: parsed.data.defaultProjectKey,
          hasApiKey: true,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    // NEVER log apiKey
    console.error("[integrations/backlog][POST] error");
    return internalError();
  }
}
