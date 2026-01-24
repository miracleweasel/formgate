// app/api/forms/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { slugify } from "@/lib/forms/utils";
import { parseSessionCookieValue, isSessionValid } from "@/lib/auth/session";
import { getAdminEmail } from "@/lib/auth/admin";

function getCookieValue(cookieHeader: string, name: string) {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function requireAdmin(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const raw = getCookieValue(cookieHeader, "fg_session");
  const session = await parseSessionCookieValue(raw);
  if (!session || !isSessionValid(session)) return false;
  return session.email.toLowerCase() === getAdminEmail();
}



export async function GET(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const rows = await db.select().from(forms).orderBy(desc(forms.createdAt));
  return NextResponse.json({ forms: rows });
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({} as any));

  const name = String(body?.name ?? "").trim();
  const description = body?.description == null ? null : String(body.description);
  const rawSlug = String(body?.slug ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const slug = rawSlug ? slugify(rawSlug) : slugify(name);
  if (!slug) {
    return NextResponse.json({ error: "slug is invalid" }, { status: 400 });
  }

  try {
    const id = crypto.randomUUID();

    const [created] = await db
      .insert(forms)
      .values({
        id,
        name,
        slug,
        description: description && description.trim() ? description.trim() : null,
      })
      .returning();

    return NextResponse.json({ form: created }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "23505") {
      return NextResponse.json({ error: "slug already exists" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
