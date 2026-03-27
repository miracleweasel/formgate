// sentry.server.config.ts
// Sentry server-side configuration
// Only active when NEXT_PUBLIC_SENTRY_DSN is set

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,

    // Sample 100% of errors, 10% of transactions
    tracesSampleRate: 0.1,

    // Don't send PII
    sendDefaultPii: false,

    // Scrub sensitive data from breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Never log API keys or passwords in breadcrumbs
      if (breadcrumb.data) {
        const data = breadcrumb.data as Record<string, unknown>;
        delete data["apiKey"];
        delete data["password"];
        delete data["api_key"];
      }
      return breadcrumb;
    },

    // Scrub sensitive data from events
    beforeSend(event) {
      // Remove request body data (may contain API keys)
      if (event.request?.data) {
        event.request.data = "[Filtered]";
      }
      return event;
    },
  });
}
