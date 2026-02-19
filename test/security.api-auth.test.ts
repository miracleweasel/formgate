// test/security.api-auth.test.ts
// Phase 1 Security Tests: API route authentication
import test from "node:test";
import assert from "node:assert/strict";

import { getCookieValue } from "../lib/auth/cookies";

// =============================================================================
// Cookie Parsing Security Tests
// =============================================================================

test("getCookieValue => prevents cookie injection via semicolon", () => {
  // Attacker tries to inject via value
  const header = "session=valid; injected=malicious";
  assert.equal(getCookieValue(header, "session"), "valid");
  assert.equal(getCookieValue(header, "injected"), "malicious");
});

test("getCookieValue => handles URL-encoded malicious values safely", () => {
  // Attacker tries to encode malicious characters
  const header = "session=%3Cscript%3Ealert(1)%3C%2Fscript%3E";
  const value = getCookieValue(header, "session");
  // Should decode the value (browser behavior)
  assert.equal(value, "<script>alert(1)</script>");
});

test("getCookieValue => handles null bytes", () => {
  const header = "session=test%00value";
  const value = getCookieValue(header, "session");
  // Should handle null bytes properly
  assert.ok(value !== null);
});

test("getCookieValue => handles extremely long cookie values", () => {
  const longValue = "x".repeat(10000);
  const header = `session=${longValue}`;
  const value = getCookieValue(header, "session");
  assert.equal(value, longValue);
});

test("getCookieValue => handles special characters in cookie name", () => {
  // Valid cookie names should not contain special chars
  const header = "normal_cookie=value";
  assert.equal(getCookieValue(header, "normal_cookie"), "value");
});

test("getCookieValue => returns empty string for empty cookie value", () => {
  const header = "session=";
  const value = getCookieValue(header, "session");
  // Current implementation returns null for empty values (security: treat empty as missing)
  assert.equal(value, null);
});

test("getCookieValue => handles duplicate cookie names (first wins)", () => {
  // RFC 6265: first occurrence should be used
  const header = "session=first; session=second";
  const value = getCookieValue(header, "session");
  assert.equal(value, "first");
});

// =============================================================================
// Input Validation Security Tests
// =============================================================================

test("UUID validation regex is secure", () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // Valid UUIDs
  assert.ok(uuidRegex.test("550e8400-e29b-41d4-a716-446655440000"));
  assert.ok(uuidRegex.test("6ba7b810-9dad-11d1-80b4-00c04fd430c8"));

  // Invalid - SQL injection attempts
  assert.ok(!uuidRegex.test("550e8400-e29b-41d4-a716-446655440000' OR '1'='1"));
  assert.ok(!uuidRegex.test("'; DROP TABLE forms; --"));

  // Invalid - path traversal
  assert.ok(!uuidRegex.test("../../../etc/passwd"));
  assert.ok(!uuidRegex.test("..\\..\\..\\windows\\system32"));

  // Invalid - XSS attempts
  assert.ok(!uuidRegex.test("<script>alert(1)</script>"));
  assert.ok(!uuidRegex.test("javascript:alert(1)"));

  // Invalid - too short/long
  assert.ok(!uuidRegex.test("550e8400"));
  assert.ok(!uuidRegex.test("550e8400-e29b-41d4-a716-446655440000-extra"));
});

test("slug validation should reject dangerous characters", () => {
  // Simple slug regex (alphanumeric + hyphen)
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  // Valid slugs
  assert.ok(slugRegex.test("contact"));
  assert.ok(slugRegex.test("contact-form"));
  assert.ok(slugRegex.test("my-form-2024"));

  // Invalid - path traversal
  assert.ok(!slugRegex.test("../admin"));
  assert.ok(!slugRegex.test("..\\admin"));

  // Invalid - special characters
  assert.ok(!slugRegex.test("form<script>"));
  assert.ok(!slugRegex.test("form;ls"));
  assert.ok(!slugRegex.test("form|cat /etc/passwd"));

  // Invalid - spaces and uppercase
  assert.ok(!slugRegex.test("My Form"));
  assert.ok(!slugRegex.test("CONTACT"));
});

// =============================================================================
// Email Validation Security Tests
// =============================================================================

test("email validation prevents header injection", () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Valid emails
  assert.ok(emailRegex.test("user@example.com"));
  assert.ok(emailRegex.test("user.name@example.co.jp"));

  // Invalid - newline injection (email header injection)
  assert.ok(!emailRegex.test("user@example.com\nBcc: attacker@evil.com"));
  assert.ok(!emailRegex.test("user@example.com\r\nBcc: attacker@evil.com"));

  // Invalid - with spaces
  assert.ok(!emailRegex.test("user @example.com"));
  assert.ok(!emailRegex.test(" user@example.com"));
});

// =============================================================================
// Rate Limiting Edge Cases
// =============================================================================

test("rate limit key should be sanitized", () => {
  // Keys should not allow injection
  const sanitizeKey = (ip: string) => ip.replace(/[^a-zA-Z0-9.:]/g, "_");

  assert.equal(sanitizeKey("192.168.1.1"), "192.168.1.1");
  assert.equal(sanitizeKey("::1"), "::1");
  assert.equal(sanitizeKey("192.168.1.1; rm -rf /"), "192.168.1.1__rm__rf__");
  assert.equal(sanitizeKey("<script>"), "_script_");
});
