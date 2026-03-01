// app/f/[slug]/public-form-client.tsx
"use client";

import { useState, useMemo } from "react";
import { t } from "@/lib/i18n";
import type { FormField } from "@/lib/validation/fields";
import { FILE_MAX_SIZE, FILE_MAX_COUNT } from "@/lib/validation/fields";

type Props = {
  slug: string;
  fields: FormField[];
};

type FieldValue = string | number | boolean | null;

export default function PublicFormClient({ slug, fields }: Props) {
  const hasFiles = useMemo(() => fields.some((f) => f.type === "file"), [fields]);

  // Initialize form state from field definitions
  const [values, setValues] = useState<Record<string, FieldValue>>(() => {
    const initial: Record<string, FieldValue> = {};
    for (const field of fields) {
      if (field.type === "file") continue; // File fields use separate state
      if (field.type === "number") initial[field.name] = null;
      else if (field.type === "checkbox") initial[field.name] = false;
      else initial[field.name] = "";
    }
    return initial;
  });

  // Separate state for file inputs
  const [fileValues, setFileValues] = useState<Record<string, File | null>>({});

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
      // File field validation
      if (field.type === "file") {
        const file = fileValues[field.name];
        if (field.required && !file) {
          newErrors[field.name] = t.errors.required;
          continue;
        }
        if (file) {
          const maxSize = field.maxFileSize ?? FILE_MAX_SIZE;
          if (file.size > maxSize) {
            newErrors[field.name] = t.publicForm.fileTooLarge;
            continue;
          }
        }
        continue;
      }

      const value = values[field.name];

      // Required check
      if (field.required) {
        if (field.type === "checkbox") {
          if (value !== true) {
            newErrors[field.name] = t.errors.required;
            continue;
          }
        } else if (value === null || value === "" || value === undefined) {
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

      // URL format check
      if (field.type === "url" && value) {
        try {
          new URL(String(value));
        } catch {
          newErrors[field.name] = t.errors.invalidInput;
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
      // Check total file count
      const fileEntries = Object.entries(fileValues).filter(([, f]) => f !== null);
      if (fileEntries.length > FILE_MAX_COUNT) {
        setErrors({ _form: t.publicForm.tooManyFiles });
        setSubmitting(false);
        return;
      }

      let res: Response;

      if (hasFiles && fileEntries.length > 0) {
        // Use FormData for file uploads
        const formData = new FormData();
        formData.append("_payload", JSON.stringify(values));
        for (const [name, file] of fileEntries) {
          if (file) formData.append(name, file);
        }
        res = await fetch(
          `/api/public/forms/${encodeURIComponent(slug)}/submit`,
          { method: "POST", body: formData }
        );
      } else {
        // Standard JSON submission
        res = await fetch(
          `/api/public/forms/${encodeURIComponent(slug)}/submit`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payload: values }),
          }
        );
      }

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
    <form onSubmit={onSubmit} className="space-y-6">
      {fields.map((field) => (
        <DynamicField
          key={field.name}
          field={field}
          value={field.type === "file" ? null : values[field.name]}
          file={field.type === "file" ? (fileValues[field.name] ?? null) : null}
          onChange={(v) => updateValue(field.name, v)}
          onFileChange={field.type === "file" ? (f) => {
            setFileValues((prev) => ({ ...prev, [field.name]: f }));
            if (errors[field.name]) {
              setErrors((prev) => { const next = { ...prev }; delete next[field.name]; return next; });
            }
          } : undefined}
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
  file,
  onChange,
  onFileChange,
  error,
  disabled,
}: {
  field: FormField;
  value: FieldValue;
  file?: File | null;
  onChange: (v: FieldValue) => void;
  onFileChange?: (f: File | null) => void;
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
      ) : field.type === "checkbox" ? (
        <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--color-neutral-700)" }}>
          <input
            id={inputId}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            style={{ accentColor: "var(--color-primary-500)" }}
          />
          {field.label}
        </label>
      ) : field.type === "radio" ? (
        <div className="space-y-2">
          {field.options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--color-neutral-700)" }}>
              <input
                type="radio"
                name={inputId}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                disabled={disabled}
                style={{ accentColor: "var(--color-primary-500)" }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      ) : field.type === "file" ? (
        <div>
          <input
            id={inputId}
            type="file"
            className={`input ${error ? "input-error" : ""}`}
            accept={field.accept || undefined}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              onFileChange?.(f);
            }}
            disabled={disabled}
          />
          {file && (
            <div className="text-xs mt-1" style={{ color: "var(--color-neutral-500)" }}>
              {file.name} ({(file.size / 1024).toFixed(0)} KB)
            </div>
          )}
        </div>
      ) : (
        <input
          id={inputId}
          className={`input ${error ? "input-error" : ""}`}
          type={
            field.type === "number" ? "number"
              : field.type === "url" ? "url"
              : field.type === "phone" ? "tel"
              : field.type === "date" ? "date"
              : field.type
          }
          value={String(value ?? "")}
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
