// app/api/billing/status/route.ts
import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import { requireAdminFromRequest } from "@/lib/auth/requireAdmin";
import { unauthorized } from "@/lib/http/errors";

export async function GET(req: Request) {
  if (!(await requireAdminFromRequest(req))) return unauthorized();

  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    return NextResponse.json({ status: "inactive" }, { status: 200 });
  }
  const status = await getSubscriptionStatus(email);
  return NextResponse.json({ status });
}
