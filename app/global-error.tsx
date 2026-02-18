// app/global-error.tsx
"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ja">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "24px" }}>500</div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "8px" }}>
              エラーが発生しました
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#737373", marginBottom: "24px" }}>
              予期しないエラーが発生しました。もう一度お試しください。
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 22px",
                fontSize: "0.9375rem",
                fontWeight: 500,
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                background: "#2563EB",
                color: "white",
              }}
            >
              もう一度試す
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
