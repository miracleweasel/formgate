// lib/billing/planLimits.ts
// Plan enforcement: form count + submission count per month

import { db } from "@/lib/db";
import { forms, submissions } from "@/lib/db/schema";
import { sql, gte } from "drizzle-orm";
import { getSubscriptionStatus } from "./subscription";
import type { FormField } from "@/lib/validation/fields";

export type PlanId = "free" | "starter" | "pro" | "enterprise";

export type PlanLimits = {
  maxForms: number;
  maxSubmissionsPerMonth: number;
};

const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: { maxForms: 1, maxSubmissionsPerMonth: 50 },
  starter: { maxForms: 5, maxSubmissionsPerMonth: 500 },
  pro: { maxForms: Infinity, maxSubmissionsPerMonth: 5000 },
  enterprise: { maxForms: Infinity, maxSubmissionsPerMonth: Infinity },
};

/**
 * Resolve current plan from subscription status.
 * MVP: active = starter, inactive = free.
 * TODO: store plan tier in subscription table for pro/enterprise.
 */
export function resolvePlan(subStatus: "active" | "inactive"): PlanId {
  return subStatus === "active" ? "starter" : "free";
}

export function getLimits(plan: PlanId): PlanLimits {
  return PLAN_LIMITS[plan];
}

/**
 * Check if the admin can create another form.
 * Returns { allowed: true } or { allowed: false, current, max }.
 */
export async function canCreateForm(adminEmail: string): Promise<
  { allowed: true } | { allowed: false; current: number; max: number }
> {
  const status = await getSubscriptionStatus(adminEmail);
  const plan = resolvePlan(status);
  const limits = getLimits(plan);

  if (limits.maxForms === Infinity) return { allowed: true };

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(forms);

  const current = row?.count ?? 0;

  if (current >= limits.maxForms) {
    return { allowed: false, current, max: limits.maxForms };
  }

  return { allowed: true };
}

/**
 * Check if a form can accept another submission this month.
 * Returns { allowed: true } or { allowed: false, current, max }.
 */
export async function canSubmit(adminEmail: string): Promise<
  { allowed: true } | { allowed: false; current: number; max: number }
> {
  const status = await getSubscriptionStatus(adminEmail);
  const plan = resolvePlan(status);
  const limits = getLimits(plan);

  if (limits.maxSubmissionsPerMonth === Infinity) return { allowed: true };

  // Count submissions this month (UTC first day of month)
  const now = new Date();
  const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(submissions)
    .where(gte(submissions.createdAt, firstOfMonth));

  const current = row?.count ?? 0;

  if (current >= limits.maxSubmissionsPerMonth) {
    return { allowed: false, current, max: limits.maxSubmissionsPerMonth };
  }

  return { allowed: true };
}

/**
 * Atomically check submission limit AND insert in a single transaction.
 * Prevents race conditions where N concurrent requests all pass the check.
 * Returns { ok: true } or { ok: false, reason } on limit exceeded.
 */
export async function insertSubmissionIfAllowed(
  adminEmail: string,
  values: { id: string; formId: string; payload: Record<string, unknown> }
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const status = await getSubscriptionStatus(adminEmail);
  const plan = resolvePlan(status);
  const limits = getLimits(plan);

  // Unlimited plan — skip transaction overhead
  if (limits.maxSubmissionsPerMonth === Infinity) {
    await db.insert(submissions).values(values);
    return { ok: true };
  }

  return await db.transaction(async (tx) => {
    const now = new Date();
    const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [row] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(submissions)
      .where(gte(submissions.createdAt, firstOfMonth));

    const current = row?.count ?? 0;

    if (current >= limits.maxSubmissionsPerMonth) {
      return { ok: false as const, reason: "Monthly submission limit reached" };
    }

    await tx.insert(submissions).values(values);
    return { ok: true as const };
  });
}

/**
 * Atomically check form limit AND insert in a single transaction.
 * Prevents race conditions on concurrent form creation.
 */
export async function insertFormIfAllowed(
  adminEmail: string,
  values: { id: string; name: string; slug: string; description: string | null; fields: FormField[] }
): Promise<{ ok: true; form: typeof forms.$inferSelect } | { ok: false; current: number; max: number }> {
  const status = await getSubscriptionStatus(adminEmail);
  const plan = resolvePlan(status);
  const limits = getLimits(plan);

  // Unlimited plan — skip transaction overhead
  if (limits.maxForms === Infinity) {
    const [form] = await db.insert(forms).values(values).returning();
    return { ok: true, form };
  }

  return await db.transaction(async (tx) => {
    const [row] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(forms);

    const current = row?.count ?? 0;

    if (current >= limits.maxForms) {
      return { ok: false as const, current, max: limits.maxForms };
    }

    const [form] = await tx.insert(forms).values(values).returning();
    return { ok: true as const, form };
  });
}
