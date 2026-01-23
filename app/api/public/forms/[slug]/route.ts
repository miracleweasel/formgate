// app/api/public/forms/[slug]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await Promise.resolve(params);

  const rows = await db
    .select({
      id: forms.id,
      name: forms.name,
      slug: forms.slug,
      description: forms.description,
    })
    .from(forms)
    .where(eq(forms.slug, slug))
    .limit(1);

  const form = rows[0];
  if (!form) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ form });
}
