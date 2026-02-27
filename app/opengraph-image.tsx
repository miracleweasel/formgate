import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "FormGate - フォーム → Backlogチケット、自動で。";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "white",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 16,
            }}
          >
            <div style={{ width: 40, height: 6, borderRadius: 3, background: "#4F46E5", opacity: 0.5 }} />
            <div style={{ width: 28, height: 6, borderRadius: 3, background: "#4F46E5", opacity: 0.5 }} />
            <div style={{ fontSize: 24, color: "#4F46E5", marginTop: 2, display: "flex" }}>&#10003;</div>
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          FormGate
        </div>

        {/* Subtitle JP */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.9)",
            marginBottom: 12,
          }}
        >
          フォーム → Backlogチケット、自動で。
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
            marginTop: 8,
          }}
        >
          5分セットアップ・コード不要・公式API使用
        </div>

        {/* Flow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "12px 24px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              color: "white",
              fontSize: 18,
            }}
          >
            フォーム送信
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", display: "flex" }}>→</div>
          <div
            style={{
              display: "flex",
              padding: "12px 24px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              color: "white",
              fontSize: 18,
            }}
          >
            自動処理
          </div>
          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", display: "flex" }}>→</div>
          <div
            style={{
              display: "flex",
              padding: "12px 24px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.25)",
              color: "white",
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            Backlog課題作成 ✓
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
