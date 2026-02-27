// app/(dashboard)/help/page.tsx
// User guide page - Japanese documentation for FormGate
import { t } from "@/lib/i18n";

const sections = [
  { id: "getting-started", title: "はじめに" },
  { id: "form-management", title: "フォーム管理" },
  { id: "backlog-integration", title: "Backlog連携" },
  { id: "submission-management", title: "送信管理" },
  { id: "plans", title: "プランと制限" },
] as const;

function SectionHeading({ id, title }: { id: string; title: string }) {
  return (
    <h2
      id={id}
      style={{
        fontSize: "1.35rem",
        fontWeight: 600,
        color: "var(--color-neutral-900)",
        marginTop: "var(--space-12)",
        marginBottom: "var(--space-6)",
        paddingBottom: "var(--space-3)",
        borderBottom: "1px solid var(--color-neutral-150)",
        scrollMarginTop: "5rem",
      }}
    >
      {title}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "var(--color-neutral-800)",
        marginTop: "var(--space-8)",
        marginBottom: "var(--space-4)",
      }}
    >
      {children}
    </h3>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: "var(--color-neutral-600)",
        lineHeight: 1.8,
        marginBottom: "var(--space-4)",
      }}
    >
      {children}
    </p>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol
      style={{
        paddingLeft: "var(--space-6)",
        color: "var(--color-neutral-600)",
        lineHeight: 1.8,
        marginBottom: "var(--space-4)",
      }}
    >
      {steps.map((step, i) => (
        <li
          key={i}
          style={{
            marginBottom: "var(--space-2)",
            paddingLeft: "var(--space-2)",
          }}
        >
          {step}
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul
      style={{
        paddingLeft: "var(--space-6)",
        color: "var(--color-neutral-600)",
        lineHeight: 1.8,
        marginBottom: "var(--space-4)",
        listStyleType: "disc",
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            marginBottom: "var(--space-2)",
            paddingLeft: "var(--space-2)",
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function CodeInline({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        background: "var(--color-neutral-100)",
        color: "var(--color-accent-700)",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "0.9em",
        fontFamily: "monospace",
      }}
    >
      {children}
    </code>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--color-accent-50)",
        border: "1px solid var(--color-accent-200)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4) var(--space-5)",
        marginBottom: "var(--space-4)",
        color: "var(--color-accent-700)",
        fontSize: "0.95rem",
        lineHeight: 1.7,
      }}
    >
      <strong style={{ color: "var(--color-accent-800)" }}>Tip: </strong>
      {children}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8">
      {/* Page header */}
      <div className="page-header" style={{ marginBottom: "var(--space-8)" }}>
        <h1 className="page-header-title">
          ご利用ガイド
        </h1>
      </div>

      {/* Table of contents */}
      <nav
        className="card"
        style={{
          padding: "var(--space-6) var(--space-8)",
          marginBottom: "var(--space-8)",
        }}
      >
        <h2
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "var(--color-neutral-500)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: "var(--space-4)",
          }}
        >
          目次
        </h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                style={{
                  color: "var(--color-accent-600)",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  lineHeight: 1.8,
                }}
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content */}
      <div
        className="card"
        style={{
          padding: "var(--space-8) var(--space-10)",
        }}
      >
        {/* ================================================================= */}
        {/* Section 1: Getting Started */}
        {/* ================================================================= */}
        <SectionHeading id="getting-started" title="はじめに" />

        <SubHeading>FormGateとは</SubHeading>
        <Paragraph>
          FormGateは、公開フォームの送信をBacklog（Nulab社）の課題に自動変換するサービスです。
          Backlogの公式REST APIのみを使用しており、セキュリティとデータの安全性を確保しています。
        </Paragraph>
        <Paragraph>
          手動でメールからBacklogにコピー＆ペーストする作業をなくし、フォーム送信から課題作成までを完全に自動化します。
        </Paragraph>

        <SubHeading>基本的な流れ</SubHeading>
        <StepList
          steps={[
            "FormGateにログインし、フォームを作成します",
            "Backlog接続情報（スペースURL、APIキー、プロジェクトキー）を設定します",
            "フォームの公開URLを共有します",
            "ユーザーがフォームを送信すると、Backlog課題が自動作成されます",
          ]}
        />
        <Tip>
          セットアップは5分以内で完了します。コーディングは不要です。
        </Tip>

        {/* ================================================================= */}
        {/* Section 2: Form Management */}
        {/* ================================================================= */}
        <SectionHeading id="form-management" title="フォーム管理" />

        <SubHeading>フォームの作成</SubHeading>
        <StepList
          steps={[
            "ダッシュボードの「フォーム」ページで「新規作成」をクリックします",
            "フォーム名を入力します（例: 「お問い合わせ」「採用応募」）",
            "スラッグを設定します（URLに使用されます。例: contact → /f/contact）",
            "必要に応じて説明を入力します",
            "「作成」をクリックします",
          ]}
        />

        <SubHeading>カスタムフィールドの設定</SubHeading>
        <Paragraph>
          フォーム作成後、「編集」ページからフィールドを自由にカスタマイズできます。
          以下のフィールドタイプが利用可能です。
        </Paragraph>
        <BulletList
          items={[
            "テキスト — 名前、会社名などの短い入力項目",
            "メール — メールアドレス（形式を自動検証）",
            "数値 — 電話番号、数量など",
            "テキストエリア — メッセージ、詳細な説明など複数行の入力",
            "選択 — プルダウンメニューから1つ選択（選択肢は自由に設定可能）",
          ]}
        />
        <Paragraph>
          各フィールドには、ラベル、プレースホルダー、必須/任意の設定、文字数制限などを個別に設定できます。
          フィールドの順番はドラッグ＆ドロップ、または上下ボタンで変更できます。
        </Paragraph>
        <Tip>
          「プレビュー」機能で、実際の公開フォームの見た目をリアルタイムで確認できます。
        </Tip>

        <SubHeading>公開URLの共有方法</SubHeading>
        <Paragraph>
          フォーム一覧から各フォームの公開URLを確認できます。
          <CodeInline>/f/スラッグ名</CodeInline> の形式で、Webサイトやメールに直接リンクできます。
        </Paragraph>
        <StepList
          steps={[
            "フォーム一覧で対象のフォームを見つけます",
            "「URLをコピー」ボタンをクリックします",
            "コピーしたURLをWebサイト、メール、SNSなどで共有します",
          ]}
        />

        {/* ================================================================= */}
        {/* Section 3: Backlog Integration */}
        {/* ================================================================= */}
        <SectionHeading id="backlog-integration" title="Backlog連携" />

        <SubHeading>接続設定</SubHeading>
        <Paragraph>
          Backlog連携を使用するには、3つの情報が必要です。
        </Paragraph>
        <StepList
          steps={[
            "スペースURL — BacklogスペースのURL（例: https://your-space.backlog.jp）",
            "APIキー — Backlogの個人設定 > API から取得できます",
            "プロジェクトキー — 課題を作成するプロジェクトのキー（例: PROJ）",
          ]}
        />
        <Paragraph>
          設定方法:「設定」ページにアクセスし、上記の情報を入力して「接続テスト」を実行します。
          接続が成功したら「保存」をクリックして完了です。
        </Paragraph>
        <Tip>
          APIキーはサーバー側でAES-256-GCMにより暗号化して保存されます。クライアント側に公開されることはありません。
        </Tip>

        <SubHeading>フォーム別の連携設定</SubHeading>
        <Paragraph>
          各フォームの詳細ページで、Backlog連携を個別に有効/無効にできます。
          フォームごとにプロジェクトキーを上書きすることも可能です（設定がない場合はデフォルトのプロジェクトキーが使用されます）。
        </Paragraph>

        <SubHeading>フィールドマッピング</SubHeading>
        <Paragraph>
          フォームのフィールドをBacklog課題のフィールドにマッピングできます。
        </Paragraph>
        <BulletList
          items={[
            "件名（Summary） — デフォルト、フィールド値、またはテンプレートから選択",
            "説明（Description） — 全フィールド自動表示、フィールド値、またはテンプレート",
            "課題種別 — Backlogプロジェクトの課題種別を選択",
            "優先度 — Backlogの優先度を選択",
            "カスタムフィールド — Backlogカスタムフィールドとフォームフィールドの対応を設定",
          ]}
        />
        <Paragraph>
          テンプレートでは <CodeInline>{"{field_name}"}</CodeInline> の形式でフィールド値を埋め込むことができます。
          例: <CodeInline>{"{company}からのお問い合わせ"}</CodeInline>
        </Paragraph>

        {/* ================================================================= */}
        {/* Section 4: Submission Management */}
        {/* ================================================================= */}
        <SectionHeading id="submission-management" title="送信管理" />

        <SubHeading>送信の確認</SubHeading>
        <Paragraph>
          フォーム詳細ページの「送信一覧」タブで、すべての送信データを確認できます。
          最新の送信が上部に表示され、日時、メールアドレス、フィールドの内容を閲覧できます。
        </Paragraph>

        <SubHeading>CSVエクスポート</SubHeading>
        <Paragraph>
          送信データはCSV形式でダウンロードできます。
        </Paragraph>
        <BulletList
          items={[
            "「最新50件」 — 直近の50件をエクスポート",
            "「すべて」 — すべての送信データをエクスポート",
          ]}
        />

        <SubHeading>フィルターと検索</SubHeading>
        <Paragraph>
          送信一覧では、以下のフィルターと検索が利用可能です。
        </Paragraph>
        <BulletList
          items={[
            "期間フィルター — 今日、過去7日、過去30日、すべて",
            "メール検索 — 送信者のメールアドレスで絞り込み",
          ]}
        />

        {/* ================================================================= */}
        {/* Section 5: Plans & Limits */}
        {/* ================================================================= */}
        <SectionHeading id="plans" title="プランと制限" />

        <SubHeading>各プランの制限</SubHeading>
        <div style={{ marginBottom: "var(--space-6)", overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.95rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "2px solid var(--color-neutral-200)",
                }}
              >
                {["プラン", "フォーム数", "月間送信数", "ブランディング", "月額"].map((header) => (
                  <th
                    key={header}
                    style={{
                      padding: "var(--space-3) var(--space-4)",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "var(--color-neutral-700)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { plan: "Free", forms: "1件", subs: "50件", branding: "あり", price: "0円" },
                { plan: "Starter", forms: "5件", subs: "500件", branding: "なし", price: "2,980円" },
                { plan: "Pro", forms: "無制限", subs: "5,000件", branding: "なし", price: "9,800円" },
                { plan: "Enterprise", forms: "カスタム", subs: "カスタム", branding: "なし", price: "お問い合わせ" },
              ].map((row) => (
                <tr
                  key={row.plan}
                  style={{
                    borderBottom: "1px solid var(--color-neutral-100)",
                  }}
                >
                  <td
                    style={{
                      padding: "var(--space-3) var(--space-4)",
                      fontWeight: 500,
                      color: "var(--color-neutral-800)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.plan}
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-neutral-600)" }}>
                    {row.forms}
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-neutral-600)" }}>
                    {row.subs}
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-neutral-600)" }}>
                    {row.branding}
                  </td>
                  <td style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-neutral-600)", whiteSpace: "nowrap" }}>
                    {row.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SubHeading>アップグレード方法</SubHeading>
        <StepList
          steps={[
            "ダッシュボードの「プラン」ページにアクセスします",
            "ご希望のプランの「アップグレード」ボタンをクリックします",
            "決済ページで支払い情報を入力します",
            "決済完了後、即座にプランが反映されます",
          ]}
        />
        <Paragraph>
          プランの変更・解約は「プラン」ページの「サブスクリプション管理」からいつでも行えます。
        </Paragraph>

        {/* Divider */}
        <div
          style={{
            marginTop: "var(--space-12)",
            paddingTop: "var(--space-6)",
            borderTop: "1px solid var(--color-neutral-150)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "var(--color-neutral-400)",
              fontSize: "0.9rem",
            }}
          >
            ご不明な点がございましたら、お気軽にお問い合わせください。
          </p>
        </div>
      </div>
    </div>
  );
}
