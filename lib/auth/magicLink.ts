// lib/auth/magicLink.ts
import crypto from "crypto";
import { db } from "@/lib/db";
import { magicLinks } from "@/lib/db/schema";
import { eq, and, isNull, gt, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";

const TOKEN_BYTES = 32; // 32 bytes = 64 hex chars
const LINK_EXPIRY_MINUTES = 15;
const MAX_LINKS_PER_EMAIL = 3;
const RATE_WINDOW_MINUTES = 10;

/**
 * Hash a raw token with SHA-256 for storage.
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a magic link token for the given email.
 * Returns the raw token (to be used in the magic link URL).
 * Enforces rate limit: max 3 per email per 10 minutes.
 */
export async function generateMagicLink(email: string): Promise<
  { ok: true; token: string } | { ok: false; reason: "rate_limited" }
> {
  const normalizedEmail = email.trim().toLowerCase();

  // Rate limit check: max N magic links per email in window
  const windowStart = new Date(Date.now() - RATE_WINDOW_MINUTES * 60 * 1000);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.email, normalizedEmail),
        gte(magicLinks.createdAt, windowStart)
      )
    );

  if ((countRow?.count ?? 0) >= MAX_LINKS_PER_EMAIL) {
    return { ok: false, reason: "rate_limited" };
  }

  // Generate token
  const rawToken = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + LINK_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(magicLinks).values({
    id: crypto.randomUUID(),
    email: normalizedEmail,
    tokenHash,
    expiresAt,
  });

  return { ok: true, token: rawToken };
}

/**
 * Verify a magic link token.
 * Returns the email if valid, null if invalid/expired/used.
 * Marks the token as used atomically.
 */
export async function verifyMagicLink(token: string): Promise<string | null> {
  const tokenHash = hashToken(token);
  const now = new Date();

  // Find valid, unused, non-expired token
  const rows = await db
    .select({ id: magicLinks.id, email: magicLinks.email })
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.tokenHash, tokenHash),
        isNull(magicLinks.usedAt),
        gt(magicLinks.expiresAt, now)
      )
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // Mark as used
  await db
    .update(magicLinks)
    .set({ usedAt: now })
    .where(eq(magicLinks.id, row.id));

  return row.email;
}
