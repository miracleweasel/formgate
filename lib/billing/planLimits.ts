// lib/billing/planLimits.ts
// Plan enforcement: form count + submission count per month

import { db } from "@/lib/db";
import { forms, submissions } from "@/lib/db/schema";
import { sql, and, gte } from "drizzle-orm";
import { getSubscriptionStatus } from "./subscription";

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
