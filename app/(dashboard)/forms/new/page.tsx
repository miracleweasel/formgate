// app/(dashboard)/forms/new/page.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import { getFormTemplates } from "@/lib/templates/formTemplates";
import type { TemplateId } from "@/lib/templates/formTemplates";
import type { FormField } from "@/lib/validation/fields";

const templates = getFormTemplates();

export default function NewFormPage() {
  const router = useRouter();

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("blank");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getTemplateFields(): FormField[] | undefined {
    const tpl = templates.find((t) => t.id === selectedTemplate);
    if (!tpl || tpl.fields.length === 0) return undefined;
    return tpl.fields;
  }

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
      const fields = getTemplateFields();
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: n,
          slug: s,
          description: d ? d : null,
          ...(fields ? { fields } : {}),
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

      {/* Template selector */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium" style={{ color: "var(--color-neutral-600)" }}>
          {t.templates.title}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedTemplate(tpl.id)}
              className="text-left rounded-lg p-3 transition-all"
              style={{
                border: selectedTemplate === tpl.id
                  ? "2px solid var(--color-primary-500)"
                  : "2px solid var(--color-neutral-200)",
                background: selectedTemplate === tpl.id
                  ? "var(--color-primary-50)"
                  : "var(--color-neutral-0)",
              }}
            >
              <div className="text-lg mb-1">{tpl.icon}</div>
              <div className="text-sm font-medium" style={{ color: "var(--color-neutral-800)" }}>
                {tpl.name}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--color-neutral-500)" }}>
                {tpl.description}
              </div>
            </button>
          ))}
        </div>
      </div>

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
