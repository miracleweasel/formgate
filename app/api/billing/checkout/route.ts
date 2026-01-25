// app/api/billing/checkout/route.ts
import { NextResponse } from "next/server";
import { createCheckoutUrl } from "@/lib/billing/lemonsqueezy";

export async function POST() {
  const email = process.env.ADMIN_EMAIL!;
  const url = await createCheckoutUrl(email);
  return NextResponse.json({ url });
}
