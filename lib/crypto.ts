// lib/crypto.ts
import crypto from "crypto";
import { ENV } from "./env";

// Static salt for key derivation (application-specific, not secret)
// This provides domain separation and prevents rainbow table attacks
const KDF_SALT = Buffer.from("formgate-aes256-encryption-key-v1", "utf8");
const KDF_ITERATIONS = 100000;

// Cache derived key to avoid repeated PBKDF2 computation
let cachedKey: Buffer | null = null;

/**
 * Derive a 32-byte encryption key using PBKDF2.
 * Much stronger than simple SHA-256 hash.
 */
function key32(): Buffer {
  if (cachedKey) return cachedKey;

  cachedKey = crypto.pbkdf2Sync(
    ENV.APP_ENC_KEY,
    KDF_SALT,
    KDF_ITERATIONS,
    32, // 256 bits
    "sha256"
  );
  return cachedKey;
}

export function encryptString(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key32(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptString(payload: string): string {
  const raw = Buffer.from(payload, "base64url");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key32(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
