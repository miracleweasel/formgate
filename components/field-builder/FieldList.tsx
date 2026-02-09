// components/field-builder/FieldList.tsx
"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";
import type { FormField, FieldType } from "@/lib/validation/fields";
import { FIELD_TYPES } from "@/lib/validation/fields";
import FieldEditor from "./FieldEditor";

type Props = {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
  disabled?: boolean;
};

const fb = t.fieldBuilder;
const MAX_FIELDS = 20;

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: fb.typeText,
  email: fb.typeEmail,
  number: fb.typeNumber,
  textarea: fb.typeTextarea,
  select: fb.typeSelect,
};

function createDefaultField(type: FieldType): FormField {
  const base = {
    name: "",
    label: "",
    required: false,
    placeholder: "",
  };

  switch (type) {
    case "text":
      return { ...base, type: "text" };
    case "email":
      return { ...base, type: "email" };
    case "number":
      return { ...base, type: "number" };
    case "textarea":
      return { ...base, type: "textarea" };
    case "select":
      return { ...base, type: "select", options: [{ value: "", label: "" }] };
  }
}

// Validate field name pattern
function validateFieldName(name: string): string | undefined {
  if (!name.trim()) return fb.nameRequired;
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) return fb.nameInvalid;
  return undefined;
}

// Check for duplicate names
function getDuplicateNames(fields: FormField[]): Set<string> {
  const seen = new Map<string, number>();
  const duplicates = new Set<string>();

  for (const field of fields) {
    const lower = field.name.toLowerCase();
    if (!lower) continue;
    const count = (seen.get(lower) ?? 0) + 1;
    seen.set(lower, count);
    if (count > 1) duplicates.add(lower);
  }

  return duplicates;
}

export default function FieldList({ fields, onChange, disabled }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const duplicateNames = getDuplicateNames(fields);

  const addField = (type: FieldType) => {
    if (fields.length >= MAX_FIELDS) return;
    onChange([...fields, createDefaultField(type)]);
    setDropdownOpen(false);
  };

  const removeField = (idx: number) => {
    onChange(fields.filter((_, i) => i !== idx));
  };

  const updateField = (idx: number, changes: Partial<FormField>) => {
    const next = [...fields];
    next[idx] = { ...next[idx], ...changes } as FormField;
    onChange(next);
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= fields.length) return;
    const next = [...fields];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next);
  };

  const getFieldError = (field: FormField): string | undefined => {
    const nameError = validateFieldName(field.name);
    if (nameError) return nameError;
    if (duplicateNames.has(field.name.toLowerCase())) return fb.nameDuplicate;
    return undefined;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm" style={{ color: "var(--color-neutral-600)" }}>
          {fb.fieldCount}: {fields.length}/{MAX_FIELDS}
        </div>

        <div className="relative">
          {fields.length >= MAX_FIELDS ? (
            <div className="text-xs" style={{ color: "var(--color-warning-600)" }}>
              {fb.maxFieldsReached}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="btn btn-secondary btn-sm"
                disabled={disabled}
              >
                + {fb.addField}
              </button>

              {dropdownOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div
                    className="absolute right-0 mt-1 z-20 rounded-lg shadow-lg py-1"
                    style={{
                      background: "var(--color-neutral-0)",
                      border: "1px solid var(--color-neutral-200)",
                      minWidth: "160px",
                    }}
                  >
                    {FIELD_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addField(type)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-100"
                        style={{ color: "var(--color-neutral-700)" }}
                      >
                        {FIELD_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Field list */}
      {fields.length === 0 ? (
        <div
          className="text-center py-8 rounded-lg"
          style={{
            border: "2px dashed var(--color-neutral-300)",
            color: "var(--color-neutral-500)",
          }}
        >
          {fb.addField}
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, idx) => (
            <FieldEditor
              key={idx}
              field={field}
              index={idx}
              total={fields.length}
              onChange={(changes) => updateField(idx, changes)}
              onRemove={() => removeField(idx)}
              onMoveUp={() => moveField(idx, -1)}
              onMoveDown={() => moveField(idx, 1)}
              nameError={getFieldError(field)}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
