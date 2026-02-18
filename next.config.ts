import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Standalone output for Railway/Docker deployment (smaller image)
  output: "standalone",
};

// Wrap with Sentry only when DSN is configured
const sentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      // Suppress Sentry CLI warnings when no auth token is set
      silent: true,

      // Don't upload source maps without auth token
      sourcemaps: {
        disable: true,
      },
    })
  : nextConfig;
