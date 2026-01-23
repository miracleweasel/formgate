// lib/forms/utils.ts
export function slugify(input: string): string {
  const s = String(input ?? "").trim().toLowerCase();
  // Simple, lisible, suffisant pour J2 (pas d'i18n complexe)
  return s
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-")
    .replace(/^\-|\-$/g, "");
}

export function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}
