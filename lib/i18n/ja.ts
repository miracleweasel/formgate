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
    help: "ヘルプ",
    logout: "ログアウト",
    loggedInAs: "ログイン中:",
  },

  // ==========================================================================
  // Auth / Login
  // ==========================================================================
  auth: {
    login: "ログイン",
    loginTitle: "ログイン / 新規登録",
    loginSubtitle: "メールアドレスでログイン",
    email: "メールアドレス",
    sendLink: "ログインリンクを送信",
    sendingLink: "送信中...",
    checkEmail: "メールを確認してください",
    checkEmailHint: "ログインリンクを送信しました。メールに届いたリンクをクリックしてください。リンクは15分間有効です。",
    invalidLink: "このリンクは無効または期限切れです。もう一度お試しください。",
    expiredLink: "このリンクは期限切れです。もう一度お試しください。",
    loginOrRegister: "ログイン / 新規登録",
    logoutSuccess: "ログアウトしました",
  },

  // ==========================================================================
  // Forms
  // ==========================================================================
  forms: {
    title: "フォーム一覧",
    newForm: "新規作成",
    noForms: "まだフォームがありません",
    noFormsHint: "最初のフォームを作成して、お問い合わせの自動化を始めましょう。",
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
    noSubmissions: "まだ送信がありません。公開URLを共有してフォームを利用しましょう。",
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
    goToTop: "トップへ",
    date: "日時",
    email: "メール",
    message: "メッセージ",
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
    thankYouMessage: "お問い合わせを受け付けました。ありがとうございます。",
    poweredBy: "Powered by FormGate",
    formNotFound: "このフォームは存在しないか、削除されました。",
    fileTooLarge: "ファイルサイズが大きすぎます。",
    tooManyFiles: "ファイル数が上限を超えています（最大3ファイル）。",
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
      // Field mapping
      fieldMapping: "フィールドマッピング",
      fieldMappingDesc: "フォームのフィールドをBacklog課題のフィールドにマッピングします。",
      summaryMapping: "件名（Summary）",
      summaryDefault: "デフォルト（[FormGate] フォーム名）",
      summaryField: "フィールドの値を使用",
      summaryTemplate: "テンプレートを使用",
      summaryFieldSelect: "フィールドを選択",
      summaryTemplatePlaceholder: "例: {company}からのお問い合わせ",
      descriptionMapping: "説明（Description）",
      descriptionAuto: "全フィールドを自動表示",
      descriptionField: "フィールドの値を使用",
      descriptionTemplate: "テンプレートを使用",
      descriptionTemplatePlaceholder: "例: 会社名: {company}\nメール: {email}\n\n{message}",
      issueType: "課題種別",
      issueTypeDefault: "デフォルト（最初の種別を使用）",
      priority: "優先度",
      priorityDefault: "デフォルト（中）",
      customFields: "カスタムフィールド",
      customFieldsDesc: "フォームのフィールドをBacklogカスタムフィールドにマッピング",
      addCustomField: "マッピングを追加",
      removeCustomField: "削除",
      backlogField: "Backlogフィールド",
      formField: "フォームフィールド",
      noCustomFields: "このプロジェクトにカスタムフィールドはありません。",
      loadingMeta: "プロジェクト情報を読み込み中...",
      loadMetaFailed: "プロジェクト情報の取得に失敗しました。",
      refreshMeta: "再読み込み",
      // Assignment
      assignment: "担当者の自動割り当て",
      assignmentDesc: "課題作成時に担当者を自動で設定します。",
      assignNone: "割り当てなし",
      assignStatic: "固定メンバー",
      assignFieldMatch: "フィールドの値で判定",
      assignSelectMember: "メンバーを選択",
      assignRuleValue: "フィールドの値",
      assignAddRule: "ルールを追加",
      assignFallback: "該当なしの場合のフォールバック",
      // Sub-tasks
      subTasks: "サブタスク自動作成",
      subTasksDesc: "親課題作成後にサブタスクを自動生成します（最大5件）。件名に{フィールド名}でテンプレート可能。",
      subTaskSummaryPlaceholder: "例: {company}の対応確認",
      subTaskAdd: "サブタスクを追加",
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
    usage: "使用状況",
    formsUsed: "フォーム",
    submissionsUsed: "今月の送信数",
    unlimited: "無制限",
    billingNotConfigured: "決済システムは準備中です。現在は無料プランをご利用いただけます。",
    manageSubscription: "サブスクリプション管理",
    perMonth: "/月",
  },

  // ==========================================================================
  // Errors
  // ==========================================================================
  errors: {
    generic: "エラーが発生しました。もう一度お試しください。",
    network: "通信エラーが発生しました。インターネット接続を確認してもう一度お試しください。",
    unauthorized: "認証が必要です。ログインしてください。",
    invalidCredentials: "ログインリンクが無効です。もう一度お試しください。",
    rateLimited: "リクエスト制限に達しました。少し時間をおいてから再度お試しください。",
    notFound: "見つかりませんでした。",
    invalidInput: "入力内容を確認してください。",
    slugExists: "このスラッグは既に使用されています。",
    required: "必須項目です。",
    invalidEmail: "有効なメールアドレスを入力してください。",
  },

  // ==========================================================================
  // Field Builder
  // ==========================================================================
  fieldBuilder: {
    title: "フィールド設定",
    addField: "フィールド追加",
    removeField: "削除",
    moveUp: "上へ",
    moveDown: "下へ",
    fieldCount: "フィールド数",
    maxFieldsReached: "フィールドの上限（20個）に達しました",
    // Types
    typeText: "テキスト",
    typeEmail: "メール",
    typeNumber: "数値",
    typeTextarea: "テキストエリア",
    typeSelect: "選択",
    typeUrl: "URL",
    typePhone: "電話番号",
    typeDate: "日付",
    typeCheckbox: "チェックボックス",
    typeRadio: "ラジオボタン",
    typeFile: "ファイル",
    // File field
    fileAccept: "許可する形式",
    fileMaxSize: "最大サイズ",
    // Props
    fieldName: "フィールド名",
    fieldLabel: "ラベル",
    fieldRequired: "必須",
    fieldPlaceholder: "プレースホルダー",
    minLength: "最小文字数",
    maxLength: "最大文字数",
    minValue: "最小値",
    maxValue: "最大値",
    // Select
    options: "選択肢",
    optionValue: "値",
    optionLabel: "表示名",
    addOption: "選択肢を追加",
    removeOption: "削除",
    // Preview
    showPreview: "プレビュー表示",
    hidePreview: "プレビュー非表示",
    previewTitle: "プレビュー",
    // Validation errors
    nameRequired: "フィールド名は必須です",
    nameInvalid: "フィールド名は英字で始まり、英数字とアンダースコアのみ使用可能です",
    nameDuplicate: "フィールド名が重複しています",
    labelRequired: "ラベルは必須です",
    optionsRequired: "少なくとも1つの選択肢が必要です",
    optionEmpty: "選択肢の値と表示名は必須です",
    // Actions
    saved: "保存しました",
    saving: "保存中...",
    saveFailed: "保存に失敗しました",
  },

  // ==========================================================================
  // Onboarding
  // ==========================================================================
  onboarding: {
    title: "セットアップ",
    subtitle: "3ステップでFormGateを始めましょう",
    step1Title: "フォームを作成",
    step1Desc: "最初のフォームを作成して公開URLを取得しましょう。",
    step1Action: "フォームを作成",
    step2Title: "Backlogを接続",
    step2Desc: "BacklogのスペースURLとAPIキーを設定して連携を有効にします。",
    step2Action: "接続設定",
    step3Title: "最初の送信を受信",
    step3Desc: "公開URLを共有して、最初のフォーム送信を受け取りましょう。",
    step3Hint: "フォームの公開URLを共有してください",
    completed: "セットアップ完了",
    dismiss: "閉じる",
    stepsCompleted: "完了",
  },

  // ==========================================================================
  // Settings
  // ==========================================================================
  settings: {
    title: "設定",
    backlogConnection: "Backlog接続設定",
    spaceUrl: "スペースURL",
    spaceUrlPlaceholder: "https://your-space.backlog.jp",
    spaceUrlHint: "BacklogスペースのURLを入力してください",
    apiKey: "APIキー",
    apiKeyPlaceholder: "APIキーを入力",
    apiKeyHint: "Backlogの個人設定 > APIからキーを取得できます",
    projectKey: "デフォルトプロジェクトキー",
    projectKeyPlaceholder: "例: PROJ",
    projectKeyHint: "フォームごとに上書き可能です",
    testConnection: "接続テスト",
    testing: "テスト中...",
    save: "保存",
    saving: "保存中...",
    saved: "保存しました",
    saveFailed: "保存に失敗しました",
    testSuccess: "接続成功",
    testFailed: "接続失敗",
    connected: "接続済み",
    notConnected: "未接続",
    apiKeyNote: "APIキーはサーバー側で暗号化して保存されます。クライアントには公開されません。",
    apiKeyStored: "設定済み",
  },

  // ==========================================================================
  // Templates
  // ==========================================================================
  templates: {
    title: "テンプレート",
    subtitle: "テンプレートを選択してフォームを素早く作成",
    blank: { name: "空のフォーム", description: "ゼロから自由に作成" },
    contact: { name: "お問い合わせ", description: "名前・メール・メッセージの基本フォーム" },
    bugReport: { name: "バグ報告", description: "重要度・再現手順を含むバグ報告フォーム" },
    featureRequest: { name: "機能リクエスト", description: "優先度付きの機能要望フォーム" },
    feedback: { name: "フィードバック", description: "評価・カテゴリ付きのフィードバックフォーム" },
    support: { name: "サポート", description: "緊急度付きのサポートリクエストフォーム" },
  },

  // ==========================================================================
  // Landing Page
  // ==========================================================================
  landing: {
    hero: {
      title: "フォーム → Backlogチケット、自動で。",
      subtitle: "フォームの送信内容をBacklogの課題に自動変換。コード不要、5分でセットアップ完了。",
      cta: "無料で始める",
      ctaLogin: "ログイン",
      badge: "Backlog公式API使用",
    },
    trustBar: {
      api: "Backlog公式API使用",
      setup: "5分セットアップ",
      serverSide: "サーバーサイド処理",
    },
    flow: {
      form: "フォーム送信",
      process: "自動処理",
      ticket: "Backlog課題",
    },
    features: {
      title: "シンプルな3ステップ",
      step1: {
        title: "フォーム作成",
        description: "管理画面で30秒でフォームを作成。カスタムフィールドも自由に設定できます。",
      },
      step2: {
        title: "Backlog連携",
        description: "APIキーを貼り付けて接続完了。プロジェクトやフィールドのマッピングも簡単。",
      },
      step3: {
        title: "自動チケット化",
        description: "フォームが送信されると即座にBacklog課題を自動作成。もう手動コピーは不要。",
      },
    },
    usedBy: "導入企業",
    pricing: {
      title: "料金プラン",
      popular: "人気",
      enterprise: "Enterprise（カスタム対応）: お問い合わせください",
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
    pain: {
      title: "こんな作業、まだ手動でやっていませんか？",
      before: "今まで（手動）",
      beforeSteps: [
        "フォーム送信メールを確認",
        "Backlogを開く",
        "課題を新規作成",
        "内容をコピー＆ペースト",
        "担当者・優先度を設定",
      ],
      after: "FormGateなら",
      afterSteps: [
        "フォーム送信",
        "Backlog課題が自動作成",
        "完了！",
      ],
    },
    faq: {
      title: "よくある質問",
      items: [
        {
          q: "Backlogの公式APIを使っていますか？",
          a: "はい。FormGateはBacklog（Nulab社）の公式REST APIのみを使用しています。スクレイピングや非公式な方法は一切使用していません。",
        },
        {
          q: "セットアップにどのくらい時間がかかりますか？",
          a: "5分以内で完了します。メールでログイン → フォーム作成 → BacklogのAPIキーを貼り付けるだけです。コーディング不要です。",
        },
        {
          q: "無料プランに制限はありますか？",
          a: "無料プランではフォーム1件、月50件の送信まで利用可能です。小規模な運用であれば十分にご利用いただけます。",
        },
        {
          q: "データはどこに保存されますか？",
          a: "送信データはPostgreSQLデータベースに保存されます。BacklogのAPIキーはAES-256-GCMで暗号化して保存しています。",
        },
        {
          q: "Zapier/Makeとの違いは？",
          a: "FormGateはBacklog専用に設計されています。セットアップが圧倒的に速く（5分 vs 20〜30分）、日本語UIで、月額も低価格です。",
        },
      ],
    },
    finalCta: {
      title: "今すぐ始めよう",
      subtitle: "セットアップは5分。クレジットカード不要で今すぐ始められます。",
    },
    footer: {
      copyright: "© 2026 FormGate",
      terms: "利用規約",
      privacy: "プライバシーポリシー",
      product: "プロダクト",
      legal: "法的情報",
    },
  },
};

// Re-export type for convenience
export type { TranslationSchema as TranslationKeys } from "./types";
