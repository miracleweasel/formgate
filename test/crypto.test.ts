// test/crypto.test.ts
import test from "node:test";
import assert from "node:assert/strict";

import { encryptString, decryptString } from "../lib/crypto";

test("encryptString => produces different output each time (random IV)", () => {
  const plain = "my-secret-api-key";
  const enc1 = encryptString(plain);
  const enc2 = encryptString(plain);

  // Different ciphertexts due to random IV
  assert.notEqual(enc1, enc2);
});

test("decryptString => recovers original plaintext", () => {
  const plain = "my-secret-api-key-12345";
  const encrypted = encryptString(plain);
  const decrypted = decryptString(encrypted);

  assert.equal(decrypted, plain);
});

test("decryptString => works with special characters", () => {
  const plain = "api-key-with-特殊文字-and-émojis-🔐";
  const encrypted = encryptString(plain);
  const decrypted = decryptString(encrypted);

  assert.equal(decrypted, plain);
});

test("decryptString => throws on tampered ciphertext", () => {
  const plain = "my-secret";
  const encrypted = encryptString(plain);

  // Tamper with the ciphertext
  const tampered = encrypted.slice(0, -4) + "XXXX";

  assert.throws(() => {
    decryptString(tampered);
  });
});

test("decryptString => throws on invalid base64", () => {
  assert.throws(() => {
    decryptString("not-valid-base64!!!");
  });
});

test("encryptString/decryptString => handles empty string", () => {
  const plain = "";
  const encrypted = encryptString(plain);
  const decrypted = decryptString(encrypted);

  assert.equal(decrypted, plain);
});

test("encryptString/decryptString => handles long strings", () => {
  const plain = "x".repeat(10000);
  const encrypted = encryptString(plain);
  const decrypted = decryptString(encrypted);

  assert.equal(decrypted, plain);
});
