// app/api/public/forms/[slug]/submit/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forms, submissions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Primitive = string | number | boolean | null;
type Payload = Record<string, Primitive>;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPrimitive(v: unknown): v is Primitive {
  return (
    v === null ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  );
}

function validatePayload(payload: unknown): payload is Payload {
  if (!isPlainObject(payload)) return false;

  const keys = Object.keys(payload);
  if (keys.length === 0) return true; // autorisé (mais UI impose message)
  if (keys.length > 50) return false;

  for (const k of keys) {
    const value = (payload as Record<string, unknown>)[k];
    if (!isPrimitive(value)) return false;
  }
  return true;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await Promise.resolve(params);

  // 1) form exists?
  const formRows = await db
    .select({ id: forms.id })
    .from(forms)
    .where(eq(forms.slug, slug))
    .limit(1);

  const form = formRows[0];
  if (!form) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 2) parse body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = (body as any)?.payload;
  if (!validatePayload(payload)) {
    return NextResponse.json(
      { error: "Invalid payload (object, <=50 keys, primitive values only)" },
      { status: 400 }
    );
  }

  // 3) create submission
  const submissionId = crypto.randomUUID();

  await db.insert(submissions).values({
    id: submissionId,
    formId: form.id,
    payload,
  });

  return NextResponse.json({ ok: true, submissionId });
}
