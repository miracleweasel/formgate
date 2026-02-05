// app/f/[slug]/public-form-client.tsx
"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import type { FormField } from "@/lib/validation/fields";

type Props = {
  slug: string;
  fields: FormField[];
};

type FieldValue = string | number | null;

export default function PublicFormClient({ slug, fields }: Props) {
  // Initialize form state from field definitions
  const [values, setValues] = useState<Record<string, FieldValue>>(() => {
    const initial: Record<string, FieldValue> = {};
    for (const field of fields) {
      initial[field.name] = field.type === "number" ? null : "";
    }
    return initial;
  });

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateValue = (name: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Client-side validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      const value = values[field.name];

      // Required check
      if (field.required) {
        if (value === null || value === "" || value === undefined) {
          newErrors[field.name] = t.errors.required;
          continue;
        }
      }

      // Email format check
      if (field.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          newErrors[field.name] = t.errors.invalidEmail;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch(
        `/api/public/forms/${encodeURIComponent(slug)}/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload: values }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        // Handle server validation errors
        if (data?.field && data?.message) {
          setErrors({ [data.field]: data.message });
          return;
        }

        // Handle rate limiting
        if (data?.error === "rate_limited") {
          setErrors({ _form: t.errors.rateLimited });
          return;
        }

        // Generic error
        setErrors({ _form: t.errors.generic });
        return;
      }

      setDone(true);
    } catch {
      setErrors({ _form: t.errors.generic });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section
        className="card"
        style={{
          borderColor: "var(--color-success-300)",
          background: "var(--color-success-50)",
        }}
      >
        <p
          className="font-medium"
          style={{ color: "var(--color-success-700)" }}
        >
          {t.publicForm.thankYou}
        </p>
        <p className="text-sm" style={{ color: "var(--color-success-600)" }}>
          {t.publicForm.thankYouMessage}
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      {fields.map((field) => (
        <DynamicField
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={(v) => updateValue(field.name, v)}
          error={errors[field.name]}
          disabled={submitting}
        />
      ))}

      {errors._form && (
        <p className="text-sm" style={{ color: "var(--color-error-500)" }}>
          {errors._form}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn btn-primary">
        {submitting ? t.publicForm.submitting : t.publicForm.submit}
      </button>
    </form>
  );
}

// Dynamic field renderer component
function DynamicField({
  field,
  value,
  onChange,
  error,
  disabled,
}: {
  field: FormField;
  value: FieldValue;
  onChange: (v: FieldValue) => void;
  error?: string;
  disabled?: boolean;
}) {
  const inputId = `field-${field.name}`;

  return (
    <div className="space-y-1">
      <label
        className="text-sm font-medium"
        htmlFor={inputId}
        style={{ color: "var(--color-neutral-700)" }}
      >
        {field.label}
        {field.required && (
          <span style={{ color: "var(--color-error-500)" }}> *</span>
        )}
        {!field.required && (
          <span
            className="font-normal"
            style={{ color: "var(--color-neutral-500)" }}
          >
            {" "}
            ({t.common.optional})
          </span>
        )}
      </label>

      {field.type === "textarea" ? (
        <textarea
          id={inputId}
          className="input min-h-[120px]"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
          disabled={disabled}
        />
      ) : field.type === "select" ? (
        <select
          id={inputId}
          className="input"
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          <option value="">{field.placeholder || t.common.select}</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          className="input"
          type={field.type}
          value={value ?? ""}
          onChange={(e) =>
            onChange(
              field.type === "number"
                ? e.target.value
                  ? Number(e.target.value)
                  : null
                : e.target.value
            )
          }
          placeholder={field.placeholder || ""}
          disabled={disabled}
        />
      )}

      {error && (
        <p className="text-sm" style={{ color: "var(--color-error-500)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
