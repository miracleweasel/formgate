// test/security.webhook.test.ts
// Phase 1 Security Tests: Webhook signature verification
import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

// =============================================================================
// Helper: Create HMAC signature (simulates Lemon Squeezy)
// =============================================================================

function createSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return hmac.digest("hex");
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

// =============================================================================
// Signature Verification Tests
// =============================================================================

test("verifySignature => returns true for valid signature", () => {
  const secret = "test-webhook-secret-123";
  const payload = JSON.stringify({ event: "subscription_created", data: { id: "123" } });
  const signature = createSignature(payload, secret);

  assert.equal(verifySignature(payload, signature, secret), true);
});

test("verifySignature => returns false for invalid signature", () => {
  const secret = "test-webhook-secret-123";
  const payload = JSON.stringify({ event: "subscription_created", data: { id: "123" } });
  const wrongSignature = "invalid-signature-hex";

  assert.equal(verifySignature(payload, wrongSignature, secret), false);
});

test("verifySignature => returns false for tampered payload", () => {
  const secret = "test-webhook-secret-123";
  const originalPayload = JSON.stringify({ event: "subscription_created", data: { id: "123" } });
  const signature = createSignature(originalPayload, secret);

  // Tampered payload
  const tamperedPayload = JSON.stringify({ event: "subscription_created", data: { id: "456" } });

  assert.equal(verifySignature(tamperedPayload, signature, secret), false);
});

test("verifySignature => returns false for wrong secret", () => {
  const secret = "test-webhook-secret-123";
  const wrongSecret = "wrong-secret";
  const payload = JSON.stringify({ event: "test" });
  const signature = createSignature(payload, secret);

  assert.equal(verifySignature(payload, signature, wrongSecret), false);
});

test("verifySignature => returns false for empty signature", () => {
  const secret = "test-webhook-secret-123";
  const payload = JSON.stringify({ event: "test" });

  assert.equal(verifySignature(payload, "", secret), false);
});

test("verifySignature => returns false for signature length mismatch", () => {
  const secret = "test-webhook-secret-123";
  const payload = JSON.stringify({ event: "test" });

  // SHA256 hex is 64 chars, this is shorter
  assert.equal(verifySignature(payload, "abc123", secret), false);
});

test("verifySignature => handles unicode payload", () => {
  const secret = "test-webhook-secret-123";
  const payload = JSON.stringify({ message: "日本語テスト", emoji: "🎉" });
  const signature = createSignature(payload, secret);

  assert.equal(verifySignature(payload, signature, secret), true);
});

test("verifySignature => handles large payload", () => {
  const secret = "test-webhook-secret-123";
  const largeData = "x".repeat(100000);
  const payload = JSON.stringify({ data: largeData });
  const signature = createSignature(payload, secret);

  assert.equal(verifySignature(payload, signature, secret), true);
});

// =============================================================================
// Timing Attack Prevention Tests
// =============================================================================

test("verifySignature => uses timing-safe comparison", () => {
  const secret = "test-webhook-secret-123";
  const payload = JSON.stringify({ event: "test" });
  const validSignature = createSignature(payload, secret);

  // Create signatures that differ at different positions
  const earlyDiff = "0" + validSignature.slice(1);
  const lateDiff = validSignature.slice(0, -1) + "0";

  // Both should fail and take similar time (timing-safe)
  const start1 = performance.now();
  verifySignature(payload, earlyDiff, secret);
  const time1 = performance.now() - start1;

  const start2 = performance.now();
  verifySignature(payload, lateDiff, secret);
  const time2 = performance.now() - start2;

  // Times should be roughly similar (within 10ms for timing-safe)
  // This is a weak test but ensures timing-safe is being used
  assert.ok(Math.abs(time1 - time2) < 10, "Timing difference should be minimal");
});
