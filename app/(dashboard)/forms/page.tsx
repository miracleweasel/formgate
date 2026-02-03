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
        <h1 className="text-xl font-semibold">{t.forms.title}</h1>
        <Link className="px-3 py-2 rounded-md bg-black text-white text-sm" href="/forms/new">
          {t.forms.newForm}
        </Link>
      </div>

      <div className="rounded-md border">
        <ul className="divide-y">
          {list.length === 0 ? (
            <li className="p-4 text-sm text-gray-600">{t.forms.noForms}</li>
          ) : (
            list.map((f) => (
              <li key={f.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-sm text-gray-600">/{f.slug}</div>
                </div>
                <Link className="text-sm underline" href={`/forms/${f.id}`}>
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
