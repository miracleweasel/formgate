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
    })
    .from(forms)
    .orderBy(desc(forms.createdAt));

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-neutral-900)" }}>{t.forms.title}</h1>
        <Link className="btn btn-primary" href="/forms/new">
          {t.forms.newForm}
        </Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <ul className="divide-y" style={{ borderColor: "var(--color-neutral-200)" }}>
          {list.length === 0 ? (
            <li className="p-4 text-sm" style={{ color: "var(--color-neutral-600)" }}>{t.forms.noForms}</li>
          ) : (
            list.map((f) => (
              <li key={f.id} className="p-4 flex items-center justify-between" style={{ borderColor: "var(--color-neutral-200)" }}>
                <div>
                  <div className="font-medium" style={{ color: "var(--color-neutral-800)" }}>{f.name}</div>
                  <div className="text-sm" style={{ color: "var(--color-neutral-500)" }}>/{f.slug}</div>
                </div>
                <Link className="btn btn-secondary btn-sm" href={`/forms/${f.id}`}>
                  {t.common.view}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
