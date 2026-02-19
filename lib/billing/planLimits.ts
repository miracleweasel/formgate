// lib/billing/planLimits.ts
// Plan enforcement: form count + submission count per month (scoped per user)

import { db } from "@/lib/db";
import { forms, submissions } from "@/lib/db/schema";
import { sql, gte, eq, inArray } from "drizzle-orm";
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
 * Check if a user can create another form.
 * Scoped to forms owned by this user.
 */
export async function canCreateForm(userEmail: string): Promise<
  { allowed: true } | { allowed: false; current: number; max: number }
> {
  const status = await getSubscriptionStatus(userEmail);
  const plan = resolvePlan(status);
  const limits = getLimits(plan);

  if (limits.maxForms === Infinity) return { allowed: true };

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(forms)
    .where(eq(forms.userEmail, userEmail));

  const current = row?.count ?? 0;

  if (current >= limits.maxForms) {
    return { allowed: false, current, max: limits.maxForms };
  }

  return { allowed: true };
}

/**
 * Check if a user can accept another submission this month.
 * Counts submissions across all forms owned by this user.
 */
export async function canSubmit(userEmail: string): Promise<
  { allowed: true } | { allowed: false; current: number; max: number }
> {
  const status = await getSubscriptionStatus(userEmail);
  const plan = resolvePlan(status);
  const limits = getLimits(plan);

  if (limits.maxSubmissionsPerMonth === Infinity) return { allowed: true };

  // Count submissions this month for this user's forms
  const now = new Date();
  const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  // Get user's form IDs
  const userForms = await db
    .select({ id: forms.id })
    .from(forms)
    .where(eq(forms.userEmail, userEmail));

  const formIds = userForms.map((f) => f.id);
  if (formIds.length === 0) return { allowed: true };

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(submissions)
    .where(
      sql`${submissions.formId} IN (${sql.join(formIds.map(id => sql`${id}`), sql`, `)}) AND ${submissions.createdAt} >= ${firstOfMonth}`
    );

  const current = row?.count ?? 0;

  if (current >= limits.maxSubmissionsPerMonth) {
    return { allowed: false, current, max: limits.maxSubmissionsPerMonth };
  }

  return { allowed: true };
}

/**
 * Atomically check submission limit AND insert in a single transaction.
 * Prevents race conditions where N concurrent requests all pass the check.
 */
export async function insertSubmissionIfAllowed(
  userEmail: string,
  values: { id: string; formId: string; payload: Record<string, unknown> }
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const status = await getSubscriptionStatus(userEmail);
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

    // Get user's form IDs
    const userForms = await tx
      .select({ id: forms.id })
      .from(forms)
      .where(eq(forms.userEmail, userEmail));

    const formIds = userForms.map((f) => f.id);

    let current = 0;
    if (formIds.length > 0) {
      const [row] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(submissions)
        .where(
          sql`${submissions.formId} IN (${sql.join(formIds.map(id => sql`${id}`), sql`, `)}) AND ${submissions.createdAt} >= ${firstOfMonth}`
        );
      current = row?.count ?? 0;
    }

    if (current >= limits.maxSubmissionsPerMonth) {
      return { ok: false as const, reason: "Monthly submission limit reached" };
    }

    await tx.insert(submissions).values(values);
    return { ok: true as const };
  });
}

/**
 * Atomically check form limit AND insert in a single transaction.
 * Scoped to forms owned by this user.
 */
export async function insertFormIfAllowed(
  userEmail: string,
  values: { id: string; name: string; slug: string; description: string | null; fields: FormField[]; userEmail: string }
): Promise<{ ok: true; form: typeof forms.$inferSelect } | { ok: false; current: number; max: number }> {
  const status = await getSubscriptionStatus(userEmail);
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
      .from(forms)
      .where(eq(forms.userEmail, userEmail));

    const current = row?.count ?? 0;

    if (current >= limits.maxForms) {
      return { ok: false as const, current, max: limits.maxForms };
    }

    const [form] = await tx.insert(forms).values(values).returning();
    return { ok: true as const, form };
  });
}
