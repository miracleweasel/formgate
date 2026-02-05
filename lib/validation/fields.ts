// lib/validation/fields.ts
// Custom form field types and validation schemas

import { z } from "zod";

// =============================================================================
// Field Types
// =============================================================================

export const FIELD_TYPES = ["text", "email", "number", "textarea", "select"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

// =============================================================================
// Field Definition Schema
// =============================================================================

// Safe field name pattern: alphanumeric + underscore, starts with letter
const FieldNameSchema = z
  .string()
  .trim()
  .min(1, "Field name is required")
  .max(50, "Field name too long")
  .regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    "Field name must start with a letter and contain only letters, numbers, underscores"
  );

// Select option schema
const SelectOptionSchema = z.object({
  value: z.string().trim().min(1).max(200),
  label: z.string().trim().min(1).max(200),
});

// Base field schema (common properties)
const BaseFieldSchema = z.object({
  name: FieldNameSchema,
  label: z.string().trim().min(1, "Label is required").max(200),
  required: z.boolean().default(false),
  placeholder: z.string().trim().max(200).optional().or(z.literal("")),
});

// Text field
const TextFieldSchema = BaseFieldSchema.extend({
  type: z.literal("text"),
  minLength: z.number().int().min(0).max(1000).optional(),
  maxLength: z.number().int().min(1).max(1000).optional(),
});

// Email field
const EmailFieldSchema = BaseFieldSchema.extend({
  type: z.literal("email"),
});

// Number field
const NumberFieldSchema = BaseFieldSchema.extend({
  type: z.literal("number"),
  min: z.number().optional(),
  max: z.number().optional(),
});

// Textarea field
const TextareaFieldSchema = BaseFieldSchema.extend({
  type: z.literal("textarea"),
  minLength: z.number().int().min(0).max(10000).optional(),
  maxLength: z.number().int().min(1).max(10000).optional(),
});

// Select field (requires options)
const SelectFieldSchema = BaseFieldSchema.extend({
  type: z.literal("select"),
  options: z
    .array(SelectOptionSchema)
    .min(1, "Select requires at least one option")
    .max(50),
});

// =============================================================================
// Combined Field Schema
// =============================================================================

export const FormFieldSchema = z.discriminatedUnion("type", [
  TextFieldSchema,
  EmailFieldSchema,
  NumberFieldSchema,
  TextareaFieldSchema,
  SelectFieldSchema,
]);

export type FormField = z.infer<typeof FormFieldSchema>;

// =============================================================================
// Fields Array Schema (for form creation/editing)
// =============================================================================

export const FormFieldsArraySchema = z
  .array(FormFieldSchema)
  .max(20, "Maximum 20 fields allowed")
  .refine(
    (fields) => {
      const names = fields.map((f) => f.name.toLowerCase());
      return new Set(names).size === names.length;
    },
    { message: "Field names must be unique" }
  );

export type FormFieldsArray = z.infer<typeof FormFieldsArraySchema>;

// =============================================================================
// Default Fields (backward compatibility)
// =============================================================================

export const DEFAULT_FIELDS: FormField[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    required: false,
    placeholder: "",
  },
  {
    name: "message",
    label: "Message",
    type: "textarea",
    required: true,
    placeholder: "",
  },
];

// =============================================================================
// Dynamic Submission Validation
// =============================================================================

/**
 * Build a Zod schema dynamically based on field definitions.
 * Used for server-side validation of form submissions.
 */
export function buildSubmissionSchema(
  fields: FormField[]
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "text": {
        let s = z.string().trim();
        if (field.minLength) s = s.min(field.minLength);
        if (field.maxLength) s = s.max(field.maxLength);
        fieldSchema = field.required
          ? s.min(1, `${field.label} is required`)
          : s.optional().or(z.literal("")).or(z.null());
        break;
      }

      case "email": {
        const s = z.string().trim().email("Invalid email format");
        fieldSchema = field.required
          ? s.min(1, `${field.label} is required`)
          : s.optional().or(z.literal("")).or(z.null());
        break;
      }

      case "number": {
        let s = z.coerce.number();
        if (field.min !== undefined) s = s.min(field.min);
        if (field.max !== undefined) s = s.max(field.max);
        fieldSchema = field.required
          ? s
          : s.optional().or(z.literal("")).or(z.null());
        break;
      }

      case "textarea": {
        let s = z.string().trim();
        if (field.minLength) s = s.min(field.minLength);
        if (field.maxLength) s = s.max(field.maxLength);
        fieldSchema = field.required
          ? s.min(1, `${field.label} is required`)
          : s.optional().or(z.literal("")).or(z.null());
        break;
      }

      case "select": {
        const validValues = field.options.map((o) => o.value);
        const s = z.enum(validValues as [string, ...string[]]);
        fieldSchema = field.required
          ? s
          : s.optional().or(z.literal("")).or(z.null());
        break;
      }

      default:
        fieldSchema = z.unknown();
    }

    shape[field.name] = fieldSchema;
  }

  return z.object(shape);
}
