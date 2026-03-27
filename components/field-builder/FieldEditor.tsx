// components/field-builder/FieldEditor.tsx
"use client";

import { t } from "@/lib/i18n";
import type { FormField, FieldType } from "@/lib/validation/fields";
import SelectOptionsEditor from "./SelectOptionsEditor";

type Props = {
  field: FormField;
  index: number;
  total: number;
  onChange: (changes: Partial<FormField>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  nameError?: string;
  disabled?: boolean;
};

const fb = t.fieldBuilder;

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: fb.typeText,
  email: fb.typeEmail,
  number: fb.typeNumber,
  textarea: fb.typeTextarea,
  select: fb.typeSelect,
  url: fb.typeUrl,
  phone: fb.typePhone,
  date: fb.typeDate,
  checkbox: fb.typeCheckbox,
  radio: fb.typeRadio,
  file: fb.typeFile,
};

export default function FieldEditor({
  field,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  nameError,
  disabled,
}: Props) {
  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{
        border: "1px solid var(--color-neutral-200)",
        background: "var(--color-neutral-50)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="badge"
            style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}
          >
            {FIELD_TYPE_LABELS[field.type]}
          </span>
          <span className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
            {field.name || `field_${index + 1}`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={disabled || index === 0}
            className="btn btn-tertiary btn-sm"
            title={fb.moveUp}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={disabled || index === total - 1}
            className="btn btn-tertiary btn-sm"
            title={fb.moveDown}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="btn btn-tertiary btn-sm"
            style={{ color: "var(--color-error-600)" }}
            title={fb.removeField}
          >
            ×
          </button>
        </div>
      </div>

      {/* Field Name & Label */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
            {fb.fieldName} *
          </label>
          <input
            value={field.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="field_name"
            className={`input ${nameError ? "input-error" : ""}`}
            maxLength={50}
            disabled={disabled}
          />
          {nameError && (
            <div className="text-xs" style={{ color: "var(--color-error-600)" }}>
              {nameError}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
            {fb.fieldLabel} *
          </label>
          <input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            placeholder="Display Label"
            className="input"
            maxLength={200}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Required & Placeholder */}
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-neutral-700)" }}>
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => onChange({ required: e.target.checked })}
            style={{ accentColor: "var(--color-primary-500)" }}
            disabled={disabled}
          />
          {fb.fieldRequired}
        </label>

        <div className="space-y-1">
          <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
            {fb.fieldPlaceholder}
          </label>
          <input
            value={field.placeholder ?? ""}
            onChange={(e) => onChange({ placeholder: e.target.value })}
            className="input"
            maxLength={200}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Type-specific options */}
      {(field.type === "text" || field.type === "textarea") && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
              {fb.minLength}
            </label>
            <input
              type="number"
              value={field.minLength ?? ""}
              onChange={(e) =>
                onChange({
                  minLength: e.target.value ? parseInt(e.target.value, 10) : undefined,
                })
              }
              className="input"
              min={0}
              max={field.type === "textarea" ? 10000 : 1000}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
              {fb.maxLength}
            </label>
            <input
              type="number"
              value={field.maxLength ?? ""}
              onChange={(e) =>
                onChange({
                  maxLength: e.target.value ? parseInt(e.target.value, 10) : undefined,
                })
              }
              className="input"
              min={1}
              max={field.type === "textarea" ? 10000 : 1000}
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {field.type === "number" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
              {fb.minValue}
            </label>
            <input
              type="number"
              value={field.min ?? ""}
              onChange={(e) =>
                onChange({
                  min: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="input"
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
              {fb.maxValue}
            </label>
            <input
              type="number"
              value={field.max ?? ""}
              onChange={(e) =>
                onChange({
                  max: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="input"
              disabled={disabled}
            />
          </div>
        </div>
      )}

      {(field.type === "select" || field.type === "radio") && (
        <SelectOptionsEditor
          options={field.options}
          onChange={(options) => onChange({ options })}
          disabled={disabled}
        />
      )}

      {field.type === "file" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
              {fb.fileAccept}
            </label>
            <input
              value={(field as any).accept ?? ""}
              onChange={(e) => onChange({ accept: e.target.value } as any)}
              placeholder="image/*,.pdf,.docx"
              className="input"
              maxLength={500}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs" style={{ color: "var(--color-neutral-600)" }}>
              {fb.fileMaxSize}
            </label>
            <input
              type="number"
              value={(field as any).maxFileSize ? (field as any).maxFileSize / (1024 * 1024) : ""}
              onChange={(e) =>
                onChange({
                  maxFileSize: e.target.value
                    ? Math.min(Math.round(parseFloat(e.target.value) * 1024 * 1024), 10_485_760)
                    : undefined,
                } as any)
              }
              placeholder="10"
              className="input"
              min={0.1}
              max={10}
              step={0.1}
              disabled={disabled}
            />
            <div className="text-xs" style={{ color: "var(--color-neutral-400)" }}>MB (max 10)</div>
          </div>
        </div>
      )}
    </div>
  );
}
