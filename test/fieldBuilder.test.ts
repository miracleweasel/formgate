// test/fieldBuilder.test.ts
// Tests for field builder client-side validation

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FormFieldSchema,
  FormFieldsArraySchema,
  DEFAULT_FIELDS,
  FIELD_TYPES,
  type FormField,
  type FieldType,
} from "../lib/validation/fields";

// =============================================================================
// Helper functions (mirror logic from FieldList.tsx)
// =============================================================================

function validateFieldName(name: string): string | undefined {
  if (!name.trim()) return "Field name is required";
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) return "Invalid field name format";
  return undefined;
}

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

// =============================================================================
// Tests
// =============================================================================

describe("Field Builder - Field Name Validation", () => {
  it("rejects empty field name", () => {
    const error = validateFieldName("");
    assert.ok(error);
  });

  it("rejects whitespace-only field name", () => {
    const error = validateFieldName("   ");
    assert.ok(error);
  });

  it("rejects field name starting with number", () => {
    const error = validateFieldName("1field");
    assert.ok(error);
  });

  it("rejects field name with hyphen", () => {
    const error = validateFieldName("field-name");
    assert.ok(error);
  });

  it("rejects field name with space", () => {
    const error = validateFieldName("field name");
    assert.ok(error);
  });

  it("accepts valid field name", () => {
    const error = validateFieldName("fieldName");
    assert.equal(error, undefined);
  });

  it("accepts field name with underscore", () => {
    const error = validateFieldName("field_name");
    assert.equal(error, undefined);
  });

  it("accepts field name starting with uppercase", () => {
    const error = validateFieldName("FieldName");
    assert.equal(error, undefined);
  });
});

describe("Field Builder - Duplicate Detection", () => {
  it("returns empty set for unique names", () => {
    const fields: FormField[] = [
      { name: "email", label: "Email", type: "email", required: false },
      { name: "name", label: "Name", type: "text", required: false },
    ];
    const duplicates = getDuplicateNames(fields);
    assert.equal(duplicates.size, 0);
  });

  it("detects exact duplicate names", () => {
    const fields: FormField[] = [
      { name: "email", label: "Email 1", type: "email", required: false },
      { name: "email", label: "Email 2", type: "email", required: false },
    ];
    const duplicates = getDuplicateNames(fields);
    assert.equal(duplicates.size, 1);
    assert.ok(duplicates.has("email"));
  });

  it("detects case-insensitive duplicates", () => {
    const fields: FormField[] = [
      { name: "Email", label: "Email 1", type: "email", required: false },
      { name: "email", label: "Email 2", type: "email", required: false },
    ];
    const duplicates = getDuplicateNames(fields);
    assert.equal(duplicates.size, 1);
    assert.ok(duplicates.has("email"));
  });

  it("ignores empty field names", () => {
    const fields: FormField[] = [
      { name: "", label: "Email 1", type: "email", required: false },
      { name: "", label: "Email 2", type: "email", required: false },
    ];
    const duplicates = getDuplicateNames(fields);
    assert.equal(duplicates.size, 0);
  });
});

describe("Field Builder - Default Field Creation", () => {
  it("creates text field with correct structure", () => {
    const field = createDefaultField("text");
    assert.equal(field.type, "text");
    assert.equal(field.name, "");
    assert.equal(field.label, "");
    assert.equal(field.required, false);
  });

  it("creates email field with correct structure", () => {
    const field = createDefaultField("email");
    assert.equal(field.type, "email");
  });

  it("creates number field with correct structure", () => {
    const field = createDefaultField("number");
    assert.equal(field.type, "number");
  });

  it("creates textarea field with correct structure", () => {
    const field = createDefaultField("textarea");
    assert.equal(field.type, "textarea");
  });

  it("creates select field with empty option", () => {
    const field = createDefaultField("select");
    assert.equal(field.type, "select");
    if (field.type === "select") {
      assert.equal(field.options.length, 1);
      assert.equal(field.options[0].value, "");
      assert.equal(field.options[0].label, "");
    }
  });
});

describe("Field Builder - Field Operations", () => {
  it("can add field to array", () => {
    const fields: FormField[] = [...DEFAULT_FIELDS];
    const newField = createDefaultField("text");
    newField.name = "company";
    newField.label = "Company";

    const updated = [...fields, newField];
    assert.equal(updated.length, 3);
    assert.equal(updated[2].name, "company");
  });

  it("can remove field from array", () => {
    const fields: FormField[] = [...DEFAULT_FIELDS];
    const updated = fields.filter((_, i) => i !== 0);
    assert.equal(updated.length, 1);
    assert.equal(updated[0].name, "message");
  });

  it("can update field in array", () => {
    const fields: FormField[] = [...DEFAULT_FIELDS];
    const updated = [...fields];
    updated[0] = { ...updated[0], label: "Your Email" };
    assert.equal(updated[0].label, "Your Email");
    assert.equal(updated[0].name, "email");
  });

  it("can swap fields (move up/down)", () => {
    const fields: FormField[] = [...DEFAULT_FIELDS];
    const updated = [...fields];
    [updated[0], updated[1]] = [updated[1], updated[0]];
    assert.equal(updated[0].name, "message");
    assert.equal(updated[1].name, "email");
  });
});

