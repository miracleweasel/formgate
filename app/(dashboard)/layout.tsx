// app/(dashboard)/layout.tsx

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAdminEmail } from "@/lib/auth/admin";
import {
  isSessionValid,
  parseSessionCookieValue,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await Promise.resolve(cookies());

  // ✅ bon nom de cookie: fg_session
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

  // ✅ parseSessionCookieValue est async
  const session = await parseSessionCookieValue(sessionCookie);

  const adminEmail = await getAdminEmail();

  const ok =
    !!session &&
    isSessionValid(session) &&
    !!adminEmail &&
    session.email.toLowerCase() === adminEmail.toLowerCase();

  if (!ok) {
    redirect("/login");
  }

  return <>{children}</>;
}
