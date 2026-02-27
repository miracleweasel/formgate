// test/all.test.mjs

import "../scripts/test-setup.mjs";

// ✅ importe uniquement les tests que tu veux exécuter
import "./submissionsQuery.test.ts";
import "./api.backlog-form-settings.handlers.test.ts";

import { readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(process.cwd(), "test");

// Récursif: trouve tous les fichiers finissant par .test.ts
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(ROOT);

// Import séquentiel (simple et lisible)
for (const f of files) {
  await import(pathToFileURL(f).href);
}
