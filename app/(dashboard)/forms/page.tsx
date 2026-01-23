// app/(dashboard)/forms/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

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
        <h1 className="text-xl font-semibold">Forms</h1>
        <Link className="px-3 py-2 rounded-md bg-black text-white text-sm" href="/forms/new">
          New form
        </Link>
      </div>

      <div className="rounded-md border">
        <ul className="divide-y">
          {list.length === 0 ? (
            <li className="p-4 text-sm text-gray-600">No forms yet.</li>
          ) : (
            list.map((f) => (
              <li key={f.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-sm text-gray-600">/{f.slug}</div>
                </div>
                <Link className="text-sm underline" href={`/forms/${f.id}`}>
                  View
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
