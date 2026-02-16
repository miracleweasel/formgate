// app/terms/page.tsx
import Link from "next/link";

export const metadata = {
  title: "利用規約 - FormGate",
};

export default function TermsPage() {
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
          利用規約
        </h1>

        <div className="prose space-y-6 text-sm" style={{ color: "var(--color-neutral-700)", lineHeight: "1.8" }}>
          <p>最終更新日：2026年2月14日</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>第1条（適用）</h2>
            <p>本利用規約（以下「本規約」）は、FormGate（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>第2条（サービス内容）</h2>
            <p>本サービスは、公開フォームから送信されたデータをNulab社のBacklogサービスの課題として自動作成する機能を提供します。本サービスはBacklogの公式APIを使用しています。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>第3条（アカウント）</h2>
            <p>ユーザーは正確な情報を提供し、アカウント情報の管理について責任を負います。アカウントの不正使用が判明した場合、速やかにご連絡ください。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>第4条（料金・支払い）</h2>
            <p>有料プランの料金は本サービスの料金ページに記載のとおりとします。支払いはLemonSqueezy社の決済プラットフォームを通じて処理されます。サブスクリプションは月額制で、解約するまで自動更新されます。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>第5条（禁止事項）</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>本サービスの不正利用またはセキュリティの侵害</li>
              <li>スパム、不正なデータの送信</li>
              <li>他のユーザーの妨害</li>
              <li>法令に違反する行為</li>
              <li>リバースエンジニアリング</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>第6条（免責事項）</h2>
            <p>本サービスは「現状有姿」で提供されます。Backlog APIの仕様変更、障害、またはその他の事由により、サービスの一部または全部が利用できない場合があります。これに起因する損害について、当社は責任を負いません。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>第7条（サービスの変更・終了）</h2>
            <p>当社は、事前の通知により、本サービスの内容を変更または終了することがあります。</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold" style={{ color: "var(--color-neutral-800)" }}>第8条（準拠法・管轄）</h2>
            <p>本規約は日本法に準拠します。本サービスに関する紛争は、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
          </section>
        </div>
      </main>
    </div>
  );
}
