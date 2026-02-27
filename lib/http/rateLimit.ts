// lib/http/rateLimit.ts
import { NextResponse } from "next/server";

/**
 * Best-effort in-memory rate limiter.
 * - Works reliably only on single-instance deployments.
 * - On serverless / multi-instance, this is per-instance (not global).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function nowMs() {
  return Date.now();
}

function cleanupSome(max = 200) {
  // Small opportunistic cleanup to avoid unbounded growth
  const t = nowMs();
  let i = 0;
  for (const [k, b] of buckets) {
    if (b.resetAt <= t) buckets.delete(k);
    if (++i >= max) break;
  }
}

export type RateLimitOptions = {
  key: string;          // bucket key (e.g. "login:ip:1.2.3.4")
  limit: number;        // max requests per window
  windowMs: number;     // window duration
  status?: number;      // default 429
  message?: string;     // default "rate_limited"
  addRetryAfter?: boolean; // add Retry-After header
};

export function rateLimitOrNull(opts: RateLimitOptions): NextResponse | null {
  cleanupSome();

  const status = opts.status ?? 429;
  const message = opts.message ?? "rate_limited";

  const t = nowMs();
  const existing = buckets.get(opts.key);

  if (!existing || existing.resetAt <= t) {
    buckets.set(opts.key, { count: 1, resetAt: t + opts.windowMs });
    return null;
  }

  existing.count += 1;
  if (existing.count <= opts.limit) return null;

  const res = NextResponse.json({ error: message }, { status });

  if (opts.addRetryAfter) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - t) / 1000));
    res.headers.set("Retry-After", String(retryAfterSec));
  }

  return res;
}

/**
 * Best-effort "client identity".
 *
 * SECURITY: Only trust proxy headers if TRUSTED_PROXY=1 is set.
 * Without this, attackers can spoof X-Forwarded-For to bypass rate limits.
 * On platforms like Vercel/Cloudflare, the platform sets the real IP
 * and you should enable TRUSTED_PROXY=1.
 *
 * Fallback chain: x-real-ip (safer, set by reverse proxies) -> x-forwarded-for -> "unknown"
 */
export function getClientIp(req: Request): string {
  const trustProxy = process.env.TRUSTED_PROXY === "1";

  if (trustProxy) {
    // x-real-ip is typically set by the outermost proxy (harder to spoof)
    const xrip = req.headers.get("x-real-ip");
    if (xrip) return xrip.trim();

    const xff = req.headers.get("x-forwarded-for");
    if (xff) {
      // Take LAST IP in the chain (closest to our server, added by our proxy)
      // NOT the first (which the client controls)
      const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1];
    }
  }

  // Without TRUSTED_PROXY, don't trust any proxy headers.
  // Use a hash of available headers as fingerprint (best-effort).
  const ua = req.headers.get("user-agent") ?? "";
  const accept = req.headers.get("accept-language") ?? "";
  // This is imperfect but prevents trivial header spoofing.
  return `fp:${simpleHash(ua + accept)}`;
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}
