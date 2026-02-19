// test/auth.requireUser.test.ts
import test from "node:test";
import assert from "node:assert/strict";

import {
  getCookieValue,
} from "../lib/auth/cookies";
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
// Session cookie generation tests (requireUserFromRequest needs DB,
// so we only test the helpers that don't need DB here)
// =============================================================================

test("makeSessionCookieValue produces signed cookie", async () => {
  const cookie = await makeSessionCookieValue("test@example.com");
  assert.ok(cookie.includes("."), "Cookie should have payload.signature format");
  const parts = cookie.split(".");
  assert.equal(parts.length, 2, "Should have exactly 2 parts");
  assert.ok(parts[0].length > 0, "Payload should not be empty");
  assert.ok(parts[1].length > 0, "Signature should not be empty");
});
