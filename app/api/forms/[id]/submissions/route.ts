// app/api/forms/[id]/submissions/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await Promise.resolve(params);

  // dernières 50
  const rows = await db
    .select({
      id: submissions.id,
      formId: submissions.formId,
      payload: submissions.payload,
      createdAt: submissions.createdAt,
    })
    .from(submissions)
    .where(eq(submissions.formId, id))
    .orderBy(desc(submissions.createdAt))
    .limit(50);

  return NextResponse.json({ submissions: rows });
}
