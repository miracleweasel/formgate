// test/submissionsQuery.test.ts
import test from "node:test";
import assert from "node:assert/strict";

import {
  clampLimit,
  parseCursor,
  parseRange,
  normalizeEmailQuery,
  looksLikeUuid,
} from "../lib/validation/submissionsQuery";

test("clampLimit defaults and clamps to [1..50]", () => {
  assert.equal(clampLimit(null), 50);
  assert.equal(clampLimit("not-a-number"), 50);
  assert.equal(clampLimit("0"), 1);
  assert.equal(clampLimit("1"), 1);
  assert.equal(clampLimit("50"), 50);
  assert.equal(clampLimit("51"), 50);
  assert.equal(clampLimit("10.9"), 10);
});

test("parseRange accepts only today/7d/30d", () => {
  assert.equal(parseRange(null), null);
  assert.equal(parseRange(""), null);
  assert.equal(parseRange("TODAY"), "today");
  assert.equal(parseRange("7d"), "7d");
  assert.equal(parseRange("30d"), "30d");
  assert.equal(parseRange("90d"), null);
});

test("normalizeEmailQuery trims, caps length, returns null when empty", () => {
  assert.equal(normalizeEmailQuery(null), null);
  assert.equal(normalizeEmailQuery("   "), null);
  assert.equal(normalizeEmailQuery(" a@b.com "), "a@b.com");
  const long = "x".repeat(1000);
  assert.equal(normalizeEmailQuery(long)?.length, 200);
});

test("parseCursor returns normalized ISO + id, rejects invalid input", () => {
  assert.equal(parseCursor(null), null);
  assert.equal(parseCursor(""), null);
  assert.equal(parseCursor("no-sep"), null);
  assert.equal(parseCursor("bad__id"), null);

  const iso = new Date("2026-01-30T00:00:00.000Z").toISOString();
  const c = parseCursor(`${iso}__abc123`);
  assert.ok(c);
  assert.equal(c!.createdAtIsoUtc, iso);
  assert.equal(c!.id, "abc123");

  // too long
  assert.equal(parseCursor("x".repeat(301)), null);
});

test("looksLikeUuid basic", () => {
  assert.equal(looksLikeUuid(""), false);
  assert.equal(looksLikeUuid("not-uuid"), false);
  assert.equal(
    looksLikeUuid("9b5363ac-7b1e-4c2a-9a2d-2c0f6c0d6f1a"),
    true
  );
});
