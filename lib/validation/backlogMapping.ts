// lib/validation/backlogMapping.ts
// Backlog field mapping configuration schema

import { z } from "zod";

/**
 * Mapping source types:
 * - "field": Use a specific form field value
 * - "template": Use a template string with {fieldName} placeholders
 * - "static": Use a static value
 */

// Summary mapping - can be field value or template
export const SummaryMappingSchema = z.object({
  type: z.enum(["field", "template"]),
  // For "field" type: which form field to use
  field: z.string().optional(),
  // For "template" type: template string like "New inquiry from {company}"
  template: z.string().max(500).optional(),
});

// Description mapping - typically a template
export const DescriptionMappingSchema = z.object({
  type: z.enum(["field", "template", "auto"]),
  // For "field" type: which form field to use
  field: z.string().optional(),
  // For "template" type: multi-line template
  template: z.string().max(5000).optional(),
  // For "auto" type: include all fields automatically (default behavior)
});

// Custom field mapping - map form field to Backlog custom field
export const CustomFieldMappingSchema = z.object({
  // Backlog custom field ID
  backlogFieldId: z.number().int().positive(),
  // Form field name to get value from
  formFieldName: z.string(),
});

// Complete field mapping configuration
export const BacklogFieldMappingSchema = z.object({
  // Summary (issue title) mapping
  summary: SummaryMappingSchema.optional(),

  // Description mapping
  description: DescriptionMappingSchema.optional(),

  // Issue type ID (if not set, uses first available)
  issueTypeId: z.number().int().positive().optional(),

  // Priority ID (1=Low, 2=Normal, 3=High, 4=Urgent in Backlog)
  priorityId: z.number().int().min(1).max(4).optional(),

  // Custom field mappings
  customFields: z.array(CustomFieldMappingSchema).max(20).optional(),
});

export type BacklogFieldMapping = z.infer<typeof BacklogFieldMappingSchema>;
export type SummaryMapping = z.infer<typeof SummaryMappingSchema>;
export type DescriptionMapping = z.infer<typeof DescriptionMappingSchema>;
export type CustomFieldMapping = z.infer<typeof CustomFieldMappingSchema>;

/**
 * Default mapping - backward compatible behavior
 */
export const DEFAULT_BACKLOG_MAPPING: BacklogFieldMapping = {
  summary: undefined, // Will use default "[FormGate] Form Name"
  description: { type: "auto" }, // Include all fields
  priorityId: 3, // Normal
};

/**
 * Apply template string with form field values
 * Replaces {fieldName} with actual values
 */
export function applyTemplate(
  template: string,
  payload: Record<string, unknown>
): string {
  return template.replace(/\{(\w+)\}/g, (match, fieldName) => {
    const value = payload[fieldName];
    if (value === null || value === undefined) return "";
    return String(value);
  });
}

/**
 * Build summary from mapping config
 */
export function buildMappedSummary(
  mapping: SummaryMapping | undefined,
  payload: Record<string, unknown>,
  formName: string,
  formSlug: string
): string {
  if (!mapping) {
    // Default: "[FormGate] Form Name (/slug)"
    const name = (formName || "Form").trim();
    const slug = (formSlug || "").trim();
    return slug ? `[FormGate] ${name} (/${slug})` : `[FormGate] ${name}`;
  }

  if (mapping.type === "field" && mapping.field) {
    const value = payload[mapping.field];
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim().slice(0, 255); // Backlog summary max ~255
    }
    // Fallback to default if field is empty
    return `[FormGate] ${formName}`;
  }

  if (mapping.type === "template" && mapping.template) {
    const result = applyTemplate(mapping.template, payload).trim();
    return result || `[FormGate] ${formName}`;
  }

  return `[FormGate] ${formName}`;
}

/**
 * Build description from mapping config
 */
export function buildMappedDescription(
  mapping: DescriptionMapping | undefined,
  payload: Record<string, unknown>,
  formName: string,
  formSlug: string,
  submissionId: string
): string {
  // Format timestamp
  const fmt = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const timestamp = `${fmt.format(new Date())} JST`;

  // Header info
  const header = [
    `Time: ${timestamp}`,
    `Form: ${formName} (/${formSlug})`,
    `Submission ID: ${submissionId}`,
    "",
  ].join("\n");

  if (!mapping || mapping.type === "auto") {
    // Default: include all fields
    const lines = Object.entries(payload ?? {}).map(
      ([k, v]) => `- ${k}: ${String(v ?? "")}`
    );
    return `${header}Payload:\n${lines.join("\n")}`;
  }

  if (mapping.type === "field" && mapping.field) {
    const value = payload[mapping.field];
    return `${header}${String(value ?? "")}`;
  }

  if (mapping.type === "template" && mapping.template) {
    const content = applyTemplate(mapping.template, payload);
    return `${header}${content}`;
  }

  // Fallback to auto
  const lines = Object.entries(payload ?? {}).map(
    ([k, v]) => `- ${k}: ${String(v ?? "")}`
  );
  return `${header}Payload:\n${lines.join("\n")}`;
}
