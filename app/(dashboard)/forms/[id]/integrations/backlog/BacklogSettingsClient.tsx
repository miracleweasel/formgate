// app/(dashboard)/forms/[id]/integrations/backlog/BacklogSettingsClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  formId: string;
  formName: string;
  formSlug: string;
};

type GetResp =
  | {
      ok: true;
      connection: {
        spaceUrl: string;
        defaultProjectKey: string;
      };
      settings: {
        enabled: boolean;
        projectKey: string | null;
      };
    }
  | { ok: false; error: string };

function normalizeProjectKey(v: string) {
  const s = (v ?? "").trim();
  if (!s) return "";
  return s.replace(/\s+/g, "").toUpperCase();
}

export default function BacklogSettingsClient({ formId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [spaceUrl, setSpaceUrl] = useState("");
  const [defaultProjectKey, setDefaultProjectKey] = useState("");

  const [enabled, setEnabled] = useState(false);
  const [projectKeyOverride, setProjectKeyOverride] = useState("");

  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );
  const [testMsg, setTestMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );

  const effectiveProjectKey = useMemo(() => {
    const ov = normalizeProjectKey(projectKeyOverride);
    return ov || defaultProjectKey || "";
  }, [projectKeyOverride, defaultProjectKey]);

  async function load() {
    setLoading(true);
    setMsg(null);
    setTestMsg(null);

    try {
      const res = await fetch(`/api/forms/${formId}/integrations/backlog`, {
        method: "GET",
        cache: "no-store",
      });

      const data = (await res.json()) as unknown;

      // ✅ garde anti JSON bizarre
      if (!data || typeof data !== "object") {
        setMsg({ kind: "err", text: "Invalid response." });
        return;
      }

      // On recaste après le garde
      const typed = data as GetResp;

      if (!res.ok) {
        setMsg({ kind: "err", text: "Failed to load settings." });
        return;
      }

      // ✅ narrowing TS (discriminant)
      if (typed.ok !== true) {
        setMsg({ kind: "err", text: typed.error || "Failed to load settings." });
        return;
      }

      setSpaceUrl(typed.connection.spaceUrl);
      setDefaultProjectKey(typed.connection.defaultProjectKey);

      setEnabled(!!typed.settings.enabled);
      setProjectKeyOverride(typed.settings.projectKey ?? "");
    } catch {
      setMsg({ kind: "err", text: "Network error." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  async function save() {
    setSaving(true);
    setMsg(null);
    setTestMsg(null);

    const projectKey = normalizeProjectKey(projectKeyOverride);

    try {
      const res = await fetch(`/api/forms/${formId}/integrations/backlog`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled: !!enabled,
          projectKey: projectKey || null,
        }),
      });

      const data = (await res.json().catch(() => null)) as unknown;

      if (!data || typeof data !== "object") {
        if (!res.ok) {
          setMsg({ kind: "err", text: "Save failed." });
          return;
        }
        setMsg({ kind: "ok", text: "Saved." });
        await load();
        return;
      }

      const obj = data as { error?: unknown };

      if (!res.ok) {
        setMsg({
          kind: "err",
          text: typeof obj.error === "string" ? obj.error : "Save failed.",
        });
        return;
      }

      setMsg({ kind: "ok", text: "Saved." });
      await load();
    } catch {
      setMsg({ kind: "err", text: "Network error." });
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setTestMsg(null);
    setMsg(null);

    try {
      const res = await fetch(`/api/integrations/backlog/test`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = (await res.json().catch(() => null)) as unknown;

      if (!data || typeof data !== "object") {
        if (!res.ok) {
          setTestMsg({ kind: "err", text: "Test failed." });
          return;
        }
        setTestMsg({ kind: "ok", text: "Connection OK." });
        return;
      }

      const obj = data as { error?: unknown };

      if (!res.ok) {
        setTestMsg({
          kind: "err",
          text: typeof obj.error === "string" ? obj.error : "Test failed.",
        });
        return;
      }

      setTestMsg({ kind: "ok", text: "Connection OK." });
    } catch {
      setTestMsg({ kind: "err", text: "Network error." });
    } finally {
      setTesting(false);
    }
  }


  if (loading) {
    return (
      <div className="rounded-md border p-4 text-sm text-gray-600">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection info (safe) */}
      <section className="rounded-md border p-4 space-y-2">
        <h2 className="text-lg font-semibold">Connection (safe)</h2>

        <div className="text-sm">
          <div className="text-xs text-gray-500">Space URL</div>
          <div className="break-all">{spaceUrl || "—"}</div>
        </div>

        <div className="text-sm">
          <div className="text-xs text-gray-500">Default project key</div>
          <div>{defaultProjectKey || "—"}</div>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={testConnection}
            disabled={testing}
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
          >
            {testing ? "Testing…" : "Test connection"}
          </button>

          {testMsg && (
            <div
              className={`text-sm px-3 py-2 rounded-md ${
                testMsg.kind === "ok"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {testMsg.text}
            </div>
          )}
        </div>
      </section>

      {/* Form settings */}
      <section className="rounded-md border p-4 space-y-4">
        <h2 className="text-lg font-semibold">Form settings</h2>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enable for this form
        </label>

        <div className="space-y-1">
          <div className="text-xs text-gray-500">
            Project key override (optional)
          </div>

          <input
            value={projectKeyOverride}
            onChange={(e) => setProjectKeyOverride(e.target.value)}
            placeholder="e.g. FG"
            className="w-full rounded-md border px-3 py-2 text-sm"
          />

          <div className="text-xs text-gray-500">
            Effective project key:{" "}
            <span className="font-medium">{effectiveProjectKey || "—"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-md bg-black px-3 py-2 text-sm text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          {msg && (
            <div
              className={`text-sm px-3 py-2 rounded-md ${
                msg.kind === "ok"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {msg.text}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500">
          Note: apiKey is never exposed. All Backlog actions are server-side.
        </div>
      </section>
    </div>
  );
}
