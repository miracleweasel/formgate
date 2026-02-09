// components/field-builder/FormPreview.tsx
"use client";

import { t } from "@/lib/i18n";
import type { FormField } from "@/lib/validation/fields";

type Props = {
  fields: FormField[];
  formName: string;
};

const fb = t.fieldBuilder;

export default function FormPreview({ fields, formName }: Props) {
  return (
    <div className="card space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>
        {fb.previewTitle}
      </h3>

      <div
        className="rounded-lg p-4 space-y-4"
        style={{
          background: "var(--color-neutral-50)",
          border: "1px solid var(--color-neutral-200)",
        }}
      >
        <div className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>
          {formName || "Form"}
        </div>

        {fields.length === 0 ? (
          <div className="text-sm" style={{ color: "var(--color-neutral-500)" }}>
            {fb.addField}
          </div>
        ) : (
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div key={idx} className="space-y-1">
                <label className="block text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
                  {field.label || field.name || `Field ${idx + 1}`}
                  {field.required && (
                    <span style={{ color: "var(--color-error-500)" }}> *</span>
                  )}
                </label>

                {field.type === "textarea" ? (
                  <textarea
                    placeholder={field.placeholder || ""}
                    className="input"
                    rows={3}
                    disabled
                  />
                ) : field.type === "select" ? (
                  <select className="input" disabled>
                    <option value="">{t.common.select}</option>
                    {field.options.map((opt, oi) => (
                      <option key={oi} value={opt.value}>
                        {opt.label || opt.value}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
                    placeholder={field.placeholder || ""}
                    className="input"
                    disabled
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <button type="button" className="btn btn-primary" disabled>
          {t.common.submit}
        </button>
      </div>
    </div>
  );
}
