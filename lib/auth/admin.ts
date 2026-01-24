// lib/auth/admin.ts
export function getAdminEmail(): string {
  const v = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!v) throw new Error("Missing ADMIN_EMAIL env var");
  return v;
}

export function getAdminPassword(): string {
  const v = process.env.ADMIN_PASSWORD ?? "";
  if (!v) throw new Error("Missing ADMIN_PASSWORD env var");
  return v;
}
