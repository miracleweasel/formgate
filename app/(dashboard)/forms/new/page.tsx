// app/(dashboard)/forms/page.tsx
import Link from "next/link";

type Form = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

async function getForms(): Promise<Form[]> {
  // Same-origin fetch côté serveur : marche en dev/prod
  const res = await fetch("http://localhost:3000/api/forms", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.forms ?? [];
}

export default async function FormsPage() {
  const forms = await getForms();

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
          {forms.length === 0 ? (
            <li className="p-4 text-sm text-gray-600">No forms yet.</li>
          ) : (
            forms.map((f) => (
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
