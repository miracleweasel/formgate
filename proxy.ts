// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, isSessionValid } from "@/lib/auth/session";

function isPublicPath(pathname: string) {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/api/auth/")) return true;
  return false;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicPath(pathname)) return NextResponse.next();

  const isDashboard = pathname === "/forms" || pathname.startsWith("/forms/");
  const isAdminApi = pathname === "/api/forms" || pathname.startsWith("/api/forms/");

  if (!isDashboard && !isAdminApi) return NextResponse.next();

  const session = await getSessionFromRequest(req);
  if (session && isSessionValid(session)) return NextResponse.next();

  if (isDashboard) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

export const config = {
  matcher: ["/forms/:path*", "/api/forms/:path*"],
};
