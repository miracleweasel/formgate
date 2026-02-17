// app/(dashboard)/forms/new/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";

export default function NewFormPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const n = name.trim();
    const s = slug.trim();
    const d = description.trim();

    if (!n) return setError(t.forms.nameRequired);
    if (!s) return setError(t.forms.slugRequired);

    setSubmitting(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          slug: s,
          description: d ? d : null,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || t.forms.createFailed);

      const id = data?.form?.id;
      if (id) router.push(`/forms/${id}`);
      else router.push("/forms");
      router.refresh();
    } catch (err: any) {
      setError(String(err?.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-neutral-400)" }}>
        <Link href="/forms" className="hover:underline" style={{ color: "var(--color-neutral-500)" }}>
          {t.forms.title}
        </Link>
        <span>/</span>
        <span style={{ color: "var(--color-neutral-700)" }}>{t.forms.createTitle}</span>
      </div>

      <h1 className="page-header-title">{t.forms.createTitle}</h1>

      <form onSubmit={onSubmit} className="card space-y-6">
        <div className="form-field">
          <label className="form-label" htmlFor="name">
            {t.forms.formName} <span style={{ color: "var(--color-error-500)" }}>*</span>
          </label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            placeholder={t.forms.formNamePlaceholder}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="slug">
            {t.forms.slug} <span style={{ color: "var(--color-error-500)" }}>*</span>
          </label>
          <input
            id="slug"
            className="input"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={submitting}
            placeholder={t.forms.slugPlaceholder}
            required
          />
          <p className="form-hint">{t.forms.slugHint}</p>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="description">
            {t.forms.description} <span className="font-normal text-sm" style={{ color: "var(--color-neutral-400)" }}>({t.common.optional})</span>
          </label>
          <textarea
            id="description"
            className="input min-h-[90px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
            placeholder={t.forms.descriptionPlaceholder}
          />
        </div>

        {error ? <p className="text-sm" style={{ color: "var(--color-error-500)" }}>{error}</p> : null}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? t.forms.creating : t.common.create}
          </button>
          <Link href="/forms" className="btn btn-tertiary">
            {t.common.cancel}
          </Link>
        </div>
      </form>
    </div>
  );
}
