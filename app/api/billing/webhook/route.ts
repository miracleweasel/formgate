// app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { setSubscriptionStatus } from "@/lib/billing/subscription";

/**
 * Lemon Squeezy webhook hardening:
 * - Minimal payload validation (Zod)
 * - Never throw to client; respond { ok: true } on ignored/unknown events
 * - No signature verification here until we have the exact header name/format
 */

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

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
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
    console.error("[billing/webhook] handler error", e);
    return ok();
  }
}
