// proxy.ts
// Auth proxy + Security headers middleware
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, isSessionValid } from "@/lib/auth/session";

function isPublicPath(pathname: string) {
  if (pathname === "/login") return true;
  if (pathname.startsWith("/api/auth/")) return true;
  return false;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // XSS protection (legacy browsers)
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // Control referrer information
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Disable DNS prefetching
  response.headers.set("X-DNS-Prefetch-Control", "off");

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // For public paths, just add security headers and continue
  if (isPublicPath(pathname)) {
    return addSecurityHeaders(NextResponse.next());
  }

  const isDashboard = pathname === "/forms" || pathname.startsWith("/forms/");
  const isAdminApi = pathname === "/api/forms" || pathname.startsWith("/api/forms/");

  // For non-protected paths, just add security headers
  if (!isDashboard && !isAdminApi) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Protected paths require authentication
  const session = await getSessionFromRequest(req);
  if (session && isSessionValid(session)) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Redirect to login for dashboard pages
  if (isDashboard) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Return 401 for API routes
  const errorResponse = NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return addSecurityHeaders(errorResponse);
}

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
