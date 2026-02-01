// app/(dashboard)/forms/[id]/integrations/backlog/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import BacklogSettingsClient from "./BacklogSettingsClient";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

export default async function BacklogIntegrationPage(ctx: Ctx) {
  const { id: raw } = await Promise.resolve(ctx.params);
  const id = String(raw ?? "").trim();

  if (!isUuid(id)) notFound();

  const [form] = await db
    .select({
      id: forms.id,
      name: forms.name,
      slug: forms.slug,
    })
    .from(forms)
    .where(eq(forms.id, id))
    .limit(1);

  if (!form) notFound();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Backlog integration</h1>
          <div className="text-sm text-gray-600">
            {form.name} <span className="text-gray-400">/</span> /{form.slug}
          </div>
        </div>

        <Link
          href={`/forms/${form.id}`}
          className="rounded-md border px-3 py-2 text-sm"
        >
          Back
        </Link>
      </div>

      {/* Client UI */}
      <BacklogSettingsClient
        formId={form.id}
        formName={form.name}
        formSlug={form.slug}
      />
    </div>
  );
}
