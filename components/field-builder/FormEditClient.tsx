// components/field-builder/FormEditClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n";
import type { FormField } from "@/lib/validation/fields";
import { DEFAULT_FIELDS, FormFieldsArraySchema } from "@/lib/validation/fields";
import FieldList from "./FieldList";
import FormPreview from "./FormPreview";

type FormData = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: FormField[];
};

type Props = {
  form: FormData;
};

const fb = t.fieldBuilder;

export default function FormEditClient({ form }: Props) {
  const router = useRouter();

  const [name, setName] = useState(form.name);
  const [slug, setSlug] = useState(form.slug);
  const [description, setDescription] = useState(form.description ?? "");
  const [fields, setFields] = useState<FormField[]>(
    form.fields.length > 0 ? form.fields : DEFAULT_FIELDS
  );

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Validate fields before save
  const validateFields = (): string | null => {
    // Check that all fields have name and label
    for (const field of fields) {
      if (!field.name.trim()) return fb.nameRequired;
      if (!field.label.trim()) return fb.labelRequired;
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) return fb.nameInvalid;

      // Check select options
      if (field.type === "select") {
        if (field.options.length === 0) return fb.optionsRequired;
        for (const opt of field.options) {
          if (!opt.value.trim() || !opt.label.trim()) return fb.optionEmpty;
        }
      }
    }

    // Check for duplicates
    const names = fields.map((f) => f.name.toLowerCase());
    if (new Set(names).size !== names.length) return fb.nameDuplicate;

    // Use Zod schema for full validation
    const result = FormFieldsArraySchema.safeParse(fields);
    if (!result.success) {
      return result.error.issues[0]?.message ?? t.errors.invalidInput;
    }

    return null;
  };

  const save = async () => {
    // Validate form metadata
    if (!name.trim()) {
      setMsg({ kind: "err", text: t.forms.nameRequired });
      return;
    }
    if (!slug.trim()) {
      setMsg({ kind: "err", text: t.forms.slugRequired });
      return;
    }

    // Validate fields
    const fieldError = validateFields();
    if (fieldError) {
      setMsg({ kind: "err", text: fieldError });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          fields,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg =
          typeof data?.error === "string" ? data.error : fb.saveFailed;
        setMsg({ kind: "err", text: errorMsg });
        return;
      }

      setMsg({ kind: "ok", text: fb.saved });

      // Refresh the page data
      router.refresh();
    } catch {
      setMsg({ kind: "err", text: t.errors.network });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold" style={{ color: "var(--color-neutral-900)" }}>
          {t.common.edit}: {form.name}
        </h1>
        <Link href={`/forms/${form.id}`} className="btn btn-secondary btn-sm">
          {t.common.back}
        </Link>
      </div>

      {/* Metadata Card */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>
          {t.forms.title}
        </h2>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
              {t.forms.formName} *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.forms.formNamePlaceholder}
              className="input"
              maxLength={200}
              disabled={saving}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
              {t.forms.slug} *
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t.forms.slugPlaceholder}
              className="input"
              maxLength={200}
              disabled={saving}
            />
            <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
              {t.forms.slugHint}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
              {t.forms.description}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.forms.descriptionPlaceholder}
              className="input"
              rows={2}
              maxLength={1000}
              disabled={saving}
            />
          </div>
        </div>
      </section>

      {/* Fields Card */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>
          {fb.title}
        </h2>

        <FieldList fields={fields} onChange={setFields} disabled={saving} />
      </section>

      {/* Preview Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="btn btn-tertiary btn-sm"
        >
          {showPreview ? fb.hidePreview : fb.showPreview}
        </button>
      </div>

      {/* Preview */}
      {showPreview && <FormPreview fields={fields} formName={name} />}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? fb.saving : t.common.save}
        </button>

        <Link href={`/forms/${form.id}`} className="btn btn-secondary">
          {t.common.cancel}
        </Link>

        {msg && (
          <div
            className="badge"
            style={
              msg.kind === "ok"
                ? { background: "var(--color-success-100)", color: "var(--color-success-700)" }
                : { background: "var(--color-error-100)", color: "var(--color-error-700)" }
            }
          >
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
