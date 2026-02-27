// lib/auth/getSessionEmail.ts
// Server component utility: read session email from cookie
import { cookies } from "next/headers";
import {
  parseSessionCookieValue,
  isSessionValid,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get the authenticated user's email from the session cookie.
 * For use in server components only.
 * Returns null if not authenticated or user not found in DB.
 */
export async function getSessionEmail(): Promise<string | null> {
  const cookieStore = await Promise.resolve(cookies());
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

  const session = await parseSessionCookieValue(sessionCookie);
  if (!session || !isSessionValid(session)) return null;

  const email = session.email.toLowerCase();

  // Verify user exists
  const [user] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return null;

  return email;
}
