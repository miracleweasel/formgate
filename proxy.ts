// proxy.ts
// Auth proxy + Security headers + CSRF protection middleware
import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, isSessionValid } from "@/lib/auth/session";

function isPublicPath(pathname: string) {
  if (pathname === "/login") return true;
  if (pathname === "/") return true;
  if (pathname.startsWith("/api/auth/")) return true;
  // Public form page and API
  if (pathname.startsWith("/f/")) return true;
  if (pathname.startsWith("/api/public/")) return true;
  // Billing webhook (verified by HMAC signature, not session)
  if (pathname === "/api/billing/webhook") return true;
  // Health check
  if (pathname.startsWith("/api/health/")) return true;
  return false;
}

function isAdminPath(pathname: string) {
  // Dashboard pages
  if (pathname === "/forms" || pathname.startsWith("/forms/")) return true;
  if (pathname === "/billing" || pathname.startsWith("/billing/")) return true;
  if (pathname === "/settings" || pathname.startsWith("/settings/")) return true;
  // Admin API routes
  if (pathname === "/api/forms" || pathname.startsWith("/api/forms/")) return true;
  if (pathname.startsWith("/api/integrations/")) return true;
  if (pathname.startsWith("/api/billing/")) return true;
  return false;
}

function isMutationMethod(method: string) {
  return method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://plausible.io",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://plausible.io https://*.ingest.sentry.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

/**
 * CSRF origin check for mutation requests.
 * Compares Origin (or Referer) header to our host.
 * This blocks cross-origin form posts and fetch requests from other sites.
 */
function checkCsrfOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  if (!host) return false;

  // Check Origin header first (most reliable)
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      return originHost === host;
    } catch {
      return false;
    }
  }

  // Fallback to Referer
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      return refererHost === host;
    } catch {
      return false;
    }
  }

  // No Origin/Referer: could be same-origin non-browser request (curl, etc.)
  // For API routes with JSON content-type, this is generally safe
  // because browsers cannot send JSON via form submissions.
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) return true;

  // Block if no origin info and not JSON (could be form-based CSRF)
  return false;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths: add security headers, no auth needed
  if (isPublicPath(pathname)) {
    // CSRF check on public mutation endpoints (e.g., form submissions)
    if (isMutationMethod(req.method) && !pathname.startsWith("/api/auth/") && pathname !== "/api/billing/webhook") {
      if (!checkCsrfOrigin(req)) {
        const res = NextResponse.json({ error: "forbidden" }, { status: 403 });
        return addSecurityHeaders(res);
      }
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // Admin paths: require session + CSRF check on mutations
  if (isAdminPath(pathname)) {
    const session = await getSessionFromRequest(req);
    if (!session || !isSessionValid(session)) {
      // Dashboard pages: redirect to login
      if (!pathname.startsWith("/api/")) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
      // API routes: 401
      const res = NextResponse.json({ error: "unauthorized" }, { status: 401 });
      return addSecurityHeaders(res);
    }

    // CSRF origin check on mutations
    if (isMutationMethod(req.method)) {
      if (!checkCsrfOrigin(req)) {
        const res = NextResponse.json({ error: "forbidden" }, { status: 403 });
        return addSecurityHeaders(res);
      }
    }

    return addSecurityHeaders(NextResponse.next());
  }

  // Everything else: security headers
  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
