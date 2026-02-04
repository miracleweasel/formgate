#!/usr/bin/env npx tsx
// scripts/hash-password.ts
// Generate a PBKDF2 password hash for ADMIN_PASSWORD env var
//
// Usage: npx tsx scripts/hash-password.ts "your-password"

import { hashPassword } from "../lib/auth/password";

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error("Usage: npx tsx scripts/hash-password.ts <password>");
    console.error("");
    console.error("Example:");
    console.error('  npx tsx scripts/hash-password.ts "my-secure-password"');
    console.error("");
    console.error("Then copy the output to your .env file as ADMIN_PASSWORD");
    process.exit(1);
  }

  try {
    const hash = await hashPassword(password);
    console.log("");
    console.log("Password hash (copy this to ADMIN_PASSWORD in .env):");
    console.log("");
    console.log(hash);
    console.log("");
  } catch (err) {
    console.error("Error hashing password:", err);
    process.exit(1);
  }
}

main();
