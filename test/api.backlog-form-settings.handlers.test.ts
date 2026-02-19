// test/api.backlog-form-settings.handlers.test.ts

import test from "node:test";
import assert from "node:assert/strict";
import { makeBacklogFormSettingsHandlers } from "@/lib/backlog/form-settings-handlers";
import { makeSessionCookieValue, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const schema = {
  forms: { id: Symbol("forms.id"), userEmail: Symbol("forms.userEmail") },
  integrationBacklogConnections: {
    spaceUrl: Symbol("conn.spaceUrl"),
    defaultProjectKey: Symbol("conn.defaultProjectKey"),
    userEmail: Symbol("conn.userEmail"),
  },
  integrationBacklogFormSettings: {
    formId: Symbol("settings.formId"),
    enabled: Symbol("settings.enabled"),
    projectKey: Symbol("settings.projectKey"),
    fieldMapping: Symbol("settings.fieldMapping"),
    updatedAt: Symbol("settings.updatedAt"),
  },
};

const eq = (..._args: any[]) => ({ _tag: "eq" });

function makeDb(selectSteps: Array<any[]>, onInsert?: (v: any) => void) {
  let i = 0;
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => selectSteps[i++] ?? [],
        }),
        limit: async () => selectSteps[i++] ?? [],
      }),
    }),
    insert: () => ({
      values: (v: any) => {
        onInsert?.(v);
        return {
          onConflictDoUpdate: async () => ({}),
        };
      },
    }),
  };
}

const userEmail = "admin@example.com";

async function makeAuthReq(body?: unknown) {
  const cookie = await makeSessionCookieValue(userEmail);
  const init: RequestInit = {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${cookie}` },
  };
  if (body !== undefined) {
    init.method = "PUT";
    (init.headers as Record<string, string>)["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  return new Request("http://localhost", init);
}

test("GET -> 401 when no cookie", async () => {
  const db = makeDb([]);
  const { GET } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
  });

  const res = await GET(new Request("http://localhost"), {
    params: Promise.resolve({ id: "x" }),
  });

  assert.equal(res.status, 401);
  const j = await res.json();
  assert.equal(j.ok, false);
  assert.equal(j.error, "unauthorized");
});

test("GET -> 404 when form not found", async () => {
  const db = makeDb([[]]);
  const { GET } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
  });

  const req = await makeAuthReq();
  const res = await GET(req, { params: Promise.resolve({ id: "x" }) });

  assert.equal(res.status, 404);
  const j = await res.json();
  assert.equal(j.error, "not_found");
});

test("GET -> ok defaults when connection missing", async () => {
  const db = makeDb([[{ id: "x", userEmail }], []]);
  const { GET } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
  });

  const req = await makeAuthReq();
  const res = await GET(req, { params: Promise.resolve({ id: "x" }) });

  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.ok, true);
  assert.deepEqual(j.connection, { spaceUrl: "", defaultProjectKey: "" });
  assert.deepEqual(j.settings, { enabled: false, projectKey: null });
});

test("GET -> returns fieldMapping when present", async () => {
  const mapping = {
    summary: { type: "template", template: "{company} inquiry" },
    priorityId: 4,
  };
  // 1) form exists, 2) connection exists, 3) settings with mapping
  const db = makeDb([
    [{ id: "x", userEmail }],
    [{ spaceUrl: "https://test.backlog.jp", defaultProjectKey: "PROJ" }],
    [{ enabled: true, projectKey: "CUSTOM", fieldMapping: mapping }],
  ]);
  const { GET } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
  });

  const req = await makeAuthReq();
  const res = await GET(req, { params: Promise.resolve({ id: "x" }) });

  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.ok, true);
  assert.equal(j.settings.enabled, true);
  assert.equal(j.settings.projectKey, "CUSTOM");
  assert.deepEqual(j.settings.fieldMapping, mapping);
});

test("GET -> fieldMapping null when not configured", async () => {
  const db = makeDb([
    [{ id: "x", userEmail }],
    [{ spaceUrl: "https://test.backlog.jp", defaultProjectKey: "PROJ" }],
    [{ enabled: true, projectKey: null, fieldMapping: null }],
  ]);
  const { GET } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
  });

  const req = await makeAuthReq();
  const res = await GET(req, { params: Promise.resolve({ id: "x" }) });

  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.settings.fieldMapping, null);
});

test("PUT -> saves valid fieldMapping", async () => {
  let savedValues: any = null;
  const db = makeDb([[{ id: "x", userEmail }]], (v) => { savedValues = v; });
  const { PUT } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
  });

  const mapping = {
    summary: { type: "field", field: "subject" },
    description: { type: "auto" },
    priorityId: 2,
    customFields: [{ backlogFieldId: 100, formFieldName: "email" }],
  };

  const req = await makeAuthReq({ enabled: true, projectKey: "PROJ", fieldMapping: mapping });
  const res = await PUT(req, { params: Promise.resolve({ id: "x" }) });

  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.ok, true);
  assert.ok(savedValues);
  assert.deepEqual(savedValues.fieldMapping, mapping);
});

test("PUT -> rejects invalid fieldMapping", async () => {
  const db = makeDb([[{ id: "x", userEmail }]]);
  const { PUT } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
  });

  const invalidMapping = {
    priorityId: 99, // Invalid: max is 4
  };

  const req = await makeAuthReq({ enabled: true, fieldMapping: invalidMapping });
  const res = await PUT(req, { params: Promise.resolve({ id: "x" }) });

  assert.equal(res.status, 400);
  const j = await res.json();
  assert.equal(j.error, "invalid_field_mapping");
});

test("PUT -> saves null fieldMapping when not provided", async () => {
  let savedValues: any = null;
  const db = makeDb([[{ id: "x", userEmail }]], (v) => { savedValues = v; });
  const { PUT } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
  });

  const req = await makeAuthReq({ enabled: true, projectKey: "PROJ" });
  const res = await PUT(req, { params: Promise.resolve({ id: "x" }) });

  assert.equal(res.status, 200);
  assert.ok(savedValues);
  assert.equal(savedValues.fieldMapping, null);
});

test("PUT -> 404 when form not found", async () => {
  const db = makeDb([[]]);
  const { PUT } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
  });

  const req = await makeAuthReq({ enabled: true });
  const res = await PUT(req, { params: Promise.resolve({ id: "x" }) });

  assert.equal(res.status, 404);
});

test("PUT -> 400 on invalid JSON", async () => {
  const db = makeDb([[{ id: "x", userEmail }]]);
  const { PUT } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
  });

  const cookie = await makeSessionCookieValue(userEmail);
  const req = new Request("http://localhost", {
    method: "PUT",
    headers: {
      cookie: `${SESSION_COOKIE_NAME}=${cookie}`,
      "content-type": "application/json",
    },
    body: "not-json{{{",
  });

  const res = await PUT(req, { params: Promise.resolve({ id: "x" }) });
  assert.equal(res.status, 400);
  const j = await res.json();
  assert.equal(j.error, "invalid_json");
});
