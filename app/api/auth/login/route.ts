// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { generateMagicLink } from "@/lib/auth/magicLink";
import { sendMagicLinkEmail } from "@/lib/email/send";
import { jsonError } from "@/lib/http/errors";
import { getClientIp, rateLimitOrNull } from "@/lib/http/rateLimit";
import { ENV } from "@/lib/env";
import { z } from "zod";

const EmailSchema = z.object({
  email: z.email(),
});

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export async function POST(req: Request) {
  // Rate limit per IP: 10 per 10 min
  const ip = getClientIp(req);
  const ipLimited = rateLimitOrNull({
    key: `auth_login_ip:${ip}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
    addRetryAfter: true,
  });
  if (ipLimited) return ipLimited;

  const raw = await req.json().catch(() => null);
  const body = isPlainObject(raw) ? raw : {};

  const parsed = EmailSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "valid email is required");
  }

  const email = parsed.data.email.trim().toLowerCase();

  // Rate limit per email: 3 per 10 min (delegated to generateMagicLink)
  const result = await generateMagicLink(email);
  if (!result.ok) {
    // Don't reveal rate limiting per email to prevent enumeration
    // Just return success as if the email was sent
    return NextResponse.json({ ok: true });
  }

  // Build magic link URL
  const baseUrl = ENV.APP_URL;
  const magicUrl = `${baseUrl}/api/auth/verify?token=${result.token}`;

  // Send email (best-effort, never leak errors to client)
  try {
    await sendMagicLinkEmail(email, magicUrl);
  } catch {
    console.error("[auth/login] email send failed");
  }

  return NextResponse.json({ ok: true });
}
