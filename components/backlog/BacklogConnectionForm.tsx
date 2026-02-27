// components/backlog/BacklogConnectionForm.tsx
"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

type Props = {
  compact?: boolean;
  onSaved?: () => void;
  initialData?: {
    spaceUrl: string;
    defaultProjectKey: string;
    hasApiKey: boolean;
  } | null;
};

export default function BacklogConnectionForm({
  compact = false,
  onSaved,
  initialData,
}: Props) {
  const s = t.settings;

  const [spaceUrl, setSpaceUrl] = useState(initialData?.spaceUrl ?? "");
  const [apiKey, setApiKey] = useState("");
  const [projectKey, setProjectKey] = useState(
    initialData?.defaultProjectKey ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(
    null
  );
  const [testMsg, setTestMsg] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  const hasStoredKey = initialData?.hasApiKey ?? false;

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    setTestMsg(null);

    const effectiveApiKey = apiKey.trim() || undefined;

    // If no API key entered and none stored, require one
    if (!effectiveApiKey && !hasStoredKey) {
      setMsg({ kind: "err", text: t.errors.required });
      setSaving(false);
      return;
    }

    // We need to send something for apiKey — the backend requires it.
    // If user didn't type a new one, we need the backend to keep existing.
    // But the current POST API requires apiKey. We'll send a placeholder
    // that the backend will interpret — actually let's check: the existing
    // API always requires apiKey min(1). So we must provide one.
    // If user has a stored key and didn't change it, we use a sentinel.
    // But the backend will encrypt and overwrite it...
    // The simplest approach: require the user to re-enter the key, OR
    // we pass the key only if provided. Let's just skip save if no key available.
    if (!effectiveApiKey && hasStoredKey) {
      // No new key provided but one exists — user wants to update URL/project only
      // We can't call the existing POST since it requires apiKey.
      // For now, show a message asking the user to re-enter the key.
      // Actually this is a UX issue. Let's just make it work by informing
      // the user. We'll handle this differently: leave apiKey field as "required
      // for first setup" and optional after.
      // For simplicity, let's just not update if no apiKey and show saved
      // Actually the best UX: the POST endpoint requires apiKey. Let's inform.
      setMsg({ kind: "err", text: s.apiKeyPlaceholder });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/integrations/backlog", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          spaceUrl: spaceUrl.trim(),
          apiKey: effectiveApiKey,
          defaultProjectKey: projectKey.trim(),
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setMsg({
          kind: "err",
          text: data?.error ?? s.saveFailed,
        });
        return;
      }

      setMsg({ kind: "ok", text: s.saved });
      setApiKey("");
      onSaved?.();
    } catch {
      setMsg({ kind: "err", text: t.errors.network });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestMsg(null);
    setMsg(null);

    try {
      const res = await fetch("/api/integrations/backlog/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        setTestMsg({ kind: "err", text: s.testFailed });
        return;
      }

      setTestMsg({ kind: "ok", text: s.testSuccess });
    } catch {
      setTestMsg({ kind: "err", text: t.errors.network });
    } finally {
      setTesting(false);
    }
  }

  const isConnected = hasStoredKey && !!initialData?.spaceUrl;

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      {/* Connection status */}
      <div className="flex items-center gap-2">
        <span
          className="badge"
          style={
            isConnected
              ? {
                  background: "var(--color-success-100)",
                  color: "var(--color-success-700)",
                }
              : {
                  background: "var(--color-neutral-100)",
                  color: "var(--color-neutral-600)",
                }
          }
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              display: "inline-block",
              background: isConnected
                ? "var(--color-success-500)"
                : "var(--color-neutral-400)",
            }}
          />
          {isConnected ? s.connected : s.notConnected}
        </span>
      </div>

      {/* Space URL */}
      <div className="form-field">
        <label className="form-label form-label-required">{s.spaceUrl}</label>
        <input
          type="url"
          value={spaceUrl}
          onChange={(e) => setSpaceUrl(e.target.value)}
          placeholder={s.spaceUrlPlaceholder}
          className="input"
        />
        <span className="form-hint">{s.spaceUrlHint}</span>
      </div>

      {/* API Key */}
      <div className="form-field">
        <label className="form-label form-label-required">
          {s.apiKey}
          {hasStoredKey && (
            <span className="badge badge-success" style={{ marginLeft: 8 }}>
              {s.apiKeyStored}
            </span>
          )}
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={
            hasStoredKey ? "••••••••" : s.apiKeyPlaceholder
          }
          className="input"
          autoComplete="off"
        />
        <span className="form-hint">{s.apiKeyHint}</span>
      </div>

      {/* Project Key */}
      <div className="form-field">
        <label className="form-label form-label-required">
          {s.projectKey}
        </label>
        <input
          type="text"
          value={projectKey}
          onChange={(e) => setProjectKey(e.target.value)}
          placeholder={s.projectKeyPlaceholder}
          className="input"
        />
        <span className="form-hint">{s.projectKeyHint}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !spaceUrl.trim() || !projectKey.trim()}
          className="btn btn-primary btn-sm"
        >
          {saving ? s.saving : s.save}
        </button>

        {isConnected && (
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="btn btn-secondary btn-sm"
          >
            {testing ? s.testing : s.testConnection}
          </button>
        )}

        {msg && (
          <span
            className="badge"
            style={
              msg.kind === "ok"
                ? {
                    background: "var(--color-success-100)",
                    color: "var(--color-success-700)",
                  }
                : {
                    background: "var(--color-error-100)",
                    color: "var(--color-error-700)",
                  }
            }
          >
            {msg.text}
          </span>
        )}

        {testMsg && (
          <span
            className="badge"
            style={
              testMsg.kind === "ok"
                ? {
                    background: "var(--color-success-100)",
                    color: "var(--color-success-700)",
                  }
                : {
                    background: "var(--color-error-100)",
                    color: "var(--color-error-700)",
                  }
            }
          >
            {testMsg.text}
          </span>
        )}
      </div>

      {/* Note */}
      <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
        {s.apiKeyNote}
      </p>
    </div>
  );
}
