// app/(dashboard)/forms/[id]/edit/page.tsx

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { FormField } from "@/lib/validation/fields";
import FormEditClient from "@/components/field-builder/FormEditClient";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default async function FormEditPage(ctx: Ctx) {
  const { id: raw } = await Promise.resolve(ctx.params);
  const id = String(raw ?? "").trim();
  if (!isUuid(id)) notFound();

  const [form] = await db
    .select()
    .from(forms)
    .where(eq(forms.id, id))
    .limit(1);

  if (!form) notFound();

  // Parse fields from DB (stored as JSON)
  const fields: FormField[] = Array.isArray(form.fields) ? form.fields : [];

  return (
    <FormEditClient
      form={{
        id: form.id,
        name: form.name,
        slug: form.slug,
        description: form.description,
        fields,
      }}
    />
  );
}
