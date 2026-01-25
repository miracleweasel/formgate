// lib/billing/subscription.ts
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status: params.status,
      lsSubscriptionId: params.lsSubscriptionId ?? existing[0].lsSubscriptionId,
      lsCustomerId: params.lsCustomerId ?? existing[0].lsCustomerId,
    })
    .where(eq(subscriptions.userEmail, params.userEmail));
}

export async function getSubscriptionStatus(userEmail: string) {
  const rows = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.userEmail, userEmail))
    .limit(1);

  return (rows[0]?.status as "active" | "inactive" | undefined) ?? "inactive";
}
