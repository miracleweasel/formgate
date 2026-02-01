// lib/backlog/client.ts
import { normalizeSpaceUrl } from "./validators";

export type BacklogClientConfig = {
  spaceUrl: string;
  apiKey: string;
};

export function makeBacklogApiUrl(
  cfg: BacklogClientConfig,
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>
) {
  const base = normalizeSpaceUrl(cfg.spaceUrl);
  const url = new URL(`${base}${path.startsWith("/") ? "" : "/"}${path}`);

  // Backlog API uses apiKey as query param
  url.searchParams.set("apiKey", cfg.apiKey);

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === null || v === undefined) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Minimal Backlog fetch wrapper.
 * IMPORTANT: Never log apiKey, never log request headers.
 */
export async function backlogGetJson<T>(
  cfg: BacklogClientConfig,
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const url = makeBacklogApiUrl(cfg, path, query);

  let res: Response;
  try {
    res = await fetch(url, { method: "GET", cache: "no-store" });
  } catch {
    return { ok: false, status: 0, error: "network_error" };
  }

  if (!res.ok) {
    return { ok: false, status: res.status, error: "http_error" };
  }

  try {
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, status: res.status, error: "invalid_json" };
  }
}
