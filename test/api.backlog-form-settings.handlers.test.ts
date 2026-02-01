// test/api.backlog-form-settings.handlers.test.ts

import test from "node:test";
import assert from "node:assert/strict";
import { makeBacklogFormSettingsHandlers } from "@/lib/backlog/form-settings-handlers";

const schema = {
  forms: { id: Symbol("forms.id") },
  integrationBacklogConnections: {
    spaceUrl: Symbol("conn.spaceUrl"),
    defaultProjectKey: Symbol("conn.defaultProjectKey"),
  },
  integrationBacklogFormSettings: {
    formId: Symbol("settings.formId"),
    enabled: Symbol("settings.enabled"),
    projectKey: Symbol("settings.projectKey"),
    updatedAt: Symbol("settings.updatedAt"),
  },
};

const eq = (..._args: any[]) => ({ _tag: "eq" });

function makeDb(selectSteps: Array<any[]>) {
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
      values: (_v: any) => ({
        onConflictDoUpdate: async () => ({}),
      }),
    }),
  };
}

test("GET -> 401 when not admin", async () => {
  const db = makeDb([]);
  const { GET } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
    getAdminEmail: async () => null,
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
  const db = makeDb([[]]); // forms select => []
  const { GET } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
    getAdminEmail: async () => "admin@example.com",
  });

  const res = await GET(new Request("http://localhost"), {
    params: Promise.resolve({ id: "x" }),
  });

  assert.equal(res.status, 404);
  const j = await res.json();
  assert.equal(j.error, "not_found");
});

test("GET -> ok defaults when connection missing", async () => {
  // 1) form exists, 2) connection missing
  const db = makeDb([[{ id: "x" }], []]);
  const { GET } = makeBacklogFormSettingsHandlers({
    db,
    schema,
    eq,
    getAdminEmail: async () => "admin@example.com",
  });

  const res = await GET(new Request("http://localhost"), {
    params: Promise.resolve({ id: "x" }),
  });

  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.ok, true);
  assert.deepEqual(j.connection, { spaceUrl: "", defaultProjectKey: "" });
  assert.deepEqual(j.settings, { enabled: false, projectKey: null });
});
