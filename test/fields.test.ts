// test/fields.test.ts
// Tests for custom form field validation

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FormFieldSchema,
  FormFieldsArraySchema,
  buildSubmissionSchema,
  DEFAULT_FIELDS,
  FIELD_TYPES,
} from "../lib/validation/fields";

describe("FormFieldSchema", () => {
  it("validates text field", () => {
    const result = FormFieldSchema.safeParse({
      name: "firstName",
      label: "First Name",
      type: "text",
      required: true,
    });
    assert.equal(result.success, true);
  });

  it("validates email field", () => {
    const result = FormFieldSchema.safeParse({
      name: "email",
      label: "Email",
      type: "email",
      required: false,
    });
    assert.equal(result.success, true);
  });

  it("validates number field with min/max", () => {
    const result = FormFieldSchema.safeParse({
      name: "age",
      label: "Age",
      type: "number",
      required: true,
      min: 0,
      max: 150,
    });
    assert.equal(result.success, true);
  });

  it("validates textarea field", () => {
    const result = FormFieldSchema.safeParse({
      name: "message",
      label: "Message",
      type: "textarea",
      required: true,
      maxLength: 1000,
    });
    assert.equal(result.success, true);
  });

  it("validates select field with options", () => {
    const result = FormFieldSchema.safeParse({
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [
        { value: "support", label: "Support" },
        { value: "sales", label: "Sales" },
      ],
    });
    assert.equal(result.success, true);
  });

  it("rejects select field without options", () => {
    const result = FormFieldSchema.safeParse({
      name: "category",
      label: "Category",
      type: "select",
      required: true,
      options: [],
    });
    assert.equal(result.success, false);
  });

  it("rejects invalid field name (starts with number)", () => {
    const result = FormFieldSchema.safeParse({
      name: "1field",
      label: "Field",
      type: "text",
      required: false,
    });
    assert.equal(result.success, false);
  });

  it("rejects invalid field name (special characters)", () => {
    const result = FormFieldSchema.safeParse({
      name: "field-name",
      label: "Field",
      type: "text",
      required: false,
    });
    assert.equal(result.success, false);
  });

  it("accepts valid field name with underscore", () => {
    const result = FormFieldSchema.safeParse({
      name: "field_name",
      label: "Field",
      type: "text",
      required: false,
    });
    assert.equal(result.success, true);
  });
});

describe("FormFieldsArraySchema", () => {
  it("accepts empty array", () => {
    const result = FormFieldsArraySchema.safeParse([]);
    assert.equal(result.success, true);
  });

  it("accepts array with valid fields", () => {
    const result = FormFieldsArraySchema.safeParse([
      { name: "email", label: "Email", type: "email", required: false },
      { name: "message", label: "Message", type: "textarea", required: true },
    ]);
    assert.equal(result.success, true);
  });

  it("rejects array with duplicate field names", () => {
    const result = FormFieldsArraySchema.safeParse([
      { name: "email", label: "Email 1", type: "email", required: false },
      { name: "email", label: "Email 2", type: "email", required: false },
    ]);
    assert.equal(result.success, false);
  });

  it("rejects array with duplicate field names (case insensitive)", () => {
    const result = FormFieldsArraySchema.safeParse([
      { name: "Email", label: "Email 1", type: "email", required: false },
      { name: "email", label: "Email 2", type: "email", required: false },
    ]);
    assert.equal(result.success, false);
  });

  it("rejects array with more than 20 fields", () => {
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

describe("buildSubmissionSchema", () => {
  it("validates submission against text field", () => {
    const schema = buildSubmissionSchema([
      { name: "name", label: "Name", type: "text", required: true },
    ]);
    const result = schema.safeParse({ name: "John" });
    assert.equal(result.success, true);
  });

  it("rejects empty required text field", () => {
    const schema = buildSubmissionSchema([
      { name: "name", label: "Name", type: "text", required: true },
    ]);
    const result = schema.safeParse({ name: "" });
    assert.equal(result.success, false);
  });

  it("accepts empty optional text field", () => {
    const schema = buildSubmissionSchema([
      { name: "name", label: "Name", type: "text", required: false },
    ]);
    const result = schema.safeParse({ name: "" });
    assert.equal(result.success, true);
  });

  it("validates email format", () => {
    const schema = buildSubmissionSchema([
      { name: "email", label: "Email", type: "email", required: true },
    ]);

    const valid = schema.safeParse({ email: "test@example.com" });
    assert.equal(valid.success, true);

    const invalid = schema.safeParse({ email: "not-an-email" });
    assert.equal(invalid.success, false);
  });

  it("validates number field", () => {
    const schema = buildSubmissionSchema([
      { name: "age", label: "Age", type: "number", required: true, min: 0 },
    ]);

    const valid = schema.safeParse({ age: 25 });
    assert.equal(valid.success, true);

    const invalid = schema.safeParse({ age: -1 });
    assert.equal(invalid.success, false);
  });

  it("validates select field options", () => {
    const schema = buildSubmissionSchema([
      {
        name: "priority",
        label: "Priority",
        type: "select",
        required: true,
        options: [
          { value: "low", label: "Low" },
          { value: "high", label: "High" },
        ],
      },
    ]);

    const valid = schema.safeParse({ priority: "low" });
    assert.equal(valid.success, true);

    const invalid = schema.safeParse({ priority: "medium" });
    assert.equal(invalid.success, false);
  });
});

describe("DEFAULT_FIELDS", () => {
  it("has email and message fields", () => {
    assert.equal(DEFAULT_FIELDS.length, 2);
    assert.equal(DEFAULT_FIELDS[0].name, "email");
    assert.equal(DEFAULT_FIELDS[0].type, "email");
    assert.equal(DEFAULT_FIELDS[1].name, "message");
    assert.equal(DEFAULT_FIELDS[1].type, "textarea");
  });

  it("email is optional, message is required", () => {
    assert.equal(DEFAULT_FIELDS[0].required, false);
    assert.equal(DEFAULT_FIELDS[1].required, true);
  });
});

describe("FIELD_TYPES", () => {
  it("has all expected types", () => {
    assert.deepEqual([...FIELD_TYPES], ["text", "email", "number", "textarea", "select"]);
  });
});