describe("Field Builder - Validation Edge Cases", () => {
  it("rejects field name longer than 50 chars", () => {
    const longName = "a".repeat(51);
    const result = FormFieldSchema.safeParse({
      name: longName,
      label: "Test",
      type: "text",
      required: false,
    });
    assert.equal(result.success, false);
  });

  it("accepts field name exactly 50 chars", () => {
    const exactName = "a".repeat(50);
    const result = FormFieldSchema.safeParse({
      name: exactName,
      label: "Test",
      type: "text",
      required: false,
    });
    assert.equal(result.success, true);
  });

  it("rejects label longer than 200 chars", () => {
    const longLabel = "a".repeat(201);
    const result = FormFieldSchema.safeParse({
      name: "test",
      label: longLabel,
      type: "text",
      required: false,
    });
    assert.equal(result.success, false);
  });

  it("rejects empty label", () => {
    const result = FormFieldSchema.safeParse({
      name: "test",
      label: "",
      type: "text",
      required: false,
    });
    assert.equal(result.success, false);
  });

  it("accepts empty placeholder", () => {
    const result = FormFieldSchema.safeParse({
      name: "test",
      label: "Test",
      type: "text",
      required: false,
      placeholder: "",
    });
    assert.equal(result.success, true);
  });
});

describe("Field Builder - Select Options Validation", () => {
  it("rejects select with no options", () => {
    const result = FormFieldSchema.safeParse({
      name: "category",
      label: "Category",
      type: "select",
      required: false,
      options: [],
    });
    assert.equal(result.success, false);
  });

  it("accepts select with one option", () => {
    const result = FormFieldSchema.safeParse({
      name: "category",
      label: "Category",
      type: "select",
      required: false,
      options: [{ value: "one", label: "One" }],
    });
    assert.equal(result.success, true);
  });

  it("rejects option with empty value", () => {
    const result = FormFieldSchema.safeParse({
      name: "category",
      label: "Category",
      type: "select",
      required: false,
      options: [{ value: "", label: "Empty" }],
    });
    assert.equal(result.success, false);
  });

  it("rejects option with empty label", () => {
    const result = FormFieldSchema.safeParse({
      name: "category",
      label: "Category",
      type: "select",
      required: false,
      options: [{ value: "one", label: "" }],
    });
    assert.equal(result.success, false);
  });

  it("accepts up to 50 options", () => {
    const options = Array.from({ length: 50 }, (_, i) => ({
      value: `opt${i}`,
      label: `Option ${i}`,
    }));
    const result = FormFieldSchema.safeParse({
      name: "category",
      label: "Category",
      type: "select",
      required: false,
      options,
    });
    assert.equal(result.success, true);
  });

  it("rejects more than 50 options", () => {
    const options = Array.from({ length: 51 }, (_, i) => ({
      value: `opt${i}`,
      label: `Option ${i}`,
    }));
    const result = FormFieldSchema.safeParse({
      name: "category",
      label: "Category",
      type: "select",
      required: false,
      options,
    });
    assert.equal(result.success, false);
  });
});

describe("Field Builder - Number Field Constraints", () => {
  it("accepts number field without min/max", () => {
    const result = FormFieldSchema.safeParse({
      name: "quantity",
      label: "Quantity",
      type: "number",
      required: false,
    });
    assert.equal(result.success, true);
  });

  it("accepts number field with min only", () => {
    const result = FormFieldSchema.safeParse({
      name: "quantity",
      label: "Quantity",
      type: "number",
      required: false,
      min: 0,
    });
    assert.equal(result.success, true);
  });

  it("accepts number field with max only", () => {
    const result = FormFieldSchema.safeParse({
      name: "quantity",
      label: "Quantity",
      type: "number",
      required: false,
      max: 100,
    });
    assert.equal(result.success, true);
  });

  it("accepts number field with negative min", () => {
    const result = FormFieldSchema.safeParse({
      name: "temperature",
      label: "Temperature",
      type: "number",
      required: false,
      min: -50,
      max: 50,
    });
    assert.equal(result.success, true);
  });
});

describe("Field Builder - Text/Textarea Length Constraints", () => {
  it("rejects text minLength greater than 1000", () => {
    const result = FormFieldSchema.safeParse({
      name: "test",
      label: "Test",
      type: "text",
      required: false,
      minLength: 1001,
    });
    assert.equal(result.success, false);
  });

  it("accepts textarea maxLength up to 10000", () => {
    const result = FormFieldSchema.safeParse({
      name: "essay",
      label: "Essay",
      type: "textarea",
      required: false,
      maxLength: 10000,
    });
    assert.equal(result.success, true);
  });

  it("rejects textarea maxLength greater than 10000", () => {
    const result = FormFieldSchema.safeParse({
      name: "essay",
      label: "Essay",
      type: "textarea",
      required: false,
      maxLength: 10001,
    });
    assert.equal(result.success, false);
  });
});

describe("Field Builder - Max Fields Limit", () => {
  it("accepts exactly 20 fields", () => {
    const fields = Array.from({ length: 20 }, (_, i) => ({
      name: `field${i}`,
      label: `Field ${i}`,
      type: "text" as const,
      required: false,
    }));
    const result = FormFieldsArraySchema.safeParse(fields);
    assert.equal(result.success, true);
  });

  it("rejects 21 fields", () => {
    const fields = Array.from({ length: 21 }, (_, i) => ({
      name: `field${i}`,
      label: `Field ${i}`,
      type: "text" as const,
      required: false,
    }));
    const result = FormFieldsArraySchema.safeParse(fields);
    assert.equal(result.success, false);
  });
});

describe("Field Builder - All Field Types", () => {
  it("validates all field types from FIELD_TYPES", () => {
    for (const type of FIELD_TYPES) {
      const field = createDefaultField(type);
      field.name = `test_${type}`;
      field.label = `Test ${type}`;

      if (field.type === "select") {
        field.options = [{ value: "opt1", label: "Option 1" }];
      }

      const result = FormFieldSchema.safeParse(field);
      assert.equal(result.success, true, `Failed for type: ${type}`);
    }
  });
});
