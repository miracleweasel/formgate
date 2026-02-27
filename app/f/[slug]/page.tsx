// app/f/[slug]/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { t } from "@/lib/i18n";
import { DEFAULT_FIELDS } from "@/lib/validation/fields";
import { getSubscriptionStatus } from "@/lib/billing/subscription";
import PublicFormClient from "./public-form-client";

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
      userEmail: forms.userEmail,
    })
    .from(forms)
    .where(eq(forms.slug, slug))
    .limit(1);

  const form = rows[0];

  // Server-side branding: free plans show "Powered by FormGate"
  const ownerEmail = form?.userEmail;
  const subStatus = ownerEmail ? await getSubscriptionStatus(ownerEmail) : "inactive";
  const showBranding = subStatus !== "active";

  if (!form) {
    return (
      <main className="public-form-container">
        <div className="public-form-card text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="text-xl font-semibold mb-2" style={{ color: "var(--color-neutral-900)" }}>
            {t.errors.notFound}
          </h1>
          <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
            {t.publicForm.formNotFound}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="public-form-container">
      <div className="public-form-card">
        <header className="mb-8">
          <h1 className="public-form-title">{form.name}</h1>
          {form.description && (
            <p className="public-form-description">{form.description}</p>
          )}
        </header>

        <PublicFormClient
          slug={form.slug}
          fields={form.fields && form.fields.length > 0 ? form.fields : DEFAULT_FIELDS}
        />

        {showBranding && (
          <footer className="mt-8 pt-6 text-center" style={{ borderTop: "1px solid var(--color-neutral-100)" }}>
            <Link
              href="/"
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: "var(--color-neutral-400)" }}
              target="_blank"
            >
              {t.publicForm.poweredBy}
            </Link>
          </footer>
        )}
      </div>
    </main>
  );
}
