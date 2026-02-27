// lib/backlog/client.ts
import { normalizeSpaceUrl } from "./validators";

export type BacklogClientConfig = {
  spaceUrl: string;
  apiKey: string;
};

// ============================================================================
// BACKLOG API RATE LIMITING
// Backlog allows ~600 requests/hour per API key.
// We limit to 500/hour to have margin for safety.
// ============================================================================

const BACKLOG_RATE_LIMIT = 500; // requests per hour
const BACKLOG_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

// Rate limit buckets keyed by normalized spaceUrl
const backlogRateLimitBuckets = new Map<string, RateLimitBucket>();

// Cleanup old buckets periodically
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

function cleanupBuckets() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, bucket] of backlogRateLimitBuckets) {
    if (bucket.resetAt < now) {
      backlogRateLimitBuckets.delete(key);
    }
  }
}

/**
 * Check and consume Backlog API rate limit.
 * Returns true if request is allowed, false if rate limited.
 */
function checkBacklogRateLimit(spaceUrl: string): boolean {
  cleanupBuckets();

  const key = normalizeSpaceUrl(spaceUrl);
  const now = Date.now();

  let bucket = backlogRateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    // Start new window
    bucket = { count: 1, resetAt: now + BACKLOG_RATE_WINDOW_MS };
    backlogRateLimitBuckets.set(key, bucket);
    return true;
  }

  if (bucket.count >= BACKLOG_RATE_LIMIT) {
    return false; // Rate limited
  }

  bucket.count++;
  return true;
}

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
 * Rate limited to 500 requests/hour per spaceUrl.
 */
export async function backlogGetJson<T>(
  cfg: BacklogClientConfig,
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  // Check rate limit before making request
  if (!checkBacklogRateLimit(cfg.spaceUrl)) {
    return { ok: false, status: 429, error: "rate_limited" };
  }

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

/**
 * POST to Backlog API.
 * Rate limited to 500 requests/hour per spaceUrl.
 */
export async function backlogPostJson<T>(
  cfg: BacklogClientConfig,
  path: string,
  body: Record<string, unknown>,
  query?: Record<string, string | number | boolean | null | undefined>
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  // Check rate limit before making request
  if (!checkBacklogRateLimit(cfg.spaceUrl)) {
    return { ok: false, status: 429, error: "rate_limited" };
  }

  const url = makeBacklogApiUrl(cfg, path, query);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      cache: "no-store",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
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
    // Backlog may sometimes return empty body. Still treat as ok-ish if status was 2xx.
    return { ok: true, data: {} as T };
  }
}

type BacklogProject = { id: number; projectKey: string; name: string };
type BacklogIssueType = { id: number; name: string };
type BacklogCustomField = { id: number; name: string; typeId: number };

export type CustomFieldValue = {
  backlogFieldId: number;
  value: string | number | boolean | null;
};

export async function createBacklogIssueBestEffort(args: {
  spaceUrl: string;
  apiKey: string;
  projectKey: string;
  summary: string;
  description: string;
  priorityId?: number;
  issueTypeId?: number;
  customFields?: CustomFieldValue[];
}) {
  const cfg: BacklogClientConfig = { spaceUrl: args.spaceUrl, apiKey: args.apiKey };

  // 1) Resolve projectId from projectKey
  const projectsRes = await backlogGetJson<BacklogProject[]>(cfg, "/api/v2/projects");
  if (!projectsRes.ok) return { ok: false as const, error: "projects_lookup_failed" };

  const project = projectsRes.data.find((p) => p.projectKey === args.projectKey);
  if (!project) return { ok: false as const, error: "project_not_found" };

  // 2) Resolve issueTypeId
  let issueTypeId = args.issueTypeId;
  if (!issueTypeId) {
    // Get first available issue type
    const typesRes = await backlogGetJson<BacklogIssueType[]>(
      cfg,
      `/api/v2/projects/${project.id}/issueTypes`
    );
    if (!typesRes.ok) return { ok: false as const, error: "issuetype_lookup_failed" };

    const issueType = typesRes.data[0];
    if (!issueType) return { ok: false as const, error: "no_issue_type" };
    issueTypeId = issueType.id;
  }

  // 3) Build issue body
  const issueBody: Record<string, unknown> = {
    projectId: project.id,
    summary: args.summary,
    description: args.description,
    issueTypeId,
    priorityId: args.priorityId ?? 3, // Default: Normal
  };

  // 4) Add custom fields if provided
  if (args.customFields && args.customFields.length > 0) {
    for (const cf of args.customFields) {
      if (cf.value !== null && cf.value !== undefined && cf.value !== "") {
        // Backlog custom field format: customField_{id}
        issueBody[`customField_${cf.backlogFieldId}`] = cf.value;
      }
    }
  }

  // 5) Create issue
  const createRes = await backlogPostJson<any>(cfg, "/api/v2/issues", issueBody);

  if (!createRes.ok) return { ok: false as const, error: "issue_create_failed" };
  return { ok: true as const };
}

/**
 * Get custom fields for a project (for mapping UI)
 */
export async function getProjectCustomFields(
  cfg: BacklogClientConfig,
  projectIdOrKey: string | number
): Promise<{ ok: true; data: BacklogCustomField[] } | { ok: false; error: string }> {
  const res = await backlogGetJson<BacklogCustomField[]>(
    cfg,
    `/api/v2/projects/${projectIdOrKey}/customFields`
  );
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, data: res.data };
}
