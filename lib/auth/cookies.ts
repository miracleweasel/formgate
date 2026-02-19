// lib/auth/cookies.ts
// Cookie parsing utility - no DB dependency

/** Parse a single cookie value from a cookie header string */
export function getCookieValue(cookieHeader: string, name: string): string | null {
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
