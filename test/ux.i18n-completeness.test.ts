// test/ux.i18n-completeness.test.ts
// Phase 3 UX Tests: i18n completeness and consistency
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// =============================================================================
// Translation Completeness Tests
// =============================================================================

test("Japanese translations have no empty strings", async () => {
  const { ja } = await import("../lib/i18n/ja");

  function checkEmpty(obj: Record<string, unknown>, path = ""): string[] {
    const empties: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      if (typeof value === "string" && value.trim() === "") {
        empties.push(fullPath);
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        empties.push(...checkEmpty(value as Record<string, unknown>, fullPath));
      }
    }
    return empties;
  }

  const empties = checkEmpty(ja);
  assert.equal(empties.length, 0, `Empty translations found: ${empties.join(", ")}`);
});

test("English translations have no empty strings", async () => {
  const { en } = await import("../lib/i18n/en");

  function checkEmpty(obj: Record<string, unknown>, path = ""): string[] {
    const empties: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      if (typeof value === "string" && value.trim() === "") {
        empties.push(fullPath);
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        empties.push(...checkEmpty(value as Record<string, unknown>, fullPath));
      }
    }
    return empties;
  }

  const empties = checkEmpty(en);
  assert.equal(empties.length, 0, `Empty translations found: ${empties.join(", ")}`);
});

test("Japanese translations contain Japanese characters where expected", async () => {
  const { ja } = await import("../lib/i18n/ja");

  // These keys should have Japanese text (not English)
  const japaneseRequired = [
    ja.common.tagline,
    ja.common.loading,
    ja.auth.loginTitle,
    ja.forms.title,
    ja.errors.generic,
    ja.landing.hero.title,
  ];

  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;

  for (const text of japaneseRequired) {
    assert.ok(
      japaneseRegex.test(text),
      `Expected Japanese characters in: "${text}"`
    );
  }
});

test("English translations do not contain Japanese characters", async () => {
  const { en } = await import("../lib/i18n/en");

  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;

  function checkJapanese(obj: Record<string, unknown>, path = ""): string[] {
    const hasJapanese: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key;
      if (typeof value === "string" && japaneseRegex.test(value)) {
        hasJapanese.push(`${fullPath}: "${value}"`);
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        hasJapanese.push(...checkJapanese(value as Record<string, unknown>, fullPath));
      }
    }
    return hasJapanese;
  }

  const hasJapanese = checkJapanese(en);
  assert.equal(hasJapanese.length, 0, `English should not have Japanese: ${hasJapanese.join(", ")}`);
});

// =============================================================================
// UI Component i18n Usage Tests
// =============================================================================

test("client components import from @/lib/i18n", () => {
  const componentsToCheck = [
    "app/login/LoginClient.tsx",
    "app/f/[slug]/public-form-client.tsx",
    "app/(dashboard)/DashboardHeader.tsx",
    "app/(dashboard)/billing/page.tsx",
    "app/(dashboard)/forms/new/page.tsx",
  ];

  for (const componentPath of componentsToCheck) {
    const fullPath = path.join(ROOT, componentPath);
    if (!existsSync(fullPath)) continue;

    const content = readFileSync(fullPath, "utf8");
    const hasI18nImport = content.includes('from "@/lib/i18n"') || content.includes("from '@/lib/i18n'");

    assert.ok(hasI18nImport, `${componentPath} should import from @/lib/i18n`);
  }
});

test("no hardcoded Japanese in client components (should use t.*)", () => {
  const componentsToCheck = [
    "app/(dashboard)/DashboardHeader.tsx",
    "app/(dashboard)/billing/page.tsx",
  ];

  // Common Japanese phrases that should be in i18n
  const hardcodedPatterns = [
    /["']ログイン["']/,
    /["']送信["']/,
    /["']保存["']/,
    /["']削除["']/,
    /["']キャンセル["']/,
  ];

  for (const componentPath of componentsToCheck) {
    const fullPath = path.join(ROOT, componentPath);
    if (!existsSync(fullPath)) continue;

    const content = readFileSync(fullPath, "utf8");

    for (const pattern of hardcodedPatterns) {
      // Skip if it's in a comment
      const matches = content.match(pattern);
      if (matches) {
        // Check if it's not in a comment or translation file reference
        const lines = content.split("\n");
        for (const line of lines) {
          if (pattern.test(line) && !line.trim().startsWith("//") && !line.includes("t.")) {
            assert.fail(`${componentPath} has hardcoded Japanese: ${line.trim()}`);
          }
        }
      }
    }
  }
});

// =============================================================================
// Landing Page Tests
// =============================================================================

test("landing page uses i18n", () => {
  const landingPath = path.join(ROOT, "app", "page.tsx");
  if (!existsSync(landingPath)) return;

  const content = readFileSync(landingPath, "utf8");

  // Should import i18n
  assert.ok(
    content.includes('from "@/lib/i18n"'),
    "Landing page should import from @/lib/i18n"
  );

  // Should use t.* for text
  assert.ok(content.includes("t.landing"), "Landing page should use t.landing.*");
  assert.ok(content.includes("t.common"), "Landing page should use t.common.*");
});

test("landing page is not Next.js boilerplate", () => {
  const landingPath = path.join(ROOT, "app", "page.tsx");
  if (!existsSync(landingPath)) return;

  const content = readFileSync(landingPath, "utf8");

  // Should NOT have Next.js boilerplate
  assert.ok(!content.includes("next.svg"), "Should not have next.svg reference");
  assert.ok(!content.includes("vercel.svg"), "Should not have vercel.svg reference");
  assert.ok(!content.includes("To get started, edit"), "Should not have boilerplate text");
});

// =============================================================================
// Format Function Tests
// =============================================================================

test("format function handles edge cases", async () => {
  const { format } = await import("../lib/i18n/index");

  // Normal case
  assert.equal(format("Hello {name}", { name: "World" }), "Hello World");

  // Multiple same placeholders
  assert.equal(format("{x} + {x} = {result}", { x: 2, result: 4 }), "2 + 2 = 4");

  // Nested braces (should not match)
  assert.equal(format("{{notPlaceholder}}", {}), "{{notPlaceholder}}");

  // Special regex characters in values
  assert.equal(format("Price: {price}", { price: "$100" }), "Price: $100");

  // Japanese in values
  assert.equal(format("Welcome, {name}!", { name: "田中" }), "Welcome, 田中!");
});
