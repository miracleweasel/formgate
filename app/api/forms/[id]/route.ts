// app/api/forms/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminFromRequest } from "@/lib/auth/requireAdmin";
import { unauthorized, jsonError, internalError } from "@/lib/http/errors";
import { UpdateFormSchema } from "@/lib/validation/forms";
import { slugify } from "@/lib/forms/utils";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

type Ctx = { params: Promise<{ id: string }> | { id: string } };

export async function GET(req: Request, ctx: Ctx) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();
  const { id: raw } = await Promise.resolve(ctx.params);
  const id = String(raw ?? "").trim();

  if (!isUuid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const [row] = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
  if (!row) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ form: row });
}

export async function DELETE(req: Request, ctx: Ctx) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();
  const { id: raw } = await Promise.resolve(ctx.params);
  const id = String(raw ?? "").trim();

  if (!isUuid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await db.delete(forms).where(eq(forms.id, id));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, ctx: Ctx) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();
  const { id: raw } = await Promise.resolve(ctx.params);
  const id = String(raw ?? "").trim();

  if (!isUuid(id)) {
    return jsonError(400, "invalid id");
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = UpdateFormSchema.safeParse(rawBody);

  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "invalid input";
    return jsonError(400, msg);
  }

  const updates: Partial<typeof forms.$inferInsert> = {};

  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.description !== undefined) {
    updates.description = parsed.data.description || null;
  }
  if (parsed.data.fields !== undefined) updates.fields = parsed.data.fields;

  // Handle slug change with conflict check
  if (parsed.data.slug !== undefined) {
    const slugified = slugify(parsed.data.slug);
    if (!slugified) return jsonError(400, "invalid slug");
    updates.slug = slugified;
  }

  if (Object.keys(updates).length === 0) {
    return jsonError(400, "no fields to update");
  }

  try {
    const [updated] = await db
      .update(forms)
      .set(updates)
      .where(eq(forms.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ form: updated });
  } catch (e: any) {
    if (e?.code === "23505") {
      return jsonError(409, "slug already exists");
    }
    console.error("[forms] update error");
    return internalError();
  }
}
