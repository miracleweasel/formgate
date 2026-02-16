// app/api/forms/route.ts
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { slugify } from "@/lib/forms/utils";
import { requireAdminFromRequest } from "@/lib/auth/requireAdmin";
import { unauthorized, internalError, jsonError } from "@/lib/http/errors";
import { CreateFormSchema } from "@/lib/validation/forms";
import { DEFAULT_FIELDS } from "@/lib/validation/fields";
import { insertFormIfAllowed } from "@/lib/billing/planLimits";

export async function GET(req: Request) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  const rows = await db.select().from(forms).orderBy(desc(forms.createdAt));
  return NextResponse.json({ forms: rows });
}

export async function POST(req: Request) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  const rawBody = await req.json().catch(() => null);

  const parsed = CreateFormSchema.safeParse(rawBody);

  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ?? "invalid input";
    return jsonError(400, msg);
  }

  const { name, slug: rawSlug, description, fields } = parsed.data;

  const finalSlug = rawSlug
    ? slugify(rawSlug)
    : slugify(name);

  if (!finalSlug) return jsonError(400, "slug is invalid");

  // Use provided fields or default to email+message
  const finalFields = fields ?? DEFAULT_FIELDS;

  try {
    const id = crypto.randomUUID();

    // Atomic billing check + form insert (prevents race conditions)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const result = await insertFormIfAllowed(adminEmail, {
        id,
        name,
        slug: finalSlug,
        description: description || null,
        fields: finalFields,
      });
      if (!result.ok) {
        return jsonError(403, `Form limit reached (${result.current}/${result.max}). Upgrade your plan.`);
      }
      return NextResponse.json({ form: result.form }, { status: 201 });
    }

    // No billing enforcement — insert directly
    const [created] = await db
      .insert(forms)
      .values({
        id,
        name,
        slug: finalSlug,
        description: description || null,
        fields: finalFields,
      })
      .returning();

    return NextResponse.json({ form: created }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "23505") {
      return jsonError(409, "slug already exists");
    }

    console.error("[forms] create error"); // Never log error object (may contain sensitive data)
    return internalError();
  }
}
