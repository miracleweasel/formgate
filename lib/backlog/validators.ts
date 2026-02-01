// lib/backlog/validators.ts
import { z } from "zod";

const trimLower = (s: string) => s.trim().toLowerCase();

export const backlogConnectionUpsertSchema = z.object({
  spaceUrl: z
    .string()
    .min(1)
    .transform((s) => s.trim())
    .refine((s) => {
      try {
        const u = new URL(s);
        return u.protocol === "https:" && !!u.hostname;
      } catch {
        return false;
      }
    }, "Invalid spaceUrl (must be https URL)"),
  apiKey: z.string().min(1).transform((s) => s.trim()),
  defaultProjectKey: z
    .string()
    .min(1)
    .max(50)
    .transform((s) => s.trim())
    .refine((s) => /^[A-Za-z0-9_]+$/.test(s), "Invalid project key"),
});

export const backlogFormSettingsUpsertSchema = z.object({
  enabled: z.boolean(),
  projectKey: z
    .string()
    .trim()
    .max(50)
    .refine((s) => s === "" || /^[A-Za-z0-9_]+$/.test(s), "Invalid project key")
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      const s = v.trim();
      return s.length === 0 ? null : s; // normalize empty => null
    }),
});

export function normalizeSpaceUrl(spaceUrl: string) {
  // remove trailing slash to avoid double slashes
  return spaceUrl.replace(/\/+$/, "");
}

export function safeBoolHasApiKey(apiKey: string | null | undefined) {
  return !!(apiKey && apiKey.trim().length > 0);
}

export function normalizeEmail(email: string) {
  return trimLower(email);
}
