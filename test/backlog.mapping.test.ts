// test/backlog.mapping.test.ts
// Tests for Backlog field mapping logic

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  BacklogFieldMappingSchema,
  SummaryMappingSchema,
  DescriptionMappingSchema,
  CustomFieldMappingSchema,
  applyTemplate,
  buildMappedSummary,
  buildMappedDescription,
  DEFAULT_BACKLOG_MAPPING,
} from "../lib/validation/backlogMapping";
import { buildMappedIssue } from "../lib/backlog/issue";

// ── applyTemplate ──────────────────────────────────────────────────────────────

describe("applyTemplate", () => {
  it("replaces simple placeholders", () => {
    const result = applyTemplate("Hello {name}", { name: "Alice" });
    assert.equal(result, "Hello Alice");
  });

  it("replaces multiple placeholders", () => {
    const result = applyTemplate("{company} - {subject}", {
      company: "Acme",
      subject: "Bug report",
    });
    assert.equal(result, "Acme - Bug report");
  });

  it("replaces missing field with empty string", () => {
    const result = applyTemplate("From {company}: {msg}", { msg: "hi" });
    assert.equal(result, "From : hi");
  });

  it("handles null values", () => {
    const result = applyTemplate("{val}", { val: null });
    assert.equal(result, "");
  });

  it("handles undefined values", () => {
    const result = applyTemplate("{val}", {});
    assert.equal(result, "");
  });

  it("converts numbers to string", () => {
    const result = applyTemplate("Count: {n}", { n: 42 });
    assert.equal(result, "Count: 42");
  });

  it("converts booleans to string", () => {
    const result = applyTemplate("Active: {flag}", { flag: true });
    assert.equal(result, "Active: true");
  });

  it("returns original string when no placeholders", () => {
    const result = applyTemplate("No placeholders here", { foo: "bar" });
    assert.equal(result, "No placeholders here");
  });

  it("handles empty template", () => {
    const result = applyTemplate("", { foo: "bar" });
    assert.equal(result, "");
  });

  it("handles repeated placeholder", () => {
    const result = applyTemplate("{a} and {a}", { a: "X" });
    assert.equal(result, "X and X");
  });
});

// ── buildMappedSummary ─────────────────────────────────────────────────────────

describe("buildMappedSummary", () => {
  const payload = { company: "Acme", subject: "Bug", email: "a@b.com" };

  it("returns default when no mapping", () => {
    const result = buildMappedSummary(undefined, payload, "Contact Form", "contact");
    assert.equal(result, "[FormGate] Contact Form (/contact)");
  });

  it("returns default without slug", () => {
    const result = buildMappedSummary(undefined, payload, "Contact Form", "");
    assert.equal(result, "[FormGate] Contact Form");
  });

  it("uses field value when type=field", () => {
    const result = buildMappedSummary(
      { type: "field", field: "subject" },
      payload,
      "Contact Form",
      "contact"
    );
    assert.equal(result, "Bug");
  });

  it("falls back to default when field is empty", () => {
    const result = buildMappedSummary(
      { type: "field", field: "subject" },
      { subject: "" },
      "Contact Form",
      "contact"
    );
    assert.equal(result, "[FormGate] Contact Form");
  });

  it("falls back to default when field is missing", () => {
    const result = buildMappedSummary(
      { type: "field", field: "missing" },
      payload,
      "Contact Form",
      "contact"
    );
    assert.equal(result, "[FormGate] Contact Form");
  });

  it("truncates long field value to 255 chars", () => {
    const longValue = "A".repeat(300);
    const result = buildMappedSummary(
      { type: "field", field: "subject" },
      { subject: longValue },
      "Form",
      "f"
    );
    assert.equal(result.length, 255);
  });

  it("uses template when type=template", () => {
    const result = buildMappedSummary(
      { type: "template", template: "New inquiry from {company}" },
      payload,
      "Contact Form",
      "contact"
    );
    assert.equal(result, "New inquiry from Acme");
  });

  it("falls back to default when template result is empty", () => {
    const result = buildMappedSummary(
      { type: "template", template: "{missing}" },
      {},
      "Contact Form",
      "contact"
    );
    assert.equal(result, "[FormGate] Contact Form");
  });

  it("falls back when field type but no field specified", () => {
    const result = buildMappedSummary(
      { type: "field" },
      payload,
      "Contact Form",
      "contact"
    );
    assert.equal(result, "[FormGate] Contact Form");
  });
});

