// app/(dashboard)/forms/[id]/integrations/backlog/BacklogSettingsClient.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { t } from "@/lib/i18n";

type FormFieldDef = {
  name: string;
  label: string;
  type: string;
};

type Props = {
  formId: string;
  formName: string;
  formSlug: string;
  formFields: FormFieldDef[];
};

type AssignmentRuleMatch = { value: string; assigneeId: number };

type AssignmentRule = {
  type: "static" | "field_match";
  assigneeId?: number;
  field?: string;
  rules?: AssignmentRuleMatch[];
  fallbackAssigneeId?: number;
};

type SubTaskTemplate = {
  summary: string;
  assigneeId?: number;
};

type FieldMapping = {
  summary?: { type: "field" | "template"; field?: string; template?: string };
  description?: { type: "field" | "template" | "auto"; field?: string; template?: string };
  issueTypeId?: number;
  priorityId?: number;
  customFields?: { backlogFieldId: number; formFieldName: string }[];
  assignmentRule?: AssignmentRule;
  subTasks?: SubTaskTemplate[];
};

type GetResp =
  | {
      ok: true;
      connection: { spaceUrl: string; defaultProjectKey: string };
      settings: {
        enabled: boolean;
        projectKey: string | null;
        fieldMapping: FieldMapping | null;
      };
    }
  | { ok: false; error: string };

type ProjectMeta = {
  issueTypes: { id: number; name: string }[];
  customFields: { id: number; name: string; typeId: number }[];
  priorities: { id: number; name: string }[];
  members: { id: number; name: string }[];
};

function normalizeProjectKey(v: string) {
  const s = (v ?? "").trim();
  if (!s) return "";
  return s.replace(/\s+/g, "").toUpperCase();
}

const bl = t.integrations.backlog;

