// app/api/health/cleanup/route.ts
import { NextResponse } from "next/server";
import { cleanupExpiredLinks } from "@/lib/auth/magicLink";

export async function POST() {
  const deleted = await cleanupExpiredLinks();
  return NextResponse.json({ ok: true, deleted });
}
