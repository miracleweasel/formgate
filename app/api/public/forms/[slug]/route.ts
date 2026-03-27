// app/api/public/forms/[slug]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getClientIp, rateLimitOrNull } from "@/lib/http/rateLimit";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limit: 30 reads per minute per IP (anti-enumeration)
  const ip = getClientIp(req);
  const limited = rateLimitOrNull({
    key: `public_form_read:${ip}`,
    limit: 30,
    windowMs: 60 * 1000,
    addRetryAfter: true,
  });
  if (limited) return limited;

  const { slug } = await Promise.resolve(params);

  // Validate slug format before hitting DB
  if (!slug || slug.length > 200 || !/^[a-z0-9-]+$/i.test(slug)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await db
    .select({
      name: forms.name,
      slug: forms.slug,
      description: forms.description,
      fields: forms.fields,
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
