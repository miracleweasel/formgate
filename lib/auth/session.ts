// lib/auth/session.ts
import type { NextRequest } from "next/server";

const COOKIE_NAME = "fg_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h

export type SessionPayload = {
  v: 1;
  email: string;
  exp: number; // unix seconds
};

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("Missing AUTH_SECRET env var");
  return s;
}

function b64urlEncode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecodeToBytes(s: string) {
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  const b64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function textBytes(s: string) {
  return new TextEncoder().encode(s);
}

let keyPromise: Promise<CryptoKey> | null = null;
async function getHmacKey() {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      "raw",
      textBytes(getSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return keyPromise;
}

async function sign(payloadB64: string) {
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, textBytes(payloadB64));
  return b64urlEncode(new Uint8Array(sig));
}

async function verify(payloadB64: string, sigB64: string) {
  const key = await getHmacKey();
  const sigBytes = b64urlDecodeToBytes(sigB64);
  return crypto.subtle.verify("HMAC", key, sigBytes, textBytes(payloadB64));
}

export async function makeSessionCookieValue(email: string) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { v: 1, email, exp: now + MAX_AGE_SECONDS };
  const json = JSON.stringify(payload);
  const payloadB64 = b64urlEncode(textBytes(json));
  const sigB64 = await sign(payloadB64);
  return `${payloadB64}.${sigB64}`;
}

export async function parseSessionCookieValue(
  value: string | undefined | null
): Promise<SessionPayload | null> {
  if (!value) return null;
  const [payloadB64, sigB64] = value.split(".");
  if (!payloadB64 || !sigB64) return null;

  const ok = await verify(payloadB64, sigB64);
  if (!ok) return null;

  try {
    const json = new TextDecoder().decode(b64urlDecodeToBytes(payloadB64));
    const obj = JSON.parse(json) as SessionPayload;
    if (obj?.v !== 1) return null;
    if (typeof obj.email !== "string") return null;
    if (typeof obj.exp !== "number") return null;
    return obj;
  } catch {
    return null;
  }
}

export async function readSessionFromCookie(value: string | null) {
  return parseSessionCookieValue(value);
}


export function isSessionValid(session: SessionPayload) {
  const now = Math.floor(Date.now() / 1000);
  return session.exp > now;
}

export async function getSessionFromRequest(req: NextRequest) {
  const v = req.cookies.get(COOKIE_NAME)?.value;
  return parseSessionCookieValue(v);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
