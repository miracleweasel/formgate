// app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
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

  // Upsert user (first login = auto-registration)
  await db
    .insert(users)
    .values({ id: crypto.randomUUID(), email })
    .onConflictDoNothing({ target: users.email });

  // Create session
  const res = NextResponse.redirect(`${baseUrl}/forms`);
  res.cookies.set(
    SESSION_COOKIE_NAME,
    await makeSessionCookieValue(email),
    sessionCookieOptions()
  );
  return res;
}
