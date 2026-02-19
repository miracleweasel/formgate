// app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { resolvePlan, getLimits } from "@/lib/billing/planLimits";
import { requireUserFromRequest } from "@/lib/auth/requireUser";
import { unauthorized } from "@/lib/http/errors";
import { db } from "@/lib/db";
import { forms, submissions } from "@/lib/db/schema";
import { sql, gte, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const email = await requireUserFromRequest(req);
  if (!email) return unauthorized();

  const status = await getSubscriptionStatus(email);
  const plan = resolvePlan(status);
  const limits = getLimits(plan);

  // Count forms for this user
  const [formRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(forms)
    .where(eq(forms.userEmail, email));

  // Count submissions this month for this user's forms
  const now = new Date();
  const firstOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const userForms = await db
    .select({ id: forms.id })
    .from(forms)
    .where(eq(forms.userEmail, email));

  const formIds = userForms.map((f) => f.id);
  let subCount = 0;

  if (formIds.length > 0) {
    const [subRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(submissions)
      .where(
        sql`${submissions.formId} IN (${sql.join(formIds.map(id => sql`${id}`), sql`, `)}) AND ${submissions.createdAt} >= ${firstOfMonth}`
      );
    subCount = subRow?.count ?? 0;
  }

  return NextResponse.json({
    status,
    plan,
    usage: {
      forms: formRow?.count ?? 0,
      submissionsThisMonth: subCount,
    },
    limits: {
      maxForms: limits.maxForms === Infinity ? null : limits.maxForms,
      maxSubmissionsPerMonth: limits.maxSubmissionsPerMonth === Infinity ? null : limits.maxSubmissionsPerMonth,
    },
  });
}
