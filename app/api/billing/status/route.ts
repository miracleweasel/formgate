// app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/billing/subscription";

export async function GET() {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    return NextResponse.json({ status: "inactive" }, { status: 200 });
  }
  const status = await getSubscriptionStatus(email);
  return NextResponse.json({ status });
}
