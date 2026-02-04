// app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { setSubscriptionStatus } from "@/lib/billing/subscription";

/**
 * Lemon Squeezy webhook hardening:
 * - HMAC-SHA256 signature verification (X-Signature header)
 * - Minimal payload validation (Zod)
 * - Never throw to client; respond { ok: true } on ignored/unknown events
 */

function getWebhookSecret(): string | null {
  const s = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  return s && s.trim() ? s.trim() : null;
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  // Timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

const WebhookSchema = z
  .object({
    meta: z
      .object({
        event_name: z.string().min(1).max(100),
      })
      .optional(),
    data: z
      .object({
        id: z.string().min(1).max(200),
        attributes: z
          .object({
            user_email: z.string().email().optional(),
            customer_email: z.string().email().optional(),
          })
          .optional(),
        relationships: z
          .object({
            customer: z
              .object({
                data: z
                  .object({
                    id: z.string().min(1).max(200),
                  })
                  .optional()
                  .nullable(),
              })
              .optional(),
          })
          .optional(),
      })
      .optional(),
  })
  .passthrough();

function ok() {
  return NextResponse.json({ ok: true });
}

function forbidden() {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export async function POST(req: Request) {
  // 1) Verify webhook signature
  const secret = getWebhookSecret();
  if (!secret) {
    console.error("[billing/webhook] Missing LEMONSQUEEZY_WEBHOOK_SECRET");
    return forbidden();
  }

  const signature = req.headers.get("x-signature") ?? "";
  if (!signature) {
    console.error("[billing/webhook] Missing X-Signature header");
    return forbidden();
  }

  // Read raw body for signature verification
  const rawBody = await req.text().catch(() => "");
  if (!rawBody) {
    console.error("[billing/webhook] Empty body");
    return forbidden();
  }

  if (!verifySignature(rawBody, signature, secret)) {
    console.error("[billing/webhook] Invalid signature");
    return forbidden();
  }

  // 2) Parse JSON after signature verification
  let raw: unknown;
  try {
    raw = JSON.parse(rawBody);
  } catch {
    console.error("[billing/webhook] Invalid JSON");
    return ok();
  }

  const parsed = WebhookSchema.safeParse(raw);

  if (!parsed.success) {
    console.error("[billing/webhook] invalid payload", parsed.error.flatten());
    return ok();
  }

  const body = parsed.data;
  const event = body.meta?.event_name ?? null;
  const data = body.data;

  const emailCandidate =
    data?.attributes?.user_email ??
    data?.attributes?.customer_email ??
    process.env.ADMIN_EMAIL ??
    null;

  const email = emailCandidate ? String(emailCandidate).trim().toLowerCase() : null;

  if (!event) return ok();
  if (!email) return ok();

  try {
    if (event === "subscription_created" || event === "subscription_updated") {
      await setSubscriptionStatus({
        userEmail: email,
        status: "active",
        lsSubscriptionId: data?.id ?? null,
        lsCustomerId: data?.relationships?.customer?.data?.id ?? null,
      });
      return ok();
    }

    if (event === "subscription_cancelled" || event === "subscription_expired") {
      await setSubscriptionStatus({
        userEmail: email,
        status: "inactive",
      });
      return ok();
    }

    return ok();
  } catch (e) {
    console.error("[billing/webhook] handler error"); // Never log error object (may contain sensitive data)
    return ok();
  }
}
