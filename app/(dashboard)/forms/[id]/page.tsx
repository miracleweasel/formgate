// app/(dashboard)/forms/[id]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { forms, submissions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { t } from "@/lib/i18n";
import DeleteButton from "./DeleteButton";

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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--color-neutral-900)" }}>{form.name}</h1>
          <div className="text-sm" style={{ color: "var(--color-neutral-500)" }}>/{form.slug}</div>
        </div>

        <div className="flex gap-2">
          <Link href="/forms" className="btn btn-secondary btn-sm">
            {t.common.back}
          </Link>
          <DeleteButton id={form.id} />
        </div>
      </div>

      {/* Infos */}
      <div className="card space-y-3">
        <div>
          <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>{t.forms.description}</div>
          <div className="text-sm" style={{ color: "var(--color-neutral-700)" }}>{form.description ?? "—"}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>{t.forms.created}</div>
            <div className="text-sm" style={{ color: "var(--color-neutral-700)" }}>
              {new Date(form.createdAt).toLocaleString("ja-JP")}
            </div>
          </div>
          <div>
            <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>{t.forms.updated}</div>
            <div className="text-sm" style={{ color: "var(--color-neutral-700)" }}>
              {new Date(form.updatedAt).toLocaleString("ja-JP")}
            </div>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <section className="card space-y-3">
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>{t.integrations.title}</h2>

        <div className="flex items-center justify-between gap-4">
          <div className="text-sm">
            <div className="font-medium" style={{ color: "var(--color-neutral-700)" }}>{t.integrations.backlog.title}</div>
            <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
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
      <section className="card space-y-3">
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>{t.submissions.recent}</h2>

        {recent.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-neutral-600)" }}>{t.submissions.noSubmissions}</p>
        ) : (
          <ul className="space-y-3">
            {recent.map((s) => {
              const payload = (s.payload ?? {}) as Record<string, any>;

              const email = payload.email ?? "—";
              const message = payload.message ?? "—";

              return (
                <li key={s.id} className="rounded-lg p-3" style={{ border: "1px solid var(--color-neutral-200)", background: "var(--color-neutral-50)" }}>
                  <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
                    {s.createdAt
                      ? new Date(s.createdAt as any).toLocaleString("ja-JP")
                      : "—"}
                  </div>

                  <div className="mt-1 text-sm space-y-1" style={{ color: "var(--color-neutral-700)" }}>
                    <div>
                      <span className="font-medium">{t.publicForm.emailLabel}:</span>{" "}
                      {String(email)}
                    </div>

                    <div className="whitespace-pre-wrap">
                      <span className="font-medium">{t.publicForm.messageLabel}:</span>{" "}
                      {String(message)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
