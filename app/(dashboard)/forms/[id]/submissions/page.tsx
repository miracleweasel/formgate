// app/(dashboard)/forms/[id]/submissions/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { db } from "@/lib/db";
import { forms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

import SubmissionsListClient from "./SubmissionsListClient";

type SearchParams = {
  debug_limit?: string | string[];
};

function pickOne(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

type SubmissionRow = {
  id: string;
  created_at: string;
  payload: Record<string, unknown>;
};

async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return "http://localhost:3000";
  return `${proto}://${host}`;
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

  const qs = new URLSearchParams();
  qs.set("limit", String(limit));

  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/forms/${id}/submissions?${qs.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API failed: ${res.status}`);

  const data = (await res.json()) as {
    items: SubmissionRow[];
    nextCursor: string | null;
  };

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">{form.name}</h1>
        <div className="text-sm text-gray-600">/{form.slug}</div>

        <div className="pt-2">
          <Link className="text-sm underline" href={`/forms/${id}`}>
            ← Back to form
          </Link>
        </div>
      </header>

      <SubmissionsListClient
        formId={id}
        initialItems={data.items ?? []}
        initialNextCursor={data.nextCursor ?? null}
        limit={limit}
      />
    </div>
  );
}
