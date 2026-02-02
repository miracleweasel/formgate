// lib/auth/requireAdmin.ts
import { parseSessionCookieValue, isSessionValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getAdminEmail } from "@/lib/auth/admin";

function getCookieValue(cookieHeader: string, name: string) {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Admin guard for Route Handlers.
 * - reads signed fg_session cookie
 * - checks exp
 * - compares to ADMIN_EMAIL (via getAdminEmail)
 */
export async function requireAdminFromRequest(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const raw = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);

  const session = await parseSessionCookieValue(raw);
  if (!session || !isSessionValid(session)) return false;

  const adminEmail = await getAdminEmail();
  if (!adminEmail) return false;

  return session.email.toLowerCase() === adminEmail.toLowerCase();
}
