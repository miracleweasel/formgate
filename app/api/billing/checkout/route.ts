// app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import { createCheckoutUrl } from "@/lib/billing/lemonsqueezy";
import { requireUserFromRequest } from "@/lib/auth/requireUser";
import { unauthorized, internalError } from "@/lib/http/errors";
import { getClientIp, rateLimitOrNull } from "@/lib/http/rateLimit";
import { validateBillingEnv } from "@/lib/env";

export async function POST(req: Request) {
  const email = await requireUserFromRequest(req);
  if (!email) return unauthorized();

  // Best-effort rate limiting (per instance). Still useful to reduce abuse/spam.
  const ip = getClientIp(req);
  const limited = rateLimitOrNull({
    key: `billing_checkout:${ip}`,
    limit: 10,
    windowMs: 5 * 60 * 1000,
    addRetryAfter: true,
  });
  if (limited) return limited;

  // Early check: all billing env vars must be configured
  const envCheck = validateBillingEnv();
  if (!envCheck.ok) {
    console.error("[billing/checkout] Billing not configured");
    return NextResponse.json(
      { error: "Billing is not configured. Please contact the administrator." },
      { status: 503 }
    );
  }

  try {
    const url = await createCheckoutUrl(email);
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[billing/checkout] error"); // Never log error object (may contain sensitive data)
    return internalError();
  }
}
