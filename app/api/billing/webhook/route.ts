// app/api/billing/webhook/route.ts
import { NextResponse } from "next/server";
import { setSubscriptionStatus } from "@/lib/billing/subscription";

export async function POST(req: Request) {
  const body = await req.json();

  const event = body?.meta?.event_name;
  const data = body?.data;

  const email =
    data?.attributes?.user_email ??
    data?.attributes?.customer_email ??
    process.env.ADMIN_EMAIL;

  if (!email) {
    return NextResponse.json({ ok: true });
  }

  if (event === "subscription_created" || event === "subscription_updated") {
    await setSubscriptionStatus({
      userEmail: email,
      status: "active",
      lsSubscriptionId: data.id,
      lsCustomerId: data?.relationships?.customer?.data?.id ?? null,
    });
  }

  if (event === "subscription_cancelled" || event === "subscription_expired") {
    await setSubscriptionStatus({
      userEmail: email,
      status: "inactive",
    });
  }

  return NextResponse.json({ ok: true });
}
