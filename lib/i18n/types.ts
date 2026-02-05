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
    password: string;
    signIn: string;
    signingIn: string;
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

  landing: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
      ctaLogin: string;
      badge: string;
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
    footer: {
      copyright: string;
      terms: string;
      privacy: string;
    };
  };
}
