// app/(dashboard)/forms/[id]/submissions/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { fetchSubmissions } from "@/lib/db/queries";
import { t } from "@/lib/i18n";

import SubmissionsListClient from "./SubmissionsListClient";
import ExportCsvButtonClient from "./ExportCsvButtonClient";

type SearchParams = {
  debug_limit?: string | string[];
};

function pickOne(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function clampDebugLimit(v: string | undefined): number {
  const n = Number(v ?? "");
  if (!Number.isFinite(n) || n <= 0) return 50;
  return Math.max(1, Math.min(50, Math.floor(n)));
}

export default async function Page(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<SearchParams>;
}) {
  const { id } = await Promise.resolve(props.params);

  const sp = (await Promise.resolve(props.searchParams)) as SearchParams | undefined;
  const limit = clampDebugLimit(pickOne(sp?.debug_limit)); // default 50; test with 1

  const formRows = await db
    .select({ id: forms.id, name: forms.name, slug: forms.slug })
    .from(forms)
    .where(eq(forms.id, id))
    .limit(1);

  const form = formRows[0] ?? null;
  if (!form) notFound();

  const data = await fetchSubmissions(id, { limit });

  // Serialize Date objects to strings for the client component
  const serializedItems = data.items.map((item) => ({
    id: item.id,
    created_at: item.created_at instanceof Date ? item.created_at.toISOString() : String(item.created_at),
    payload: item.payload as Record<string, unknown>,
  }));

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <header>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "var(--color-neutral-400)" }}>
          <Link href="/forms" className="hover:underline" style={{ color: "var(--color-neutral-500)" }}>
            {t.forms.title}
          </Link>
          <span>/</span>
          <Link href={`/forms/${id}`} className="hover:underline" style={{ color: "var(--color-neutral-500)" }}>
            {form.name}
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-neutral-700)" }}>{t.submissions.title}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-header-title">{t.submissions.title}</h1>
            <div className="text-sm mt-1" style={{ color: "var(--color-neutral-400)" }}>
              {form.name} — /{form.slug}
            </div>
          </div>

          <ExportCsvButtonClient formId={id} latestLimit={limit} />
        </div>
      </header>

      <SubmissionsListClient
        formId={id}
        initialItems={serializedItems}
        initialNextCursor={data.nextCursor ?? null}
        limit={limit}
      />
    </div>
  );
}