export default function BacklogSettingsClient({ formId, formFields }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [spaceUrl, setSpaceUrl] = useState("");
  const [defaultProjectKey, setDefaultProjectKey] = useState("");

  const [enabled, setEnabled] = useState(false);
  const [projectKeyOverride, setProjectKeyOverride] = useState("");

  // Field mapping state
  const [summaryType, setSummaryType] = useState<"default" | "field" | "template">("default");
  const [summaryField, setSummaryField] = useState("");
  const [summaryTemplate, setSummaryTemplate] = useState("");

  const [descType, setDescType] = useState<"auto" | "field" | "template">("auto");
  const [descField, setDescField] = useState("");
  const [descTemplate, setDescTemplate] = useState("");

  const [issueTypeId, setIssueTypeId] = useState<number | 0>(0);
  const [priorityId, setPriorityId] = useState<number | 0>(0);

  const [customFieldMappings, setCustomFieldMappings] = useState<
    { backlogFieldId: number; formFieldName: string }[]
  >([]);

  // Assignment rule state
  const [assignType, setAssignType] = useState<"none" | "static" | "field_match">("none");
  const [assignStaticId, setAssignStaticId] = useState<number>(0);
  const [assignField, setAssignField] = useState("");
  const [assignRules, setAssignRules] = useState<AssignmentRuleMatch[]>([]);
  const [assignFallbackId, setAssignFallbackId] = useState<number>(0);

  // Sub-tasks state
  const [subTasks, setSubTasks] = useState<SubTaskTemplate[]>([]);

  // Project metadata from Backlog API
  const [meta, setMeta] = useState<ProjectMeta | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState(false);

  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [testMsg, setTestMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const effectiveProjectKey = useMemo(() => {
    const ov = normalizeProjectKey(projectKeyOverride);
    return ov || defaultProjectKey || "";
  }, [projectKeyOverride, defaultProjectKey]);

  // Apply loaded mapping to state
  function applyMapping(mapping: FieldMapping | null) {
    if (!mapping) {
      setSummaryType("default");
      setSummaryField("");
      setSummaryTemplate("");
      setDescType("auto");
      setDescField("");
      setDescTemplate("");
      setIssueTypeId(0);
      setPriorityId(0);
      setCustomFieldMappings([]);
      setAssignType("none");
      setAssignStaticId(0);
      setAssignField("");
      setAssignRules([]);
      setAssignFallbackId(0);
      setSubTasks([]);
      return;
    }

    if (mapping.summary) {
      setSummaryType(mapping.summary.type);
      setSummaryField(mapping.summary.field ?? "");
      setSummaryTemplate(mapping.summary.template ?? "");
    } else {
      setSummaryType("default");
    }

    if (mapping.description) {
      setDescType(mapping.description.type);
      setDescField(mapping.description.field ?? "");
      setDescTemplate(mapping.description.template ?? "");
    } else {
      setDescType("auto");
    }

    setIssueTypeId(mapping.issueTypeId ?? 0);
    setPriorityId(mapping.priorityId ?? 0);
    setCustomFieldMappings(mapping.customFields ?? []);

    // Assignment rule
    if (mapping.assignmentRule) {
      setAssignType(mapping.assignmentRule.type);
      setAssignStaticId(mapping.assignmentRule.assigneeId ?? 0);
      setAssignField(mapping.assignmentRule.field ?? "");
      setAssignRules(mapping.assignmentRule.rules ?? []);
      setAssignFallbackId(mapping.assignmentRule.fallbackAssigneeId ?? 0);
    } else {
      setAssignType("none");
      setAssignStaticId(0);
      setAssignField("");
      setAssignRules([]);
      setAssignFallbackId(0);
    }

    // Sub-tasks
    setSubTasks(mapping.subTasks ?? []);
  }

  // Build mapping from state
  function buildMapping(): FieldMapping | null {
    const mapping: FieldMapping = {};

    if (summaryType === "field" && summaryField) {
      mapping.summary = { type: "field", field: summaryField };
    } else if (summaryType === "template" && summaryTemplate.trim()) {
      mapping.summary = { type: "template", template: summaryTemplate.trim() };
    }
    // "default" => no summary mapping

    if (descType === "field" && descField) {
      mapping.description = { type: "field", field: descField };
    } else if (descType === "template" && descTemplate.trim()) {
      mapping.description = { type: "template", template: descTemplate.trim() };
    } else {
      mapping.description = { type: "auto" };
    }

    if (issueTypeId > 0) mapping.issueTypeId = issueTypeId;
    if (priorityId > 0) mapping.priorityId = priorityId;

    const validCf = customFieldMappings.filter(
      (cf) => cf.backlogFieldId > 0 && cf.formFieldName
    );
    if (validCf.length > 0) mapping.customFields = validCf;

    // Assignment rule
    if (assignType === "static" && assignStaticId > 0) {
      mapping.assignmentRule = { type: "static", assigneeId: assignStaticId };
    } else if (assignType === "field_match" && assignField) {
      const validRules = assignRules.filter((r) => r.value.trim() && r.assigneeId > 0);
      mapping.assignmentRule = {
        type: "field_match",
        field: assignField,
        rules: validRules.length > 0 ? validRules : undefined,
        fallbackAssigneeId: assignFallbackId > 0 ? assignFallbackId : undefined,
      };
    }

    // Sub-tasks
    const validSt = subTasks.filter((st) => st.summary.trim());
    if (validSt.length > 0) mapping.subTasks = validSt;

    // Return null if only default description (auto)
    const keys = Object.keys(mapping);
    if (keys.length === 1 && mapping.description?.type === "auto") return null;
    if (keys.length === 0) return null;

    return mapping;
  }

  const loadMeta = useCallback(async (projectKey: string) => {
    if (!projectKey) return;
    setMetaLoading(true);
    setMetaError(false);
    try {
      const res = await fetch(
        `/api/integrations/backlog/project-meta?projectKey=${encodeURIComponent(projectKey)}`,
        { cache: "no-store" }
      );
      if (!res.ok) {
        setMetaError(true);
        return;
      }
      const data = await res.json();
      if (data.ok) {
        setMeta({
          issueTypes: data.issueTypes ?? [],
          customFields: data.customFields ?? [],
          priorities: data.priorities ?? [],
          members: data.members ?? [],
        });
      } else {
        setMetaError(true);
      }
    } catch {
      setMetaError(true);
    } finally {
      setMetaLoading(false);
    }
  }, []);

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

      if (!data || typeof data !== "object") {
        setMsg({ kind: "err", text: bl.invalidResponse });
        return;
      }

      const typed = data as GetResp;

      if (!res.ok) {
        setMsg({ kind: "err", text: bl.loadFailed });
        return;
      }

      if (typed.ok !== true) {
        setMsg({ kind: "err", text: typed.error || bl.loadFailed });
        return;
      }

      setSpaceUrl(typed.connection.spaceUrl);
      setDefaultProjectKey(typed.connection.defaultProjectKey);

      setEnabled(!!typed.settings.enabled);
      setProjectKeyOverride(typed.settings.projectKey ?? "");
      applyMapping(typed.settings.fieldMapping);
    } catch {
      setMsg({ kind: "err", text: t.errors.network });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  // Load project metadata when effective project key changes
  useEffect(() => {
    if (effectiveProjectKey) {
      void loadMeta(effectiveProjectKey);
    }
  }, [effectiveProjectKey, loadMeta]);

  async function save() {
    setSaving(true);
    setMsg(null);
    setTestMsg(null);

    const projectKey = normalizeProjectKey(projectKeyOverride);
    const fieldMapping = buildMapping();

    try {
      const res = await fetch(`/api/forms/${formId}/integrations/backlog`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled: !!enabled,
          projectKey: projectKey || null,
          fieldMapping,
        }),
      });

      const data = (await res.json().catch(() => null)) as unknown;

      if (!data || typeof data !== "object") {
        if (!res.ok) {
          setMsg({ kind: "err", text: bl.saveFailed });
          return;
        }
        setMsg({ kind: "ok", text: bl.saved });
        await load();
        return;
      }

      const obj = data as { error?: unknown };

      if (!res.ok) {
        setMsg({
          kind: "err",
          text: typeof obj.error === "string" ? obj.error : bl.saveFailed,
        });
        return;
      }

      setMsg({ kind: "ok", text: bl.saved });
      await load();
    } catch {
      setMsg({ kind: "err", text: t.errors.network });
    } finally {
      setSaving(false);
    }
  }

  async function testConnection() {
    setTesting(true);
    setTestMsg(null);
    setMsg(null);

    try {
      const res = await fetch("/api/integrations/backlog/test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = (await res.json().catch(() => null)) as unknown;

      if (!data || typeof data !== "object") {
        if (!res.ok) {
          setTestMsg({ kind: "err", text: bl.testFailed });
          return;
        }
        setTestMsg({ kind: "ok", text: bl.connectionOk });
        return;
      }

      const obj = data as { error?: unknown };

      if (!res.ok) {
        setTestMsg({
          kind: "err",
          text: typeof obj.error === "string" ? obj.error : bl.testFailed,
        });
        return;
      }

      setTestMsg({ kind: "ok", text: bl.connectionOk });
    } catch {
      setTestMsg({ kind: "err", text: t.errors.network });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="card text-sm" style={{ color: "var(--color-neutral-600)" }}>
        {t.common.loading}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection info (safe) */}
      <section className="card space-y-2">
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>
          {bl.connectionSafe}
        </h2>

        <div className="text-sm">
          <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>{bl.spaceUrl}</div>
          <div className="break-all" style={{ color: "var(--color-neutral-700)" }}>{spaceUrl || "—"}</div>
        </div>

        <div className="text-sm">
          <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>{bl.defaultProjectKey}</div>
          <div style={{ color: "var(--color-neutral-700)" }}>{defaultProjectKey || "—"}</div>
        </div>

        <div className="pt-2 flex gap-2 items-center">
          <button
            type="button"
            onClick={testConnection}
            disabled={testing}
            className="btn btn-secondary btn-sm"
          >
            {testing ? bl.testing : bl.testConnection}
          </button>

          {testMsg && (
            <div
              className="badge"
              style={
                testMsg.kind === "ok"
                  ? { background: "var(--color-success-100)", color: "var(--color-success-700)" }
                  : { background: "var(--color-error-100)", color: "var(--color-error-700)" }
              }
            >
              {testMsg.text}
            </div>
          )}
        </div>
      </section>

      {/* Form settings */}
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>
          {bl.formSettings}
        </h2>

        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-neutral-700)" }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            style={{ accentColor: "var(--color-primary-500)" }}
          />
          {bl.enableForForm}
        </label>

        <div className="space-y-1">
          <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
            {bl.projectKeyOverride}
          </div>
          <input
            value={projectKeyOverride}
            onChange={(e) => setProjectKeyOverride(e.target.value)}
            placeholder={bl.projectKeyPlaceholder}
            className="input"
          />
          <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
            {bl.effectiveProjectKey}:{" "}
            <span className="font-medium" style={{ color: "var(--color-primary-600)" }}>
              {effectiveProjectKey || "—"}
            </span>
          </div>
        </div>
      </section>

      {/* Field Mapping */}
      {enabled && (
        <section className="card space-y-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>
              {bl.fieldMapping}
            </h2>
            <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
              {bl.fieldMappingDesc}
            </p>
          </div>

          {/* Summary mapping */}
          <div className="space-y-2">
            <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
              {bl.summaryMapping}
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="summaryType"
                  checked={summaryType === "default"}
                  onChange={() => setSummaryType("default")}
                />
                {bl.summaryDefault}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="summaryType"
                  checked={summaryType === "field"}
                  onChange={() => setSummaryType("field")}
                />
                {bl.summaryField}
              </label>
              {summaryType === "field" && (
                <select
                  value={summaryField}
                  onChange={(e) => setSummaryField(e.target.value)}
                  className="input"
                >
                  <option value="">{bl.summaryFieldSelect}</option>
                  {formFields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label} ({f.name})
                    </option>
                  ))}
                </select>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="summaryType"
                  checked={summaryType === "template"}
                  onChange={() => setSummaryType("template")}
                />
                {bl.summaryTemplate}
              </label>
              {summaryType === "template" && (
                <input
                  value={summaryTemplate}
                  onChange={(e) => setSummaryTemplate(e.target.value)}
                  placeholder={bl.summaryTemplatePlaceholder}
                  className="input"
                  maxLength={500}
                />
              )}
            </div>
          </div>

          {/* Description mapping */}
          <div className="space-y-2">
            <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
              {bl.descriptionMapping}
            </div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="descType"
                  checked={descType === "auto"}
                  onChange={() => setDescType("auto")}
                />
                {bl.descriptionAuto}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="descType"
                  checked={descType === "field"}
                  onChange={() => setDescType("field")}
                />
                {bl.descriptionField}
              </label>
              {descType === "field" && (
                <select
                  value={descField}
                  onChange={(e) => setDescField(e.target.value)}
                  className="input"
                >
                  <option value="">{bl.summaryFieldSelect}</option>
                  {formFields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label} ({f.name})
                    </option>
                  ))}
                </select>
              )}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="descType"
                  checked={descType === "template"}
                  onChange={() => setDescType("template")}
                />
                {bl.descriptionTemplate}
              </label>
              {descType === "template" && (
                <textarea
                  value={descTemplate}
                  onChange={(e) => setDescTemplate(e.target.value)}
                  placeholder={bl.descriptionTemplatePlaceholder}
                  className="input"
                  rows={4}
                  maxLength={5000}
                />
              )}
            </div>
          </div>

          {/* Issue type & Priority */}
          {metaLoading && (
            <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
              {bl.loadingMeta}
            </div>
          )}

          {metaError && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--color-error-600)" }}>
                {bl.loadMetaFailed}
              </span>
              <button
                type="button"
                onClick={() => void loadMeta(effectiveProjectKey)}
                className="btn btn-secondary btn-sm"
              >
                {bl.refreshMeta}
              </button>
            </div>
          )}

          {meta && !metaLoading && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Issue Type */}
                <div className="space-y-1">
                  <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
                    {bl.issueType}
                  </div>
                  <select
                    value={issueTypeId}
                    onChange={(e) => setIssueTypeId(Number(e.target.value))}
                    className="input"
                  >
                    <option value={0}>{bl.issueTypeDefault}</option>
                    {meta.issueTypes.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
                    {bl.priority}
                  </div>
                  <select
                    value={priorityId}
                    onChange={(e) => setPriorityId(Number(e.target.value))}
                    className="input"
                  >
                    <option value={0}>{bl.priorityDefault}</option>
                    {meta.priorities.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Fields */}
              <div className="space-y-2">
                <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
                  {bl.customFields}
                </div>
                <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
                  {bl.customFieldsDesc}
                </p>

                {meta.customFields.length === 0 ? (
                  <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
                    {bl.noCustomFields}
                  </div>
                ) : (
                  <>
                    {customFieldMappings.map((cf, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={cf.backlogFieldId}
                          onChange={(e) => {
                            const next = [...customFieldMappings];
                            next[idx] = { ...next[idx], backlogFieldId: Number(e.target.value) };
                            setCustomFieldMappings(next);
                          }}
                          className="input flex-1"
                        >
                          <option value={0}>{bl.backlogField}</option>
                          {meta.customFields.map((bf) => (
                            <option key={bf.id} value={bf.id}>
                              {bf.name}
                            </option>
                          ))}
                        </select>

                        <span className="text-xs" style={{ color: "var(--color-neutral-400)" }}>→</span>

                        <select
                          value={cf.formFieldName}
                          onChange={(e) => {
                            const next = [...customFieldMappings];
                            next[idx] = { ...next[idx], formFieldName: e.target.value };
                            setCustomFieldMappings(next);
                          }}
                          className="input flex-1"
                        >
                          <option value="">{bl.formField}</option>
                          {formFields.map((f) => (
                            <option key={f.name} value={f.name}>
                              {f.label} ({f.name})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            setCustomFieldMappings(customFieldMappings.filter((_, i) => i !== idx));
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ color: "var(--color-error-600)" }}
                        >
                          {bl.removeCustomField}
                        </button>
                      </div>
                    ))}

                    {customFieldMappings.length < 20 && (
                      <button
                        type="button"
                        onClick={() =>
                          setCustomFieldMappings([
                            ...customFieldMappings,
                            { backlogFieldId: 0, formFieldName: "" },
                          ])
                        }
                        className="btn btn-secondary btn-sm"
                      >
                        + {bl.addCustomField}
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Assignment Rule */}
              <div className="space-y-2">
                <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
                  {bl.assignment}
                </div>
                <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
                  {bl.assignmentDesc}
                </p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="assignType"
                      checked={assignType === "none"}
                      onChange={() => setAssignType("none")}
                    />
                    {bl.assignNone}
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="assignType"
                      checked={assignType === "static"}
                      onChange={() => setAssignType("static")}
                    />
                    {bl.assignStatic}
                  </label>
                  {assignType === "static" && (
                    <select
                      value={assignStaticId}
                      onChange={(e) => setAssignStaticId(Number(e.target.value))}
                      className="input"
                    >
                      <option value={0}>{bl.assignSelectMember}</option>
                      {meta.members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  )}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="assignType"
                      checked={assignType === "field_match"}
                      onChange={() => setAssignType("field_match")}
                    />
                    {bl.assignFieldMatch}
                  </label>
                  {assignType === "field_match" && (
                    <div className="space-y-2 pl-6">
                      <select
                        value={assignField}
                        onChange={(e) => setAssignField(e.target.value)}
                        className="input"
                      >
                        <option value="">{bl.summaryFieldSelect}</option>
                        {formFields.map((f) => (
                          <option key={f.name} value={f.name}>
                            {f.label} ({f.name})
                          </option>
                        ))}
                      </select>
                      {assignRules.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            value={r.value}
                            onChange={(e) => {
                              const next = [...assignRules];
                              next[idx] = { ...next[idx], value: e.target.value };
                              setAssignRules(next);
                            }}
                            placeholder={bl.assignRuleValue}
                            className="input flex-1"
                          />
                          <span className="text-xs" style={{ color: "var(--color-neutral-400)" }}>→</span>
                          <select
                            value={r.assigneeId}
                            onChange={(e) => {
                              const next = [...assignRules];
                              next[idx] = { ...next[idx], assigneeId: Number(e.target.value) };
                              setAssignRules(next);
                            }}
                            className="input flex-1"
                          >
                            <option value={0}>{bl.assignSelectMember}</option>
                            {meta.members.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setAssignRules(assignRules.filter((_, i) => i !== idx))}
                            className="btn btn-secondary btn-sm"
                            style={{ color: "var(--color-error-600)" }}
                          >
                            {bl.removeCustomField}
                          </button>
                        </div>
                      ))}
                      {assignRules.length < 20 && (
                        <button
                          type="button"
                          onClick={() => setAssignRules([...assignRules, { value: "", assigneeId: 0 }])}
                          className="btn btn-secondary btn-sm"
                        >
                          + {bl.assignAddRule}
                        </button>
                      )}
                      <div className="space-y-1">
                        <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
                          {bl.assignFallback}
                        </div>
                        <select
                          value={assignFallbackId}
                          onChange={(e) => setAssignFallbackId(Number(e.target.value))}
                          className="input"
                        >
                          <option value={0}>{bl.assignNone}</option>
                          {meta.members.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-tasks */}
              <div className="space-y-2">
                <div className="text-sm font-medium" style={{ color: "var(--color-neutral-700)" }}>
                  {bl.subTasks}
                </div>
                <p className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
                  {bl.subTasksDesc}
                </p>
                {subTasks.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={st.summary}
                      onChange={(e) => {
                        const next = [...subTasks];
                        next[idx] = { ...next[idx], summary: e.target.value };
                        setSubTasks(next);
                      }}
                      placeholder={bl.subTaskSummaryPlaceholder}
                      className="input flex-1"
                      maxLength={500}
                    />
                    <select
                      value={st.assigneeId ?? 0}
                      onChange={(e) => {
                        const next = [...subTasks];
                        const v = Number(e.target.value);
                        next[idx] = { ...next[idx], assigneeId: v > 0 ? v : undefined };
                        setSubTasks(next);
                      }}
                      className="input"
                      style={{ maxWidth: "200px" }}
                    >
                      <option value={0}>{bl.assignNone}</option>
                      {meta.members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setSubTasks(subTasks.filter((_, i) => i !== idx))}
                      className="btn btn-secondary btn-sm"
                      style={{ color: "var(--color-error-600)" }}
                    >
                      {bl.removeCustomField}
                    </button>
                  </div>
                ))}
                {subTasks.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setSubTasks([...subTasks, { summary: "" }])}
                    className="btn btn-secondary btn-sm"
                  >
                    + {bl.subTaskAdd}
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* Save button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? bl.saving : t.common.save}
        </button>

        {msg && (
          <div
            className="badge"
            style={
              msg.kind === "ok"
                ? { background: "var(--color-success-100)", color: "var(--color-success-700)" }
                : { background: "var(--color-error-100)", color: "var(--color-error-700)" }
            }
          >
            {msg.text}
          </div>
        )}
      </div>

      <div className="text-xs" style={{ color: "var(--color-neutral-500)" }}>
        {bl.apiKeyNote}
      </div>
    </div>
  );
}
