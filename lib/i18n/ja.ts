// lib/i18n/ja.ts
// Japanese UI strings - Target market: Japan
// Keys are in English for developer readability

import type { TranslationSchema } from "./types";

export const ja: TranslationSchema = {
  // ==========================================================================
  // Common
  // ==========================================================================
  common: {
    appName: "FormGate",
    tagline: "フォームからBacklogチケットを自動作成",
    loading: "読み込み中...",
    save: "保存",
    cancel: "キャンセル",
    delete: "削除",
    back: "戻る",
    submit: "送信",
    create: "作成",
    edit: "編集",
    view: "詳細",
    close: "閉じる",
    yes: "はい",
    no: "いいえ",
    optional: "任意",
    required: "必須",
    select: "選択してください",
  },

  // ==========================================================================
  // Navigation
  // ==========================================================================
  nav: {
    forms: "フォーム",
    billing: "プラン",
    settings: "設定",
    logout: "ログアウト",
    loggedInAs: "ログイン中:",
  },

  // ==========================================================================
  // Auth / Login
  // ==========================================================================
  auth: {
    login: "ログイン",
    loginTitle: "管理者ログイン",
    loginSubtitle: "FormGate管理画面",
    email: "メールアドレス",
    password: "パスワード",
    signIn: "ログイン",
    signingIn: "ログイン中...",
    logoutSuccess: "ログアウトしました",
  },

  // ==========================================================================
  // Forms
  // ==========================================================================
  forms: {
    title: "フォーム一覧",
    newForm: "新規作成",
    noForms: "フォームがまだありません。",
    noFormsHint: "「新規作成」ボタンからフォームを作成してください。",
    createTitle: "フォーム作成",
    formName: "フォーム名",
    formNamePlaceholder: "例: お問い合わせ",
    slug: "スラッグ",
    slugPlaceholder: "例: contact",
    slugHint: "URLに使用されます: /f/<スラッグ>",
    description: "説明",
    descriptionPlaceholder: "フォームの説明（任意）",
    creating: "作成中...",
    created: "作成",
    updated: "更新",
    publicUrl: "公開URL",
    copyUrl: "URLをコピー",
    copiedUrl: "コピーしました",
    openPreview: "プレビュー",
    deleteConfirm: "このフォームを削除しますか？この操作は取り消せません。",
    deleting: "削除中...",
    nameRequired: "名前は必須です。",
    slugRequired: "スラッグは必須です。",
    createFailed: "作成に失敗しました",
  },

  // ==========================================================================
  // Submissions
  // ==========================================================================
  submissions: {
    title: "送信一覧",
    recent: "最近の送信",
    noSubmissions: "送信がまだありません。",
    noSubmissionsFiltered: "該当する送信がありません。",
    exportCsv: "CSVエクスポート",
    exporting: "エクスポート中...",
    exportLatest: "最新50件",
    exportAll: "すべて",
    filters: "フィルター",
    all: "すべて",
    today: "今日",
    last7Days: "過去7日",
    last30Days: "過去30日",
    searchByEmail: "メールで検索",
    search: "検索",
    clear: "クリア",
    loaded: "読込済",
    moreAvailable: "続きあり",
    end: "終了",
    range: "期間",
    loadMore: "もっと見る",
    goToTop: "↑ トップへ",
  },

  // ==========================================================================
  // Public Form
  // ==========================================================================
  publicForm: {
    emailLabel: "メールアドレス",
    emailPlaceholder: "example@example.com",
    messageLabel: "メッセージ",
    messagePlaceholder: "お問い合わせ内容をご記入ください",
    submit: "送信する",
    submitting: "送信中...",
    thankYou: "ありがとうございます",
    thankYouMessage: "メッセージを受け付けました。",
    poweredBy: "Powered by FormGate",
  },

  // ==========================================================================
  // Integrations
  // ==========================================================================
  integrations: {
    title: "連携設定",
    backlog: {
      title: "Backlog連携",
      description: "新しい送信時にBacklogの課題を自動作成します。",
      configure: "設定",
      enabled: "有効",
      disabled: "無効",
      spaceUrl: "スペースURL",
      spaceUrlPlaceholder: "https://your-space.backlog.jp",
      apiKey: "APIキー",
      apiKeyPlaceholder: "APIキーを入力",
      apiKeyHint: "Backlogの個人設定 > APIからキーを取得できます",
      projectKey: "プロジェクトキー",
      projectKeyPlaceholder: "例: PROJ",
      projectKeyOverride: "プロジェクトキー上書き（任意）",
      effectiveProjectKey: "適用されるプロジェクトキー",
      testConnection: "接続テスト",
      testing: "テスト中...",
      testSuccess: "接続成功",
      testFailed: "接続失敗",
      saving: "保存中...",
      saved: "保存しました",
      saveFailed: "保存に失敗しました",
      connectionSafe: "接続情報",
      defaultProjectKey: "デフォルトプロジェクトキー",
      formSettings: "フォーム設定",
      enableForForm: "このフォームで有効化",
      apiKeyNote: "注: APIキーは公開されません。すべてのBacklog操作はサーバー側で実行されます。",
      invalidResponse: "無効なレスポンスです。",
      loadFailed: "設定の読み込みに失敗しました。",
      connectionOk: "接続OK",
    },
  },

  // ==========================================================================
  // Billing
  // ==========================================================================
  billing: {
    title: "プラン",
    currentPlan: "現在のプラン",
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
    upgrade: "アップグレード",
    manage: "プラン管理",
  },

  // ==========================================================================
  // Errors
  // ==========================================================================
  errors: {
    generic: "エラーが発生しました",
    network: "ネットワークエラー。接続を確認してください。",
    unauthorized: "認証が必要です。ログインしてください。",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません。",
    rateLimited: "リクエストが多すぎます。しばらくお待ちください。",
    notFound: "見つかりませんでした。",
    invalidInput: "入力内容を確認してください。",
    slugExists: "このスラッグは既に使用されています。",
    required: "必須項目です。",
    invalidEmail: "有効なメールアドレスを入力してください。",
  },

  // ==========================================================================
  // Landing Page
  // ==========================================================================
  landing: {
    hero: {
      title: "フォーム → Backlogチケット、自動で。",
      subtitle: "5分でセットアップ。コードなし。",
      cta: "無料で始める",
      ctaLogin: "ログイン",
      badge: "Backlog公式API使用",
    },
    features: {
      title: "シンプルな3ステップ",
      step1: {
        title: "フォーム作成",
        description: "管理画面で30秒でフォームを作成",
      },
      step2: {
        title: "Backlog連携",
        description: "APIキーを貼り付けて接続完了",
      },
      step3: {
        title: "自動チケット化",
        description: "送信されると即座に課題作成",
      },
    },
    usedBy: "導入企業",
    pricing: {
      title: "料金プラン",
      free: {
        name: "Free",
        price: "¥0",
        period: "/月",
        features: ["フォーム1件", "月50件まで", "FormGateロゴ表示"],
      },
      starter: {
        name: "Starter",
        price: "¥2,980",
        period: "/月",
        features: ["フォーム5件", "月500件まで", "ロゴ非表示"],
      },
      pro: {
        name: "Pro",
        price: "¥9,800",
        period: "/月",
        features: ["無制限", "月5,000件まで", "優先サポート"],
      },
    },
    footer: {
      copyright: "© 2026 FormGate",
      terms: "利用規約",
      privacy: "プライバシーポリシー",
    },
  },
};

// Re-export type for convenience
export type { TranslationSchema as TranslationKeys } from "./types";
