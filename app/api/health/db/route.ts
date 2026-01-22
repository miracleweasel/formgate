// app/api/health/db/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const r = await db.execute("select 1 as ok");
    return NextResponse.json({ ok: true, db: r.rows?.[0]?.ok ?? 1 });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "db_error" },
      { status: 500 }
    );
  }
}
