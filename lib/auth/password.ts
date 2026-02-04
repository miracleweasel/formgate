// lib/auth/password.ts
// Password hashing using Node.js crypto (PBKDF2)
// No external dependencies required

import crypto from "crypto";

const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = "sha512";
const SALT_LENGTH = 32;

/**
 * Hash a password using PBKDF2.
 * Returns format: salt:hash (both hex encoded)
 */
export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH);
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt.toString("hex")}:${derivedKey.toString("hex")}`);
    });
  });
}

/**
 * Verify a password against a stored hash.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const parts = storedHash.split(":");
    if (parts.length !== 2) {
      // Invalid hash format - could be plain text password (legacy)
      // Fall back to timing-safe comparison for backward compatibility
      try {
        const a = Buffer.from(password);
        const b = Buffer.from(storedHash);
        if (a.length !== b.length) {
          resolve(false);
          return;
        }
        resolve(crypto.timingSafeEqual(a, b));
      } catch {
        resolve(false);
      }
      return;
    }

    const [saltHex, hashHex] = parts;
    const salt = Buffer.from(saltHex, "hex");
    const storedKey = Buffer.from(hashHex, "hex");

    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      // Timing-safe comparison
      try {
        resolve(crypto.timingSafeEqual(derivedKey, storedKey));
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Check if a string looks like a hashed password (salt:hash format)
 */
export function isHashedPassword(value: string): boolean {
  const parts = value.split(":");
  if (parts.length !== 2) return false;
  // Salt should be 64 hex chars (32 bytes), hash should be 128 hex chars (64 bytes)
  return parts[0].length === 64 && parts[1].length === 128;
}
