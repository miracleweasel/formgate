// drizzle.config.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local", quiet: true });

import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
} satisfies Config;
