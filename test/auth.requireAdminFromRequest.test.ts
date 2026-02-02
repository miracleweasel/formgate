// test/auth.requireAdminFromRequest.test.mjs
import test from "node:test";
import assert from "node:assert/strict";

import { requireAdminFromRequest } from "../lib/auth/requireAdmin";
import { SESSION_COOKIE_NAME } from "../lib/auth/session";

// ⚠️ on ne peut pas mocker facilement getAdminEmail sans runner dédié,
// donc ce test valide surtout "pas de cookie => false".
test("requireAdminFromRequest => false when cookie missing", async () => {
  const req = new Request("http://localhost", { headers: {} });
  const ok = await requireAdminFromRequest(req);
  assert.equal(ok, false);
});
