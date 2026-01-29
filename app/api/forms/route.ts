// app/api/forms/route.ts
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { slugify } from "@/lib/forms/utils";
import { parseSessionCookieValue, isSessionValid } from "@/lib/auth/session";
import { getAdminEmail } from "@/lib/auth/admin";
import {
  unauthorized,
  internalError,
  jsonError,
} from "@/lib/http/errors";

import { CreateFormSchema } from "@/lib/validation/forms";

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
  if (!(await requireAdmin(req))) return unauthorized();

  const rows = await db.select().from(forms).orderBy(desc(forms.createdAt));
  return NextResponse.json({ forms: rows });
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return unauthorized();

  const rawBody = await req.json().catch(() => null);

  const parsed = CreateFormSchema.safeParse(rawBody);

  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ?? "invalid input";
    return jsonError(400, msg);
  }

  const { name, slug: rawSlug, description } = parsed.data;

  const finalSlug = rawSlug
    ? slugify(rawSlug)
    : slugify(name);

  if (!finalSlug) return jsonError(400, "slug is invalid");

  try {
    const id = crypto.randomUUID();

    const [created] = await db
      .insert(forms)
      .values({
        id,
        name,
        slug: finalSlug,
        description: description || null,
      })
      .returning();

    return NextResponse.json({ form: created }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "23505") {
      return jsonError(409, "slug already exists");
    }

    console.error("[forms] create error", e);
    return internalError();
  }
}
