// lib/validation/forms.ts
import { z } from "zod";
import { FormFieldsArraySchema } from "./fields";

/**
 * Validation for POST /api/forms
 * - trim strings
 * - enforce max length
 * - soft slug format
 * - optional custom fields (defaults to email+message)
 */

export const CreateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(200, "name too long"),

  slug: z
    .string()
    .trim()
    .max(200, "slug too long")
    .regex(/^[a-z0-9-]*$/i, "invalid slug format")
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .trim()
    .max(1000, "description too long")
    .optional()
    .or(z.literal("")),

  fields: FormFieldsArraySchema.optional(),
});

export type CreateFormInput = z.infer<typeof CreateFormSchema>;

/**
 * Validation for PATCH /api/forms/[id]
 * All fields optional for partial updates
 */
export const UpdateFormSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),

  slug: z
    .string()
    .trim()
    .max(200)
    .regex(/^[a-z0-9-]*$/i, "invalid slug format")
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("")),

  fields: FormFieldsArraySchema.optional(),
});

export type UpdateFormInput = z.infer<typeof UpdateFormSchema>;
