// app/privacy/page.tsx
import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー - FormGate",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-neutral-0)" }}>
      <header style={{ borderBottom: "1px solid var(--color-neutral-200)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="font-semibold text-xl" style={{ color: "var(--color-neutral-900)" }}>
            FormGate
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold mb-8" style={{ color: "var(--color-neutral-900)" }}>
          プライバシーポリシー
        </h1>

        <div className="prose space-y-6 text-sm" style={{ color: "var(--color-neutral-700)", lineHeight: "1.8" }}>
          <p>最終更新日：2026年2月14日</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>1. 収集する情報</h2>
            <p>本サービスでは、以下の情報を収集します：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>管理者情報：</strong>メールアドレス、パスワード（ハッシュ化して保存）</li>
              <li><strong>フォーム送信データ：</strong>公開フォームから送信された内容（メールアドレス、メッセージ等）</li>
              <li><strong>Backlog連携情報：</strong>スペースURL、APIキー（暗号化して保存）、プロジェクトキー</li>
              <li><strong>利用情報：</strong>フォーム作成数、送信数等のサービス利用状況</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>2. 情報の利用目的</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>本サービスの提供・運営</li>
              <li>Backlogへの課題自動作成</li>
              <li>ユーザーサポート</li>
              <li>サービス改善</li>
              <li>料金請求処理（LemonSqueezy社経由）</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>3. 情報の第三者提供</h2>
            <p>以下の場合を除き、個人情報を第三者に提供することはありません：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>ユーザーが設定したBacklogスペースへの課題作成（ユーザーの同意に基づく）</li>
              <li>決済処理のためのLemonSqueezy社への情報提供</li>
              <li>法令に基づく場合</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>4. データの保管とセキュリティ</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>パスワードはPBKDF2（100,000 iterations, SHA-512）でハッシュ化</li>
              <li>BacklogのAPIキーはAES-256-GCMで暗号化して保存</li>
              <li>通信はHTTPS（TLS）で暗号化</li>
              <li>フォーム送信データの保管期間は最大30日間</li>
              <li>データはSupabase（PostgreSQL）に保存されます</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>5. ユーザーの権利</h2>
            <p>ユーザーは以下の権利を有します：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>個人情報の開示請求</li>
              <li>個人情報の訂正・削除請求</li>
              <li>サービス利用の停止</li>
              <li>データのエクスポート（CSV形式）</li>
            </ul>
            <p>これらの権利行使については、管理者までお問い合わせください。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>6. GDPR（EU一般データ保護規則）への対応</h2>
            <p>EEA（欧州経済領域）のユーザーに対しては、GDPRに基づく権利を保障します。データの処理はサービス提供契約の履行に基づいて行われます。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>7. 個人情報保護法（APPI）への対応</h2>
            <p>日本の個人情報保護法に準拠し、個人データの適切な取扱いを行います。個人データの取扱いに関するお問い合わせは、管理者までご連絡ください。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>8. Cookie</h2>
            <p>本サービスでは、認証セッション管理のためにCookieを使用します。Cookie はhttpOnly、secure属性を設定しており、セッション管理にのみ使用されます。トラッキング目的のCookieは使用していません。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>9. ポリシーの変更</h2>
            <p>本ポリシーは必要に応じて変更されることがあります。重要な変更がある場合は、本サービス上で通知します。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>10. お問い合わせ</h2>
            <p>プライバシーに関するお問い合わせは、本サービスの管理者までご連絡ください。</p>
          </section>
        </div>
      </main>
    </div>
  );
}
