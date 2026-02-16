// app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { resolvePlan, getLimits } from "@/lib/billing/planLimits";
import { requireAdminFromRequest } from "@/lib/auth/requireAdmin";
import { unauthorized } from "@/lib/http/errors";
import { db } from "@/lib/db";
import { forms, submissions } from "@/lib/db/schema";
import { sql, gte } from "drizzle-orm";

export async function GET(req: Request) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    return NextResponse.json({ status: "inactive", plan: "free", usage: null, limits: null });
  }

  const status = await getSubscriptionStatus(email);
  const plan = resolvePlan(status);
  const limits = getLimits(plan);

  // Count forms
  const [formRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(forms);

  // Count submissions this month
  const now = new Date();
  const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const [subRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(submissions)
    .where(gte(submissions.createdAt, firstOfMonth));

  return NextResponse.json({
    status,
    plan,
    usage: {
      forms: formRow?.count ?? 0,
      submissionsThisMonth: subRow?.count ?? 0,
    },
    limits: {
      maxForms: limits.maxForms === Infinity ? null : limits.maxForms,
      maxSubmissionsPerMonth: limits.maxSubmissionsPerMonth === Infinity ? null : limits.maxSubmissionsPerMonth,
    },
  });
}