// ── buildMappedDescription ─────────────────────────────────────────────────────

describe("buildMappedDescription", () => {
  const payload = { email: "a@b.com", message: "Hello" };
  const base = { formName: "Contact", formSlug: "contact", submissionId: "sub-123" };

  it("auto mode includes all fields", () => {
    const result = buildMappedDescription(
      { type: "auto" },
      payload,
      base.formName,
      base.formSlug,
      base.submissionId
    );
    assert.ok(result.includes("Payload:"));
    assert.ok(result.includes("- email: a@b.com"));
    assert.ok(result.includes("- message: Hello"));
    assert.ok(result.includes("Submission ID: sub-123"));
    assert.ok(result.includes("Form: Contact (/contact)"));
    assert.ok(result.includes("JST"));
  });

  it("defaults to auto when no mapping", () => {
    const result = buildMappedDescription(
      undefined,
      payload,
      base.formName,
      base.formSlug,
      base.submissionId
    );
    assert.ok(result.includes("Payload:"));
    assert.ok(result.includes("- email: a@b.com"));
  });

  it("field mode uses specific field", () => {
    const result = buildMappedDescription(
      { type: "field", field: "message" },
      payload,
      base.formName,
      base.formSlug,
      base.submissionId
    );
    assert.ok(result.includes("Hello"));
    assert.ok(!result.includes("Payload:"));
  });

  it("template mode applies template", () => {
    const result = buildMappedDescription(
      { type: "template", template: "From: {email}\n\n{message}" },
      payload,
      base.formName,
      base.formSlug,
      base.submissionId
    );
    assert.ok(result.includes("From: a@b.com"));
    assert.ok(result.includes("Hello"));
  });

  it("handles empty payload in auto mode", () => {
    const result = buildMappedDescription(
      { type: "auto" },
      {},
      base.formName,
      base.formSlug,
      base.submissionId
    );
    assert.ok(result.includes("Payload:"));
    assert.ok(result.includes("Submission ID: sub-123"));
  });
});

// ── buildMappedIssue ───────────────────────────────────────────────────────────

describe("buildMappedIssue", () => {
  const baseArgs = {
    formName: "Support",
    formSlug: "support",
    submissionId: "sub-456",
    payload: { email: "user@test.com", message: "Help" } as Record<string, string | number | boolean | null>,
  };

  it("returns default issue when no mapping", () => {
    const result = buildMappedIssue({ ...baseArgs, mapping: null });
    assert.equal(result.summary, "[FormGate] Support (/support)");
    assert.equal(result.priorityId, 3); // Default: Normal
    assert.equal(result.issueTypeId, undefined);
    assert.ok(result.description.includes("Payload:"));
  });

  it("applies mapping config", () => {
    const result = buildMappedIssue({
      ...baseArgs,
      mapping: {
        summary: { type: "template", template: "[Support] {email}" },
        description: { type: "auto" },
        priorityId: 4,
        issueTypeId: 99,
      },
    });
    assert.equal(result.summary, "[Support] user@test.com");
    assert.equal(result.priorityId, 4);
    assert.equal(result.issueTypeId, 99);
  });

  it("uses default priority when not specified in mapping", () => {
    const result = buildMappedIssue({
      ...baseArgs,
      mapping: {
        summary: { type: "field", field: "email" },
      },
    });
    assert.equal(result.priorityId, 3);
  });
});

// ── Zod Schemas ────────────────────────────────────────────────────────────────

