import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FormGate - フォームからBacklogチケットを自動作成",
  description: "公開フォームからBacklogの課題を自動作成。5分でセットアップ、コード不要。Backlog公式API使用。",
  keywords: ["Backlog", "フォーム", "自動化", "チケット", "課題管理", "Nulab", "FormGate", "backlog連携"],
  openGraph: {
    title: "FormGate - フォーム → Backlogチケット、自動で。",
    description: "公開フォームの送信をBacklogの課題に自動変換。5分セットアップ、コード不要。",
    type: "website",
    locale: "ja_JP",
    siteName: "FormGate",
  },
  twitter: {
    card: "summary_large_image",
    title: "FormGate - フォーム → Backlogチケット、自動で。",
    description: "公開フォームの送信をBacklogの課題に自動変換。5分セットアップ、コード不要。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

  return (
    <html lang="ja">
      <body
        className={`${inter.variable} ${notoSansJP.variable} antialiased`}
      >
        {children}
        {plausibleDomain && (
          <Script
            defer
            data-domain={plausibleDomain}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
