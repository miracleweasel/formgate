// app/api/billing/portal/route.ts
import { NextResponse } from "next/server";
import { requireAdminFromRequest } from "@/lib/auth/requireAdmin";
import { unauthorized, internalError } from "@/lib/http/errors";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCustomerPortalUrl } from "@/lib/billing/lemonsqueezy";

export async function POST(req: Request) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const [sub] = await db
    .select({ lsSubscriptionId: subscriptions.lsSubscriptionId })
    .from(subscriptions)
    .where(eq(subscriptions.userEmail, email))
    .limit(1);

  if (!sub?.lsSubscriptionId) {
    return NextResponse.json({ error: "No active subscription" }, { status: 404 });
  }

  try {
    const url = await getCustomerPortalUrl(sub.lsSubscriptionId);
    if (!url) {
      return NextResponse.json({ error: "Portal unavailable" }, { status: 502 });
    }
    return NextResponse.json({ url });
  } catch {
    console.error("[billing/portal] error");
    return internalError();
  }
}
