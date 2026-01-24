// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { getAdminEmail, getAdminPassword } from "@/lib/auth/admin";
import {
  makeSessionCookieValue,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

function safeLower(s: unknown) {
  return String(s ?? "").trim().toLowerCase();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));

  const email = safeLower(body?.email);
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const adminEmail = getAdminEmail();
  const adminPassword = getAdminPassword();

  // MVP: comparaison simple (pas de secret en dur, uniquement env)
  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(
    SESSION_COOKIE_NAME,
    await makeSessionCookieValue(email),
    sessionCookieOptions()
    );
    return res;

}
