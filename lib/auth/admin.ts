// lib/auth/admin.ts
// Server-only helpers (ne jamais importer côté client)

export type GetAdminEmailFn = () => Promise<string | null | undefined>;
export type GetAdminPasswordFn = () => Promise<string | null | undefined>;

// IMPORTANT: ne JAMAIS mettre de secrets en dur dans le repo.
// Pour MVP: on lit depuis env uniquement côté serveur.
export const getAdminEmail: GetAdminEmailFn = async () => {
  const v = process.env.ADMIN_EMAIL;
  return v ? v.trim() : null;
};

export const getAdminPassword: GetAdminPasswordFn = async () => {
  const v = process.env.ADMIN_PASSWORD;
  return v ? v : null;
};
