// sentry.client.config.ts
// Sentry client-side configuration
// Only active when NEXT_PUBLIC_SENTRY_DSN is set

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Sample 100% of errors, 10% of transactions
    tracesSampleRate: 0.1,

    // Don't send PII (emails, IPs, etc.)
    sendDefaultPii: false,

    // Filter noisy errors
    ignoreErrors: [
      "ResizeObserver loop",
      "Network request failed",
      "Load failed",
      "AbortError",
    ],
  });
}
