// lib/auth/requireAdmin.ts
import { getAdminEmail } from "@/lib/auth/admin";
import { parseSessionCookieValue, isSessionValid } from "@/lib/auth/session";
import { normalizeEmail } from "@/lib/backlog/validators";

function getCookieValue(cookieHeader: string, name: string) {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export async function requireAdminFromRequest(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const raw = getCookieValue(cookieHeader, "fg_session");

  const session = await parseSessionCookieValue(raw);
  if (!session || !isSessionValid(session)) return false;

  const adminEmail = await getAdminEmail();
  if (!adminEmail) return false;

  return normalizeEmail(session.email) === normalizeEmail(adminEmail);
}
