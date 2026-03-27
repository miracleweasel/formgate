// lib/env.ts
export function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing env: ${name}`);
  return v;
}

export const ENV = {
  DATABASE_URL: mustEnv("DATABASE_URL"),
  APP_ENC_KEY: mustEnv("APP_ENC_KEY"),
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
};

const BILLING_ENV_KEYS = [
  "LEMONSQUEEZY_API_KEY",
  "LEMONSQUEEZY_STORE_ID",
  "LEMONSQUEEZY_VARIANT_ID",
  "APP_URL",
] as const;

/**
 * Check that all LemonSqueezy billing env vars are set.
 * Returns { ok: true } or { ok: false, missing: string[] }.
 */
export function validateBillingEnv(): { ok: true } | { ok: false; missing: string[] } {
  const missing = BILLING_ENV_KEYS.filter(
    (k) => !process.env[k] || !String(process.env[k]).trim()
  );
  if (missing.length > 0) return { ok: false, missing };
  return { ok: true };
}

/**
 * Get Resend API key. Returns null if not configured (dev mode).
 */
export function getResendApiKey(): string | null {
  const v = process.env.RESEND_API_KEY;
  return v && v.trim() ? v.trim() : null;
}

/**
 * Get email sender address.
 */
export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || "onboarding@resend.dev";
}
