// app/(dashboard)/forms/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { forms, submissions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { t } from "@/lib/i18n";
import DeleteButton from "./DeleteButton";
import CopyUrlButton from "./CopyUrlButton";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default async function FormDetailPage(ctx: Ctx) {
  const { id: raw } = await Promise.resolve(ctx.params);
  const id = String(raw ?? "").trim();
  if (!isUuid(id)) notFound();

  // Form
  const [form] = await db
    .select()
    .from(forms)
    .where(eq(forms.id, id))
    .limit(1);

  if (!form) notFound();

  // Recent submissions (last 10)
  const recent = await db
    .select({
      id: submissions.id,
      payload: submissions.payload,
      createdAt: submissions.createdAt,
    })
    .from(submissions)
    .where(eq(submissions.formId, id))
    .orderBy(desc(submissions.createdAt))
    .limit(10);

  const publicPath = `/f/${form.slug}`;
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const appUrl = process.env.APP_URL || `${proto}://${host}`;
  const fullPublicUrl = `${appUrl}${publicPath}`;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8">
      {/* Breadcrumb + Header */}
      <div>
        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: "var(--color-neutral-400)" }}>
          <Link href="/forms" className="hover:underline" style={{ color: "var(--color-neutral-500)" }}>
            {t.forms.title}
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-neutral-700)" }}>{form.name}</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="page-header-title">{form.name}</h1>
            <div className="text-sm mt-1" style={{ color: "var(--color-neutral-400)" }}>/{form.slug}</div>
          </div>

          <div className="flex gap-2">
            <Link href={`/forms/${form.id}/edit`} className="btn btn-secondary btn-sm">
              {t.common.edit}
            </Link>
            <DeleteButton id={form.id} />
          </div>
        </div>
      </div>

      {/* Public URL */}
      <div className="card" style={{ padding: "var(--space-5) var(--space-6)" }}>
        <div className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: "var(--color-neutral-400)" }}>
          {t.forms.publicUrl}
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex-1 text-sm font-mono px-3 py-2 rounded-lg overflow-x-auto"
            style={{ background: "var(--color-neutral-50)", color: "var(--color-accent-600)", border: "1px solid var(--color-neutral-150)" }}
          >
            {fullPublicUrl}
          </div>
          <CopyUrlButton url={fullPublicUrl} />
          <Link
            href={publicPath}
            target="_blank"
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {t.forms.openPreview}
          </Link>
        </div>
      </div>

      {/* Infos */}
      <div className="card space-y-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-neutral-400)" }}>{t.forms.description}</div>
          <div className="text-sm mt-1" style={{ color: "var(--color-neutral-700)" }}>{form.description ?? "—"}</div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-neutral-400)" }}>{t.forms.created}</div>
            <div className="text-sm mt-1" style={{ color: "var(--color-neutral-700)" }}>
              {new Date(form.createdAt).toLocaleString("ja-JP")}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-neutral-400)" }}>{t.forms.updated}</div>
            <div className="text-sm mt-1" style={{ color: "var(--color-neutral-700)" }}>
              {new Date(form.updatedAt).toLocaleString("ja-JP")}
            </div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-neutral-800)" }}>{t.integrations.title}</h2>

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm">
            <div className="font-medium" style={{ color: "var(--color-neutral-700)" }}>{t.integrations.backlog.title}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-neutral-500)" }}>
              {t.integrations.backlog.description}
            </div>
          </div>

          <Link
            href={`/forms/${form.id}/integrations/backlog`}
            className="btn btn-secondary btn-sm"
          >
            {t.integrations.backlog.configure}
          </Link>
        </div>
      </section>

      {/* Recent submissions */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>{t.submissions.recent}</h2>
          {recent.length > 0 && (
            <Link href={`/forms/${form.id}/submissions`} className="btn btn-tertiary btn-sm">
              {t.common.view} →
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-neutral-500)" }}>{t.submissions.noSubmissions}</p>
        ) : (
          /* Table view */
          <div className="overflow-x-auto" style={{ margin: "0 calc(var(--space-8) * -1)", padding: "0 var(--space-8)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-neutral-150)" }}>
                  <th className="text-left py-2 pr-4 font-medium text-xs uppercase tracking-wide" style={{ color: "var(--color-neutral-400)" }}>
                    {t.submissions.date}
                  </th>
                  <th className="text-left py-2 pr-4 font-medium text-xs uppercase tracking-wide" style={{ color: "var(--color-neutral-400)" }}>
                    {t.submissions.email}
                  </th>
                  <th className="text-left py-2 font-medium text-xs uppercase tracking-wide" style={{ color: "var(--color-neutral-400)" }}>
                    {t.submissions.message}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => {
                  const payload = (s.payload ?? {}) as Record<string, any>;
                  const email = payload.email ?? "—";
                  const message = payload.message ?? "—";

                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--color-neutral-100)" }}>
                      <td className="py-3 pr-4 whitespace-nowrap" style={{ color: "var(--color-neutral-500)" }}>
                        {s.createdAt
                          ? new Date(s.createdAt as any).toLocaleString("ja-JP")
                          : "—"}
                      </td>
                      <td className="py-3 pr-4" style={{ color: "var(--color-neutral-700)" }}>
                        {String(email)}
                      </td>
                      <td className="py-3 max-w-xs truncate" style={{ color: "var(--color-neutral-600)" }}>
                        {String(message)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
