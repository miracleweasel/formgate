// app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import { createCheckoutUrl } from "@/lib/billing/lemonsqueezy";
import {
  parseSessionCookieValue,
  isSessionValid,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { getAdminEmail } from "@/lib/auth/admin";
import { unauthorized, internalError } from "@/lib/http/errors";
import { getClientIp, rateLimitOrNull } from "@/lib/http/rateLimit";

function getCookieValue(cookieHeader: string, name: string) {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

async function requireAdmin(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const raw = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);

  const session = await parseSessionCookieValue(raw);
  if (!session || !isSessionValid(session)) return false;

  const adminEmail = await getAdminEmail();
  if (!adminEmail) return false;

  return session.email.toLowerCase() === adminEmail.toLowerCase();
}

export async function POST(req: Request) {
  if (!(await requireAdmin(req))) return unauthorized();

  // Best-effort rate limiting (per instance). Still useful to reduce abuse/spam.
  const ip = getClientIp(req);
  const limited = rateLimitOrNull({
    key: `billing_checkout:${ip}`,
    limit: 10,
    windowMs: 5 * 60 * 1000,
    addRetryAfter: true,
  });
  if (limited) return limited;

  try {
    // On prend l'email admin “source de vérité” (même que l’auth)
    const email = await getAdminEmail();
    if (!email || !email.trim()) {
      console.error("[billing/checkout] Missing ADMIN_EMAIL env var");
      return internalError();
    }

    const url = await createCheckoutUrl(email.trim());
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[billing/checkout] error", e);
    return internalError();
  }
}
