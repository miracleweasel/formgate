// test/api.backlog-form-settings.route.test.ts
import test, { mock } from "node:test";
import assert from "node:assert/strict";

type DbMock = {
  select: (shape?: any) => any;
  insert: (table?: any) => any;
};

function makeDbMock(scenario: {
  formExists?: boolean;
  hasConn?: boolean;
  settings?: { enabled: boolean; projectKey: string | null } | null;
}): DbMock {
  const { formExists = true, hasConn = true, settings = { enabled: true, projectKey: "FG" } } =
    scenario;

  // Petite helper pour simuler drizzle chain: select().from().where().limit()
  function selectChain(resultRows: any[]) {
    return {
      from: () => ({
        where: () => ({
          limit: async () => resultRows,
        }),
        limit: async () => resultRows, // quand pas de where (conn globale)
      }),
    };
  }

  return {
    select: () => {
      // On va décider du résultat selon "quelle table" est utilisée dans from().
      // Comme notre mock ne voit pas la table passée à from() dans ce style,
      // on va plutôt mocker au niveau module (plus bas) avec des db différents par test.
      // Ici on renvoie une chain configurable qu’on remplacera par test.
      return selectChain([]);
    },

    insert: () => ({
      values: () => ({
        onConflictDoUpdate: async () => ({}),
      }),
    }),
  };
}

// Import le module route.ts avec mocks configurés.
// IMPORTANT: mock.module doit être appelé AVANT import().
async function importRouteModule(args: {
  isAdmin: boolean;
  dbImpl: any;
}) {
  mock.module("@/lib/auth/admin", {
    namedExports: {
      getAdminEmail: async () => (args.isAdmin ? "admin@example.com" : null),
    },
  });

  mock.module("@/lib/db", {
    namedExports: {
      db: args.dbImpl,
    },
  });

  // On n’a pas besoin du vrai schema Drizzle en tests : juste des "tokens" utilisés par route.ts
  mock.module("@/lib/db/schema", {
    namedExports: {
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
    },
  });

  mock.module("drizzle-orm", {
    namedExports: {
      eq: (..._args: any[]) => ({ _tag: "eq" }),
    },
  });

  // Import “fresh” pour éviter cache entre tests
  const mod = await import(
    `../app/api/forms/[id]/integrations/backlog/route.ts?ts=${Date.now()}`
  );

  return mod as {
    GET: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
    PUT: (req: Request, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
  };
}

test("GET returns 401 when not admin", async () => {
  const db = makeDbMock({});
  const { GET } = await importRouteModule({ isAdmin: false, dbImpl: db });

  const res = await GET(new Request("http://localhost"), {
    params: Promise.resolve({ id: "11111111-1111-1111-1111-111111111111" }),
  });

  assert.equal(res.status, 401);
});

test("PUT returns 401 when not admin", async () => {
  const db = makeDbMock({});
  const { PUT } = await importRouteModule({ isAdmin: false, dbImpl: db });

  const res = await PUT(
    new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ enabled: true, projectKey: "FG" }),
      headers: { "content-type": "application/json" },
    }),
    { params: Promise.resolve({ id: "11111111-1111-1111-1111-111111111111" }) }
  );

  assert.equal(res.status, 401);
});

test("PUT returns 400 invalid_json when body is not JSON", async () => {
  // form exists
  const db = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [{ id: "x" }], // form exists
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        onConflictDoUpdate: async () => ({}),
      }),
    }),
  };

  const { PUT } = await importRouteModule({ isAdmin: true, dbImpl: db });

  const res = await PUT(
    new Request("http://localhost", {
      method: "PUT",
      body: "{not-json}",
      headers: { "content-type": "application/json" },
    }),
    { params: Promise.resolve({ id: "11111111-1111-1111-1111-111111111111" }) }
  );

  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.ok, false);
  assert.equal(json.error, "invalid_json");
});

test("PUT returns 400 invalid_body when body is not an object", async () => {
  const db = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [{ id: "x" }], // form exists
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        onConflictDoUpdate: async () => ({}),
      }),
    }),
  };

  const { PUT } = await importRouteModule({ isAdmin: true, dbImpl: db });

  const res = await PUT(
    new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify("nope"),
      headers: { "content-type": "application/json" },
    }),
    { params: Promise.resolve({ id: "11111111-1111-1111-1111-111111111111" }) }
  );

  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.ok, false);
  assert.equal(json.error, "invalid_body");
});

test("GET returns 404 when form not found", async () => {
  const db = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [], // form not found
        }),
      }),
    }),
  };

  const { GET } = await importRouteModule({ isAdmin: true, dbImpl: db });

  const res = await GET(new Request("http://localhost"), {
    params: Promise.resolve({ id: "11111111-1111-1111-1111-111111111111" }),
  });

  assert.equal(res.status, 404);
  const json = await res.json();
  assert.equal(json.ok, false);
  assert.equal(json.error, "not_found");
});

test("GET returns ok with safe defaults when connection is missing", async () => {
  // 1st select: forms exists
  // 2nd select: connection missing -> []
  const db = {
    _call: 0,
    select() {
      this._call++;
      const call = this._call;

      // call 1 => forms
      if (call === 1) {
        return {
          from: () => ({
            where: () => ({
              limit: async () => [{ id: "x" }],
            }),
          }),
        };
      }

      // call 2 => integrationBacklogConnections (missing)
      if (call === 2) {
        return {
          from: () => ({
            limit: async () => [],
          }),
        };
      }

      // should not be reached
      return {
        from: () => ({
          limit: async () => [],
        }),
      };
    },
  };

  const { GET } = await importRouteModule({ isAdmin: true, dbImpl: db });

  const res = await GET(new Request("http://localhost"), {
    params: Promise.resolve({ id: "11111111-1111-1111-1111-111111111111" }),
  });

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.ok, true);
  assert.deepEqual(json.connection, { spaceUrl: "", defaultProjectKey: "" });
  assert.deepEqual(json.settings, { enabled: false, projectKey: null });
});

test("PUT returns ok and upserts settings", async () => {
  const db = {
    // forms exists
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [{ id: "x" }],
        }),
      }),
    }),
    insert: () => ({
      values: (v: any) => {
        // Vérif minimale sur les valeurs upsertées
        assert.equal(v.enabled, true);
        assert.equal(v.projectKey, "FG");
        assert.equal(v.formId, "11111111-1111-1111-1111-111111111111");
        return {
          onConflictDoUpdate: async () => ({}),
        };
      },
    }),
  };

  const { PUT } = await importRouteModule({ isAdmin: true, dbImpl: db });

  const res = await PUT(
    new Request("http://localhost", {
      method: "PUT",
      body: JSON.stringify({ enabled: true, projectKey: " fg " }),
      headers: { "content-type": "application/json" },
    }),
    { params: Promise.resolve({ id: "11111111-1111-1111-1111-111111111111" }) }
  );

  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.ok, true);
});
