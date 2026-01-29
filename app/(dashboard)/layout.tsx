// app/(dashboard)/layout.tsx
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { parseSessionCookieValue, isSessionValid } from "@/lib/auth/session";
import { getAdminEmail } from "@/lib/auth/admin";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Next 16: cookies() may be async depending on runtime; await is safe
  const cookieStore = await cookies();
  const raw = cookieStore.get("fg_session")?.value ?? null;

  const session = await parseSessionCookieValue(raw);
  const ok =
    !!session &&
    isSessionValid(session) &&
    session.email.toLowerCase() === getAdminEmail();

  if (!ok) {
    // No leakage: always redirect to login for dashboard area
    redirect("/login");
  }

  return <>{children}</>;
}
