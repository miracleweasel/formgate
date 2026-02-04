// test/password.test.ts
// Tests for password hashing (PBKDF2)

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, isHashedPassword } from "../lib/auth/password";

describe("hashPassword", () => {
  it("produces different hashes for same password (random salt)", async () => {
    const hash1 = await hashPassword("test123");
    const hash2 = await hashPassword("test123");
    assert.notEqual(hash1, hash2, "Hashes should be different due to random salt");
  });

  it("produces hash in correct format (salt:hash)", async () => {
    const hash = await hashPassword("test123");
    const parts = hash.split(":");
    assert.equal(parts.length, 2, "Hash should have two parts separated by :");
    assert.equal(parts[0].length, 64, "Salt should be 64 hex chars (32 bytes)");
    assert.equal(parts[1].length, 128, "Hash should be 128 hex chars (64 bytes)");
  });

  it("handles empty password", async () => {
    const hash = await hashPassword("");
    assert.ok(hash.includes(":"), "Should still produce valid hash format");
  });

  it("handles unicode passwords", async () => {
    const hash = await hashPassword("パスワード123");
    assert.ok(hash.includes(":"), "Should handle unicode characters");
  });
});

describe("verifyPassword", () => {
  it("returns true for correct password", async () => {
    const hash = await hashPassword("secret123");
    const result = await verifyPassword("secret123", hash);
    assert.equal(result, true);
  });

  it("returns false for incorrect password", async () => {
    const hash = await hashPassword("secret123");
    const result = await verifyPassword("wrong", hash);
    assert.equal(result, false);
  });

  it("returns false for empty password against hash", async () => {
    const hash = await hashPassword("secret123");
    const result = await verifyPassword("", hash);
    assert.equal(result, false);
  });

  it("handles plain text password comparison (backward compatibility)", async () => {
    // For backward compatibility, if the stored "hash" is plain text,
    // it should still work using timing-safe comparison
    const plainPassword = "mysecret";
    const result = await verifyPassword("mysecret", plainPassword);
    assert.equal(result, true, "Should match plain text passwords");
  });

  it("rejects wrong plain text password", async () => {
    const plainPassword = "mysecret";
    const result = await verifyPassword("wrongpassword", plainPassword);
    assert.equal(result, false);
  });

  it("handles unicode passwords", async () => {
    const hash = await hashPassword("パスワード123");
    const result = await verifyPassword("パスワード123", hash);
    assert.equal(result, true);
  });

  it("is timing-safe (does not throw on length mismatch)", async () => {
    const hash = await hashPassword("test");
    // Different length passwords should not cause timing leaks
    const result1 = await verifyPassword("a", hash);
    const result2 = await verifyPassword("verylongpasswordthatisdifferent", hash);
    assert.equal(result1, false);
    assert.equal(result2, false);
  });
});

describe("isHashedPassword", () => {
  it("returns true for valid hash format", async () => {
    const hash = await hashPassword("test");
    assert.equal(isHashedPassword(hash), true);
  });

  it("returns false for plain text password", () => {
    assert.equal(isHashedPassword("mysecret"), false);
  });

  it("returns false for malformed hash (wrong salt length)", () => {
    const badHash = "abc123:" + "a".repeat(128);
    assert.equal(isHashedPassword(badHash), false);
  });

  it("returns false for malformed hash (wrong hash length)", () => {
    const badHash = "a".repeat(64) + ":abc123";
    assert.equal(isHashedPassword(badHash), false);
  });

  it("returns false for string without colon", () => {
    assert.equal(isHashedPassword("nocolonhere"), false);
  });
});
