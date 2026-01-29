// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { getAdminEmail, getAdminPassword } from "@/lib/auth/admin";
import {
  makeSessionCookieValue,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { jsonError } from "@/lib/http/errors";
import { getClientIp, rateLimitOrNull } from "@/lib/http/rateLimit";

function safeLower(s: unknown) {
  return String(s ?? "").trim().toLowerCase();
}

export async function POST(req: Request) {
  // Best-effort rate limiting (per instance). Still useful to reduce brute force.
  const ip = getClientIp(req);
  const limited = rateLimitOrNull({
    key: `auth_login:${ip}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
    addRetryAfter: true,
  });
  if (limited) return limited;

  const body = await req.json().catch(() => ({} as any));

  const email = safeLower(body?.email);
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return jsonError(400, "email and password are required");
  }

  const adminEmail = getAdminEmail();
  const adminPassword = getAdminPassword();

  // MVP: comparaison simple (env only), réponse neutre
  if (email !== adminEmail || password !== adminPassword) {
    return jsonError(401, "invalid credentials");
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    SESSION_COOKIE_NAME,
    await makeSessionCookieValue(email),
    sessionCookieOptions()
  );
  return res;
}
