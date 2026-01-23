// app/api/forms/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

type Ctx = { params: Promise<{ id: string }> | { id: string } };

export async function GET(_req: Request, ctx: Ctx) {
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

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id: raw } = await Promise.resolve(ctx.params);
  const id = String(raw ?? "").trim();

  if (!isUuid(id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  await db.delete(forms).where(eq(forms.id, id));
  return NextResponse.json({ ok: true });
}
