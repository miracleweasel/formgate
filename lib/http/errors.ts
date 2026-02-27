// lib/http/errors.ts
import { NextResponse } from "next/server";

/**
 * Standard error payload: { error: string }
 * - Never include stack traces or internal details in the response body.
 * - Use console.error server-side where appropriate.
 */
export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorized() {
  return jsonError(401, "unauthorized");
}

export function badRequest(message = "bad request") {
  return jsonError(400, message);
}

export function internalError() {
  // Keep it generic to avoid leaking details
  return jsonError(500, "internal error");
}
