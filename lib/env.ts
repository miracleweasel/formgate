// lib/env.ts
export function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v || !String(v).trim()) throw new Error(`Missing env: ${name}`);
  return v;
}

export const ENV = {
  DATABASE_URL: mustEnv("DATABASE_URL"),
  APP_ENC_KEY: mustEnv("APP_ENC_KEY"),
  APP_URL: process.env.APP_URL ?? "http://localhost:3000",
};
