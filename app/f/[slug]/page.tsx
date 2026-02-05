// app/f/[slug]/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { t } from "@/lib/i18n";
import { DEFAULT_FIELDS } from "@/lib/validation/fields";
import PublicFormClient from "./public-form-client";

// TODO: Check subscription status to hide branding for paid plans
const SHOW_BRANDING = true;

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await Promise.resolve(params);

  const rows = await db
    .select({
      id: forms.id,
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
    return (
      <main className="mx-auto max-w-xl p-6" style={{ background: "var(--color-neutral-50)" }}>
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-neutral-900)" }}>{t.errors.notFound}</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-4 min-h-screen" style={{ background: "var(--color-neutral-50)" }}>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--color-neutral-900)" }}>{form.name}</h1>
        {form.description ? (
          <p className="text-sm" style={{ color: "var(--color-neutral-600)" }}>{form.description}</p>
        ) : null}
      </header>

      <PublicFormClient
        slug={form.slug}
        fields={form.fields && form.fields.length > 0 ? form.fields : DEFAULT_FIELDS}
      />

      {SHOW_BRANDING ? (
        <footer className="pt-4 text-center">
          <Link
            href="/"
            className="text-xs transition-colors"
            style={{ color: "var(--color-neutral-400)" }}
            target="_blank"
          >
            {t.publicForm.poweredBy}
          </Link>
        </footer>
      ) : null}
    </main>
  );
}
