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
      <div className="public-form-success animate-scale-in">
        <div className="public-form-success-icon">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: "var(--color-neutral-900)" }}
        >
          {t.publicForm.thankYou}
        </h2>
        <p style={{ color: "var(--color-neutral-500)" }}>
          {t.publicForm.thankYouMessage}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
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
        <div className="alert alert-error">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{errors._form}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary btn-lg w-full"
      >
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
    <div className="form-field">
      <label
        className="form-label"
        htmlFor={inputId}
      >
        {field.label}
        {field.required && (
          <span style={{ color: "var(--color-error-500)" }}> *</span>
        )}
        {!field.required && (
          <span
            className="font-normal text-sm ml-1"
            style={{ color: "var(--color-neutral-400)" }}
          >
            ({t.common.optional})
          </span>
        )}
      </label>

      {field.type === "textarea" ? (
        <textarea
          id={inputId}
          className={`input ${error ? "input-error" : ""}`}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || ""}
          disabled={disabled}
        />
      ) : field.type === "select" ? (
        <select
          id={inputId}
          className={`input ${error ? "input-error" : ""}`}
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
          className={`input ${error ? "input-error" : ""}`}
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
        <p className="form-error">{error}</p>
      )}
    </div>
  );
}
