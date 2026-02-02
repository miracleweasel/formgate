// test/auth.requireAdminFromRequest.test.ts
import test from "node:test";
import assert from "node:assert/strict";

import {
  requireAdminFromRequest,
  getCookieValue,
} from "../lib/auth/requireAdmin";
import {
  makeSessionCookieValue,
  SESSION_COOKIE_NAME,
} from "../lib/auth/session";

// =============================================================================
// getCookieValue tests
// =============================================================================

test("getCookieValue => null when cookie header is empty", () => {
  assert.equal(getCookieValue("", "foo"), null);
});

test("getCookieValue => null when cookie not found", () => {
  assert.equal(getCookieValue("bar=123; baz=456", "foo"), null);
});

test("getCookieValue => value when cookie exists (single)", () => {
  assert.equal(getCookieValue("foo=hello", "foo"), "hello");
});

test("getCookieValue => value when cookie exists (multiple)", () => {
  assert.equal(getCookieValue("bar=1; foo=hello; baz=2", "foo"), "hello");
});

test("getCookieValue => decodes URL-encoded values", () => {
  assert.equal(getCookieValue("foo=hello%20world", "foo"), "hello world");
});

test("getCookieValue => handles cookie at start", () => {
  assert.equal(getCookieValue("foo=first; bar=second", "foo"), "first");
});

test("getCookieValue => handles cookie at end", () => {
  assert.equal(getCookieValue("bar=first; foo=last", "foo"), "last");
});

// =============================================================================
// requireAdminFromRequest tests
// =============================================================================

test("requireAdminFromRequest => false when cookie missing", async () => {
  const req = new Request("http://localhost", { headers: {} });
  const ok = await requireAdminFromRequest(req);
  assert.equal(ok, false);
});

test("requireAdminFromRequest => false when cookie signature is invalid", async () => {
  // Valid base64 payload but invalid signature
  const fakePayload = Buffer.from(JSON.stringify({ v: 1, email: "test@test.com", exp: 9999999999 })).toString("base64url");
  const req = new Request("http://localhost", {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${fakePayload}.invalidsig` },
  });
  const ok = await requireAdminFromRequest(req);
  assert.equal(ok, false);
});

test("requireAdminFromRequest => false when cookie is malformed", async () => {
  const req = new Request("http://localhost", {
    headers: { cookie: `${SESSION_COOKIE_NAME}=notbase64atall` },
  });
  const ok = await requireAdminFromRequest(req);
  assert.equal(ok, false);
});

test("requireAdminFromRequest => true when valid session matches admin", async () => {
  // ADMIN_EMAIL is set to "admin@example.com" in test-setup.mjs
  const cookie = await makeSessionCookieValue("admin@example.com");
  const req = new Request("http://localhost", {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${cookie}` },
  });
  const ok = await requireAdminFromRequest(req);
  assert.equal(ok, true);
});

test("requireAdminFromRequest => true with case-insensitive email match", async () => {
  const cookie = await makeSessionCookieValue("ADMIN@EXAMPLE.COM");
  const req = new Request("http://localhost", {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${cookie}` },
  });
  const ok = await requireAdminFromRequest(req);
  assert.equal(ok, true);
});

test("requireAdminFromRequest => false when email does not match admin", async () => {
  const cookie = await makeSessionCookieValue("other@example.com");
  const req = new Request("http://localhost", {
    headers: { cookie: `${SESSION_COOKIE_NAME}=${cookie}` },
  });
  const ok = await requireAdminFromRequest(req);
  assert.equal(ok, false);
});
