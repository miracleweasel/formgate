// lib/validation/forms.ts
import { z } from "zod";

/**
 * Minimal validation for POST /api/forms
 * - trim strings
 * - enforce max length
 * - soft slug format
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
});

export type CreateFormInput = z.infer<typeof CreateFormSchema>;
