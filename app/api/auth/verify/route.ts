// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { verifyMagicLink } from "@/lib/auth/magicLink";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  makeSessionCookieValue,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";
import { ENV } from "@/lib/env";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  const baseUrl = ENV.APP_URL;

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_link`);
  }

  const email = await verifyMagicLink(token);
  if (!email) {
    return NextResponse.redirect(`${baseUrl}/login?error=invalid_link`);
  }

  // Check if user already exists (to detect first signup)
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  const isNewUser = existing.length === 0;

  // Upsert user (first login = auto-registration)
  await db
    .insert(users)
    .values({ id: crypto.randomUUID(), email })
    .onConflictDoNothing({ target: users.email });

  // Fire-and-forget welcome email for new users
  if (isNewUser) {
    void (async () => {
      try {
        const { sendWelcomeEmail } = await import("@/lib/email/send");
        await sendWelcomeEmail(email);
      } catch {
        console.error("[auth/verify] welcome email failed");
      }
    })();
  }

  // Create session
  const res = NextResponse.redirect(`${baseUrl}/forms`);
  res.cookies.set(
    SESSION_COOKIE_NAME,
    await makeSessionCookieValue(email),
    sessionCookieOptions()
  );
  return res;
}
