// components/field-builder/SelectOptionsEditor.tsx
"use client";

import { t } from "@/lib/i18n";

type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
  disabled?: boolean;
};

const fb = t.fieldBuilder;

export default function SelectOptionsEditor({ options, onChange, disabled }: Props) {
  const addOption = () => {
    onChange([...options, { value: "", label: "" }]);
  };

  const removeOption = (idx: number) => {
    onChange(options.filter((_, i) => i !== idx));
  };

  const updateOption = (idx: number, field: "value" | "label", val: string) => {
    const next = [...options];
    next[idx] = { ...next[idx], [field]: val };
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-medium" style={{ color: "var(--color-neutral-600)" }}>
        {fb.options}
      </div>

      {options.map((opt, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <input
            value={opt.value}
            onChange={(e) => updateOption(idx, "value", e.target.value)}
            placeholder={fb.optionValue}
            className="input flex-1"
            maxLength={200}
            disabled={disabled}
          />
          <input
            value={opt.label}
            onChange={(e) => updateOption(idx, "label", e.target.value)}
            placeholder={fb.optionLabel}
            className="input flex-1"
            maxLength={200}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={() => removeOption(idx)}
            className="btn btn-secondary btn-sm"
            style={{ color: "var(--color-error-600)" }}
            disabled={disabled || options.length <= 1}
          >
            {fb.removeOption}
          </button>
        </div>
      ))}

      {options.length < 50 && (
        <button
          type="button"
          onClick={addOption}
          className="btn btn-secondary btn-sm"
          disabled={disabled}
        >
          + {fb.addOption}
        </button>
      )}
    </div>
  );
}
