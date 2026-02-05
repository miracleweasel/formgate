// test/rateLimit.test.ts
import test from "node:test";
import assert from "node:assert/strict";

import { rateLimitOrNull, getClientIp } from "../lib/http/rateLimit";

// =============================================================================
// getClientIp tests (hardened: TRUSTED_PROXY aware)
// =============================================================================

test("getClientIp => without TRUSTED_PROXY, ignores proxy headers (anti-spoofing)", () => {
  // Save and clear TRUSTED_PROXY
  const prev = process.env.TRUSTED_PROXY;
  delete process.env.TRUSTED_PROXY;

  const req = new Request("http://localhost", {
    headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
  });
  const ip = getClientIp(req);
  // Should NOT return the spoofed XFF IP
  assert.ok(!ip.includes("1.2.3.4"));
  assert.ok(ip.startsWith("fp:"));

  process.env.TRUSTED_PROXY = prev;
});

test("getClientIp => with TRUSTED_PROXY=1, takes LAST XFF IP (proxy-added)", () => {
  const prev = process.env.TRUSTED_PROXY;
  process.env.TRUSTED_PROXY = "1";

  const req = new Request("http://localhost", {
    headers: { "x-forwarded-for": "spoofed, real-proxy" },
  });
  assert.equal(getClientIp(req), "real-proxy");

  process.env.TRUSTED_PROXY = prev;
});

test("getClientIp => with TRUSTED_PROXY=1, prefers x-real-ip", () => {
  const prev = process.env.TRUSTED_PROXY;
  process.env.TRUSTED_PROXY = "1";

  const req = new Request("http://localhost", {
    headers: { "x-real-ip": "9.8.7.6" },
  });
  assert.equal(getClientIp(req), "9.8.7.6");

  process.env.TRUSTED_PROXY = prev;
});

test("getClientIp => without proxy headers returns fingerprint", () => {
  const prev = process.env.TRUSTED_PROXY;
  delete process.env.TRUSTED_PROXY;

  const req = new Request("http://localhost");
  const ip = getClientIp(req);
  assert.ok(ip.startsWith("fp:"));

  process.env.TRUSTED_PROXY = prev;
});

// =============================================================================
// rateLimitOrNull tests
// =============================================================================

test("rateLimitOrNull => returns null on first request", () => {
  const key = `test_${Date.now()}_${Math.random()}`;
  const result = rateLimitOrNull({
    key,
    limit: 5,
    windowMs: 60000,
  });
  assert.equal(result, null);
});

test("rateLimitOrNull => returns null within limit", () => {
  const key = `test_${Date.now()}_${Math.random()}`;
  const opts = { key, limit: 3, windowMs: 60000 };

  assert.equal(rateLimitOrNull(opts), null); // 1
  assert.equal(rateLimitOrNull(opts), null); // 2
  assert.equal(rateLimitOrNull(opts), null); // 3
});

test("rateLimitOrNull => returns 429 response when limit exceeded", () => {
  const key = `test_${Date.now()}_${Math.random()}`;
  const opts = { key, limit: 2, windowMs: 60000 };

  rateLimitOrNull(opts); // 1
  rateLimitOrNull(opts); // 2
  const result = rateLimitOrNull(opts); // 3 => should be limited

  assert.notEqual(result, null);
  assert.equal(result?.status, 429);
});

test("rateLimitOrNull => includes Retry-After header when addRetryAfter is true", async () => {
  const key = `test_${Date.now()}_${Math.random()}`;
  const opts = { key, limit: 1, windowMs: 60000, addRetryAfter: true };

  rateLimitOrNull(opts); // 1
  const result = rateLimitOrNull(opts); // 2 => limited

  assert.notEqual(result, null);
  const retryAfter = result?.headers.get("Retry-After");
  assert.ok(retryAfter !== null);
  assert.ok(parseInt(retryAfter!, 10) > 0);
});

test("rateLimitOrNull => uses custom status and message", async () => {
  const key = `test_${Date.now()}_${Math.random()}`;
  const opts = {
    key,
    limit: 1,
    windowMs: 60000,
    status: 503,
    message: "too_many_requests",
  };

  rateLimitOrNull(opts); // 1
  const result = rateLimitOrNull(opts); // 2 => limited

  assert.notEqual(result, null);
  assert.equal(result?.status, 503);

  const body = await result?.json();
  assert.equal(body.error, "too_many_requests");
});
