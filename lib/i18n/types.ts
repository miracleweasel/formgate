// lib/i18n/types.ts
// Type definitions for i18n translations
// Uses string types (not literal types) to allow different translations

export interface TranslationSchema {
  common: {
    appName: string;
    tagline: string;
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    back: string;
    submit: string;
    create: string;
    edit: string;
    view: string;
    close: string;
    yes: string;
    no: string;
    optional: string;
    required: string;
    select: string;
  };

  nav: {
    forms: string;
    billing: string;
    settings: string;
    logout: string;
    loggedInAs: string;
  };

  auth: {
    login: string;
    loginTitle: string;
    loginSubtitle: string;
    email: string;
    sendLink: string;
    sendingLink: string;
    checkEmail: string;
    checkEmailHint: string;
    invalidLink: string;
    expiredLink: string;
    loginOrRegister: string;
    logoutSuccess: string;
  };

  forms: {
    title: string;
    newForm: string;
    noForms: string;
    noFormsHint: string;
    createTitle: string;
    formName: string;
    formNamePlaceholder: string;
    slug: string;
    slugPlaceholder: string;
    slugHint: string;
    description: string;
    descriptionPlaceholder: string;
    creating: string;
    created: string;
    updated: string;
    publicUrl: string;
    copyUrl: string;
    copiedUrl: string;
    openPreview: string;
    deleteConfirm: string;
    deleting: string;
    nameRequired: string;
    slugRequired: string;
    createFailed: string;
  };

  submissions: {
    title: string;
    recent: string;
    noSubmissions: string;
    noSubmissionsFiltered: string;
    exportCsv: string;
    exporting: string;
    exportLatest: string;
    exportAll: string;
    filters: string;
    all: string;
    today: string;
    last7Days: string;
    last30Days: string;
    searchByEmail: string;
    search: string;
    clear: string;
    loaded: string;
    moreAvailable: string;
    end: string;
    range: string;
    loadMore: string;
    goToTop: string;
    date: string;
    email: string;
    message: string;
  };

  publicForm: {
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    thankYou: string;
    thankYouMessage: string;
    poweredBy: string;
    formNotFound: string;
  };

  integrations: {
    title: string;
    backlog: {
      title: string;
      description: string;
      configure: string;
      enabled: string;
      disabled: string;
      spaceUrl: string;
      spaceUrlPlaceholder: string;
      apiKey: string;
      apiKeyPlaceholder: string;
      apiKeyHint: string;
      projectKey: string;
      projectKeyPlaceholder: string;
      projectKeyOverride: string;
      effectiveProjectKey: string;
      testConnection: string;
      testing: string;
      testSuccess: string;
      testFailed: string;
      saving: string;
      saved: string;
      saveFailed: string;
      connectionSafe: string;
      defaultProjectKey: string;
      formSettings: string;
      enableForForm: string;
      apiKeyNote: string;
      invalidResponse: string;
      loadFailed: string;
      connectionOk: string;
      // Field mapping
      fieldMapping: string;
      fieldMappingDesc: string;
      summaryMapping: string;
      summaryDefault: string;
      summaryField: string;
      summaryTemplate: string;
      summaryFieldSelect: string;
      summaryTemplatePlaceholder: string;
      descriptionMapping: string;
      descriptionAuto: string;
      descriptionField: string;
      descriptionTemplate: string;
      descriptionTemplatePlaceholder: string;
      issueType: string;
      issueTypeDefault: string;
      priority: string;
      priorityDefault: string;
      customFields: string;
      customFieldsDesc: string;
      addCustomField: string;
      removeCustomField: string;
      backlogField: string;
      formField: string;
      noCustomFields: string;
      loadingMeta: string;
      loadMetaFailed: string;
      refreshMeta: string;
    };
  };

  billing: {
    title: string;
    currentPlan: string;
    free: string;
    starter: string;
    pro: string;
    enterprise: string;
    upgrade: string;
    manage: string;
    usage: string;
    formsUsed: string;
    submissionsUsed: string;
    unlimited: string;
    billingNotConfigured: string;
    manageSubscription: string;
    perMonth: string;
  };

  errors: {
    generic: string;
    network: string;
    unauthorized: string;
    invalidCredentials: string;
    rateLimited: string;
    notFound: string;
    invalidInput: string;
    slugExists: string;
    required: string;
    invalidEmail: string;
  };

  fieldBuilder: {
    title: string;
    addField: string;
    removeField: string;
    moveUp: string;
    moveDown: string;
    fieldCount: string;
    maxFieldsReached: string;
    // Types
    typeText: string;
    typeEmail: string;
    typeNumber: string;
    typeTextarea: string;
    typeSelect: string;
    // Props
    fieldName: string;
    fieldLabel: string;
    fieldRequired: string;
    fieldPlaceholder: string;
    minLength: string;
    maxLength: string;
    minValue: string;
    maxValue: string;
    // Select
    options: string;
    optionValue: string;
    optionLabel: string;
    addOption: string;
    removeOption: string;
    // Preview
    showPreview: string;
    hidePreview: string;
    previewTitle: string;
    // Validation errors
    nameRequired: string;
    nameInvalid: string;
    nameDuplicate: string;
    labelRequired: string;
    optionsRequired: string;
    optionEmpty: string;
    // Actions
    saved: string;
    saving: string;
    saveFailed: string;
  };

  onboarding: {
    title: string;
    subtitle: string;
    step1Title: string;
    step1Desc: string;
    step1Action: string;
    step2Title: string;
    step2Desc: string;
    step2Action: string;
    step3Title: string;
    step3Desc: string;
    step3Hint: string;
    completed: string;
    dismiss: string;
    stepsCompleted: string;
  };

  settings: {
    title: string;
    backlogConnection: string;
    spaceUrl: string;
    spaceUrlPlaceholder: string;
    spaceUrlHint: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    apiKeyHint: string;
    projectKey: string;
    projectKeyPlaceholder: string;
    projectKeyHint: string;
    testConnection: string;
    testing: string;
    save: string;
    saving: string;
    saved: string;
    saveFailed: string;
    testSuccess: string;
    testFailed: string;
    connected: string;
    notConnected: string;
    apiKeyNote: string;
    apiKeyStored: string;
  };

  landing: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
      ctaLogin: string;
      badge: string;
    };
    trustBar: {
      api: string;
      setup: string;
      serverSide: string;
    };
    flow: {
      form: string;
      process: string;
      ticket: string;
    };
    features: {
      title: string;
      step1: {
        title: string;
        description: string;
      };
      step2: {
        title: string;
        description: string;
      };
      step3: {
        title: string;
        description: string;
      };
    };
    usedBy: string;
    pricing: {
      title: string;
      popular: string;
      enterprise: string;
      free: {
        name: string;
        price: string;
        period: string;
        features: readonly string[];
      };
      starter: {
        name: string;
        price: string;
        period: string;
        features: readonly string[];
      };
      pro: {
        name: string;
        price: string;
        period: string;
        features: readonly string[];
      };
    };
    pain: {
      title: string;
      before: string;
      beforeSteps: readonly string[];
      after: string;
      afterSteps: readonly string[];
    };
    faq: {
      title: string;
      items: readonly { q: string; a: string }[];
    };
    finalCta: {
      title: string;
      subtitle: string;
    };
    footer: {
      copyright: string;
      terms: string;
      privacy: string;
      product: string;
      legal: string;
    };
  };
}
