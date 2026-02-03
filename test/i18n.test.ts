// test/i18n.test.ts
import test from "node:test";
import assert from "node:assert/strict";

import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_NAMES,
  isValidLocale,
  getTranslations,
  detectLocaleFromHeader,
  getLocaleFromCookie,
  format,
  t,
} from "../lib/i18n/index";
import { ja } from "../lib/i18n/ja";
import { en } from "../lib/i18n/en";

// =============================================================================
// Locale Configuration Tests
// =============================================================================

test("SUPPORTED_LOCALES includes ja and en", () => {
  assert.ok(SUPPORTED_LOCALES.includes("ja"));
  assert.ok(SUPPORTED_LOCALES.includes("en"));
});

test("DEFAULT_LOCALE is ja", () => {
  assert.equal(DEFAULT_LOCALE, "ja");
});

test("LOCALE_NAMES has entries for all supported locales", () => {
  for (const locale of SUPPORTED_LOCALES) {
    assert.ok(LOCALE_NAMES[locale], `Missing name for locale: ${locale}`);
  }
});

// =============================================================================
// isValidLocale Tests
// =============================================================================

test("isValidLocale => true for supported locales", () => {
  assert.equal(isValidLocale("ja"), true);
  assert.equal(isValidLocale("en"), true);
});

test("isValidLocale => false for unsupported locales", () => {
  assert.equal(isValidLocale("fr"), false);
  assert.equal(isValidLocale("de"), false);
  assert.equal(isValidLocale(""), false);
  assert.equal(isValidLocale("japanese"), false);
});

// =============================================================================
// getTranslations Tests
// =============================================================================

test("getTranslations => returns ja translations by default", () => {
  const translations = getTranslations();
  assert.equal(translations.common.appName, "FormGate");
  assert.equal(translations.auth.loginTitle, ja.auth.loginTitle);
});

test("getTranslations => returns en translations when specified", () => {
  const translations = getTranslations("en");
  assert.equal(translations.common.appName, "FormGate");
  assert.equal(translations.auth.loginTitle, "Admin Login");
});

test("getTranslations => returns ja translations for ja locale", () => {
  const translations = getTranslations("ja");
  assert.equal(translations.auth.loginTitle, "管理者ログイン");
});

// =============================================================================
// detectLocaleFromHeader Tests
// =============================================================================

test("detectLocaleFromHeader => returns default for null", () => {
  assert.equal(detectLocaleFromHeader(null), DEFAULT_LOCALE);
});

test("detectLocaleFromHeader => returns default for empty string", () => {
  assert.equal(detectLocaleFromHeader(""), DEFAULT_LOCALE);
});

test("detectLocaleFromHeader => detects ja from simple header", () => {
  assert.equal(detectLocaleFromHeader("ja"), "ja");
});

test("detectLocaleFromHeader => detects en from simple header", () => {
  assert.equal(detectLocaleFromHeader("en"), "en");
});

test("detectLocaleFromHeader => handles regional variants (en-US)", () => {
  assert.equal(detectLocaleFromHeader("en-US"), "en");
});

test("detectLocaleFromHeader => handles regional variants (ja-JP)", () => {
  assert.equal(detectLocaleFromHeader("ja-JP"), "ja");
});

test("detectLocaleFromHeader => respects q-values", () => {
  // Prefers en (q=1.0) over ja (q=0.8)
  assert.equal(detectLocaleFromHeader("ja;q=0.8,en;q=1.0"), "en");
});

test("detectLocaleFromHeader => handles complex Accept-Language", () => {
  // Real browser example: ja first, then en-US, then en
  assert.equal(detectLocaleFromHeader("ja,en-US;q=0.9,en;q=0.8"), "ja");
});

test("detectLocaleFromHeader => falls back to default for unsupported", () => {
  assert.equal(detectLocaleFromHeader("fr,de"), DEFAULT_LOCALE);
});

test("detectLocaleFromHeader => finds supported locale in mixed list", () => {
  // fr not supported, but en is
  assert.equal(detectLocaleFromHeader("fr,en;q=0.9"), "en");
});

// =============================================================================
// getLocaleFromCookie Tests
// =============================================================================

test("getLocaleFromCookie => returns default for null", () => {
  assert.equal(getLocaleFromCookie(null), DEFAULT_LOCALE);
});

test("getLocaleFromCookie => returns default for empty string", () => {
  assert.equal(getLocaleFromCookie(""), DEFAULT_LOCALE);
});

test("getLocaleFromCookie => returns ja for valid ja cookie", () => {
  assert.equal(getLocaleFromCookie("ja"), "ja");
});

test("getLocaleFromCookie => returns en for valid en cookie", () => {
  assert.equal(getLocaleFromCookie("en"), "en");
});

test("getLocaleFromCookie => returns default for invalid locale", () => {
  assert.equal(getLocaleFromCookie("fr"), DEFAULT_LOCALE);
  assert.equal(getLocaleFromCookie("invalid"), DEFAULT_LOCALE);
});

// =============================================================================
// format Tests
// =============================================================================

test("format => replaces single placeholder", () => {
  assert.equal(format("Hello, {name}!", { name: "World" }), "Hello, World!");
});

test("format => replaces multiple placeholders", () => {
  assert.equal(
    format("{greeting}, {name}!", { greeting: "Hello", name: "World" }),
    "Hello, World!"
  );
});

test("format => handles number values", () => {
  assert.equal(format("Count: {count}", { count: 42 }), "Count: 42");
});

test("format => preserves missing placeholders", () => {
  assert.equal(format("Hello, {name}!", {}), "Hello, {name}!");
});

test("format => handles empty template", () => {
  assert.equal(format("", { name: "World" }), "");
});

// =============================================================================
// Translation Structure Tests
// =============================================================================

test("en translations have same structure as ja", () => {
  // Check top-level keys match
  const jaKeys = Object.keys(ja).sort();
  const enKeys = Object.keys(en).sort();
  assert.deepEqual(enKeys, jaKeys, "Top-level keys should match");

  // Check nested keys for a few sections
  assert.deepEqual(
    Object.keys(en.common).sort(),
    Object.keys(ja.common).sort(),
    "common keys should match"
  );
  assert.deepEqual(
    Object.keys(en.auth).sort(),
    Object.keys(ja.auth).sort(),
    "auth keys should match"
  );
  assert.deepEqual(
    Object.keys(en.errors).sort(),
    Object.keys(ja.errors).sort(),
    "errors keys should match"
  );
});

test("t export is the Japanese translation", () => {
  assert.equal(t.auth.loginTitle, "管理者ログイン");
  assert.equal(t.common.appName, "FormGate");
});
