// lib/auth/requireUser.ts
import { parseSessionCookieValue, isSessionValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getCookieValue } from "@/lib/auth/cookies";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export { getCookieValue } from "@/lib/auth/cookies";

/**
 * User guard for Route Handlers.
 * - reads signed fg_session cookie
 * - checks exp
 * - verifies user exists in DB
 * Returns the user email or null if unauthorized.
 */
export async function requireUserFromRequest(req: Request): Promise<string | null> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const raw = getCookieValue(cookieHeader, SESSION_COOKIE_NAME);

  const session = await parseSessionCookieValue(raw);
  if (!session || !isSessionValid(session)) return null;

  const email = session.email.toLowerCase();

  // Verify user exists in DB
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return null;

  return email;
}
