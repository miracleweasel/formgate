// test/architecture.test.ts
// Phase 2 Architecture Tests: Code organization and patterns
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// =============================================================================
// Centralized Auth Tests
// =============================================================================

test("auth module exports required functions", async () => {
  const authModule = await import("../lib/auth/requireAdmin");

  assert.ok(typeof authModule.getCookieValue === "function", "getCookieValue should be exported");
  assert.ok(typeof authModule.requireAdminFromRequest === "function", "requireAdminFromRequest should be exported");
});

test("session module exports required functions", async () => {
  const sessionModule = await import("../lib/auth/session");

  assert.ok(sessionModule.SESSION_COOKIE_NAME, "SESSION_COOKIE_NAME should be exported");
  assert.ok(typeof sessionModule.parseSessionCookieValue === "function", "parseSessionCookieValue should be exported");
  assert.ok(typeof sessionModule.isSessionValid === "function", "isSessionValid should be exported");
});

// =============================================================================
// No Duplicate Code Tests
// =============================================================================

test("getCookieValue is not duplicated in codebase", () => {
  const apiDir = path.join(ROOT, "app", "api");
  if (!existsSync(apiDir)) return;

  function searchDir(dir: string): string[] {
    const matches: string[] = [];
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          matches.push(...searchDir(fullPath));
        } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
          const content = readFileSync(fullPath, "utf8");
          // Check for inline getCookieValue implementations (not imports)
          if (content.includes("function getCookieValue") && !fullPath.includes("requireAdmin")) {
            matches.push(fullPath);
          }
        }
      }
    } catch {
      // Ignore permission errors
    }
    return matches;
  }

  const duplicates = searchDir(apiDir);
  assert.equal(duplicates.length, 0, `Found duplicate getCookieValue in: ${duplicates.join(", ")}`);
});

test("requireAdmin is not duplicated in API routes", () => {
  const apiDir = path.join(ROOT, "app", "api");
  if (!existsSync(apiDir)) return;

  function searchDir(dir: string): string[] {
    const matches: string[] = [];
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          matches.push(...searchDir(fullPath));
        } else if (entry.name.endsWith(".ts")) {
          const content = readFileSync(fullPath, "utf8");
          // Check for inline requireAdmin implementations
          if (
            (content.includes("async function requireAdmin") ||
              content.includes("function requireAdmin")) &&
            !fullPath.includes("lib")
          ) {
            matches.push(fullPath);
          }
        }
      }
    } catch {
      // Ignore permission errors
    }
    return matches;
  }

  const duplicates = searchDir(apiDir);
  assert.equal(duplicates.length, 0, `Found duplicate requireAdmin in: ${duplicates.join(", ")}`);
});

// =============================================================================
// i18n Architecture Tests
// =============================================================================

test("i18n module exports required items", async () => {
  const i18nModule = await import("../lib/i18n/index");

  assert.ok(i18nModule.t, "t (translations) should be exported");
  assert.ok(i18nModule.SUPPORTED_LOCALES, "SUPPORTED_LOCALES should be exported");
  assert.ok(i18nModule.DEFAULT_LOCALE, "DEFAULT_LOCALE should be exported");
  assert.ok(typeof i18nModule.getTranslations === "function", "getTranslations should be exported");
  assert.ok(typeof i18nModule.format === "function", "format should be exported");
});

test("all translation files have same structure", async () => {
  const { ja } = await import("../lib/i18n/ja");
  const { en } = await import("../lib/i18n/en");

  function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
    const keys: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        keys.push(...getKeys(value as Record<string, unknown>, fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys.sort();
  }

  const jaKeys = getKeys(ja);
  const enKeys = getKeys(en);

  assert.deepEqual(enKeys, jaKeys, "EN and JA should have identical keys");
});

// =============================================================================
// Crypto Module Tests
// =============================================================================

test("crypto module exports required functions", async () => {
  const cryptoModule = await import("../lib/crypto");

  assert.ok(typeof cryptoModule.encryptString === "function", "encryptString should be exported");
  assert.ok(typeof cryptoModule.decryptString === "function", "decryptString should be exported");
});

// =============================================================================
// Rate Limit Module Tests
// =============================================================================

test("rateLimit module exports required functions", async () => {
  const rateLimitModule = await import("../lib/http/rateLimit");

  assert.ok(typeof rateLimitModule.rateLimitOrNull === "function", "rateLimitOrNull should be exported");
  assert.ok(typeof rateLimitModule.getClientIp === "function", "getClientIp should be exported");
});

// =============================================================================
// File Organization Tests
// =============================================================================

test("lib directory has expected structure", () => {
  const expectedDirs = ["auth", "i18n", "http", "db"];
  const libDir = path.join(ROOT, "lib");

  for (const dir of expectedDirs) {
    const dirPath = path.join(libDir, dir);
    assert.ok(existsSync(dirPath), `lib/${dir} should exist`);
  }
});

test("test directory exists and has tests", () => {
  const testDir = path.join(ROOT, "test");
  assert.ok(existsSync(testDir), "test directory should exist");

  const files = readdirSync(testDir);
  const testFiles = files.filter((f) => f.endsWith(".test.ts") || f.endsWith(".test.mjs"));
  assert.ok(testFiles.length > 0, "Should have test files");
});
