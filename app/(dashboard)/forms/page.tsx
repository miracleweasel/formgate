// app/(dashboard)/forms/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { t } from "@/lib/i18n";

export default async function FormsPage() {
  const list = await db
    .select({
      id: forms.id,
      name: forms.name,
      slug: forms.slug,
      createdAt: forms.createdAt,
    })
    .from(forms)
    .orderBy(desc(forms.createdAt));

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-header-title">{t.forms.title}</h1>
        </div>
        <Link className="btn btn-primary" href="/forms/new">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t.forms.newForm}
        </Link>
      </div>

      {list.length === 0 ? (
        /* Empty state */
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="empty-state-title">{t.forms.noForms}</div>
            <div className="empty-state-text">{t.forms.noFormsHint}</div>
            <Link className="btn btn-primary" href="/forms/new">
              {t.forms.newForm}
            </Link>
          </div>
        </div>
      ) : (
        /* Grid cards */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((f) => (
            <Link
              key={f.id}
              href={`/forms/${f.id}`}
              className="card card-hover"
              style={{ textDecoration: "none" }}
            >
              <div className="font-medium text-base" style={{ color: "var(--color-neutral-800)" }}>
                {f.name}
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--color-neutral-400)" }}>
                /f/{f.slug}
              </div>
              <div className="mt-4 text-xs" style={{ color: "var(--color-neutral-400)" }}>
                {t.forms.created}: {new Date(f.createdAt).toLocaleDateString("ja-JP")}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
