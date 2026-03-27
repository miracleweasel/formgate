// lib/billing/subscription.ts
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// In-memory cache for subscription status (TTL 60s)
// Invalidated on setSubscriptionStatus() (webhook handler)
const CACHE_TTL_MS = 60_000;
const cache = new Map<string, { status: "active" | "inactive"; ts: number }>();

function invalidateCache(userEmail: string) {
  cache.delete(userEmail);
}

export async function setSubscriptionStatus(params: {
  userEmail: string;
  status: "active" | "inactive";
  lsSubscriptionId?: string | null;
  lsCustomerId?: string | null;
}) {
  const existing = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userEmail, params.userEmail))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(subscriptions).values({
      id: crypto.randomUUID(),
      userEmail: params.userEmail,
      status: params.status,
      lsSubscriptionId: params.lsSubscriptionId ?? null,
      lsCustomerId: params.lsCustomerId ?? null,
    });
  } else {
    await db
      .update(subscriptions)
      .set({
        status: params.status,
        lsSubscriptionId: params.lsSubscriptionId ?? existing[0].lsSubscriptionId,
        lsCustomerId: params.lsCustomerId ?? existing[0].lsCustomerId,
      })
      .where(eq(subscriptions.userEmail, params.userEmail));
  }

  // Invalidate cache after DB write so next read fetches fresh data
  invalidateCache(params.userEmail);
}

export async function getSubscriptionStatus(userEmail: string) {
  const now = Date.now();
  const cached = cache.get(userEmail);
  if (cached && now - cached.ts < CACHE_TTL_MS) {
    return cached.status;
  }

  const rows = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.userEmail, userEmail))
    .limit(1);

  const status = (rows[0]?.status as "active" | "inactive" | undefined) ?? "inactive";
  cache.set(userEmail, { status, ts: now });
  return status;
}
