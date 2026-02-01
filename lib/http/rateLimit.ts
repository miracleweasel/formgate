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
 * - Prefer x-forwarded-for first IP when present, fallback to "unknown".
 * - This is imperfect but acceptable for best-effort limiting.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const xrip = req.headers.get("x-real-ip");
  if (xrip) return xrip.trim();
  return "unknown";
}