describe("BacklogFieldMappingSchema", () => {
  it("validates minimal mapping", () => {
    const result = BacklogFieldMappingSchema.safeParse({});
    assert.equal(result.success, true);
  });

  it("validates full mapping", () => {
    const result = BacklogFieldMappingSchema.safeParse({
      summary: { type: "template", template: "{company} inquiry" },
      description: { type: "auto" },
      issueTypeId: 5,
      priorityId: 2,
      customFields: [
        { backlogFieldId: 100, formFieldName: "email" },
      ],
    });
    assert.equal(result.success, true);
  });

  it("rejects invalid priority", () => {
    const result = BacklogFieldMappingSchema.safeParse({ priorityId: 5 });
    assert.equal(result.success, false);
  });

  it("rejects negative issueTypeId", () => {
    const result = BacklogFieldMappingSchema.safeParse({ issueTypeId: -1 });
    assert.equal(result.success, false);
  });

  it("rejects too many custom fields", () => {
    const fields = Array.from({ length: 21 }, (_, i) => ({
      backlogFieldId: i + 1,
      formFieldName: `field_${i}`,
    }));
    const result = BacklogFieldMappingSchema.safeParse({ customFields: fields });
    assert.equal(result.success, false);
  });

  it("accepts 20 custom fields", () => {
    const fields = Array.from({ length: 20 }, (_, i) => ({
      backlogFieldId: i + 1,
      formFieldName: `field_${i}`,
    }));
    const result = BacklogFieldMappingSchema.safeParse({ customFields: fields });
    assert.equal(result.success, true);
  });
});

describe("SummaryMappingSchema", () => {
  it("validates field type", () => {
    const result = SummaryMappingSchema.safeParse({ type: "field", field: "subject" });
    assert.equal(result.success, true);
  });

  it("validates template type", () => {
    const result = SummaryMappingSchema.safeParse({ type: "template", template: "Hello {name}" });
    assert.equal(result.success, true);
  });

  it("rejects invalid type", () => {
    const result = SummaryMappingSchema.safeParse({ type: "auto" });
    assert.equal(result.success, false);
  });

  it("rejects template exceeding 500 chars", () => {
    const result = SummaryMappingSchema.safeParse({ type: "template", template: "A".repeat(501) });
    assert.equal(result.success, false);
  });
});

describe("DescriptionMappingSchema", () => {
  it("validates auto type", () => {
    const result = DescriptionMappingSchema.safeParse({ type: "auto" });
    assert.equal(result.success, true);
  });

  it("validates field type", () => {
    const result = DescriptionMappingSchema.safeParse({ type: "field", field: "message" });
    assert.equal(result.success, true);
  });

  it("validates template type", () => {
    const result = DescriptionMappingSchema.safeParse({ type: "template", template: "Content: {msg}" });
    assert.equal(result.success, true);
  });

  it("rejects template exceeding 5000 chars", () => {
    const result = DescriptionMappingSchema.safeParse({ type: "template", template: "A".repeat(5001) });
    assert.equal(result.success, false);
  });
});

describe("CustomFieldMappingSchema", () => {
  it("validates valid mapping", () => {
    const result = CustomFieldMappingSchema.safeParse({ backlogFieldId: 42, formFieldName: "email" });
    assert.equal(result.success, true);
  });

  it("rejects negative backlogFieldId", () => {
    const result = CustomFieldMappingSchema.safeParse({ backlogFieldId: -1, formFieldName: "email" });
    assert.equal(result.success, false);
  });

  it("rejects zero backlogFieldId", () => {
    const result = CustomFieldMappingSchema.safeParse({ backlogFieldId: 0, formFieldName: "email" });
    assert.equal(result.success, false);
  });

  it("rejects float backlogFieldId", () => {
    const result = CustomFieldMappingSchema.safeParse({ backlogFieldId: 1.5, formFieldName: "email" });
    assert.equal(result.success, false);
  });
});

describe("DEFAULT_BACKLOG_MAPPING", () => {
  it("has auto description and normal priority", () => {
    assert.equal(DEFAULT_BACKLOG_MAPPING.summary, undefined);
    assert.deepEqual(DEFAULT_BACKLOG_MAPPING.description, { type: "auto" });
    assert.equal(DEFAULT_BACKLOG_MAPPING.priorityId, 3);
  });

  it("passes schema validation", () => {
    const result = BacklogFieldMappingSchema.safeParse(DEFAULT_BACKLOG_MAPPING);
    assert.equal(result.success, true);
  });
});
