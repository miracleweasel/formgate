// lib/i18n/en.ts
// English UI strings - Reference/fallback language
// Structure must match ja.ts exactly

import type { TranslationSchema } from "./types";

export const en: TranslationSchema = {
  // ==========================================================================
  // Common
  // ==========================================================================
  common: {
    appName: "FormGate",
    tagline: "Automatically create Backlog tickets from forms",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    back: "Back",
    submit: "Submit",
    create: "Create",
    edit: "Edit",
    view: "View",
    close: "Close",
    yes: "Yes",
    no: "No",
    optional: "optional",
    required: "required",
    select: "Select...",
  },

  // ==========================================================================
  // Navigation
  // ==========================================================================
  nav: {
    forms: "Forms",
    billing: "Billing",
    settings: "Settings",
    logout: "Logout",
    loggedInAs: "Logged in as:",
  },

  // ==========================================================================
  // Auth / Login
  // ==========================================================================
  auth: {
    login: "Login",
    loginTitle: "Admin Login",
    loginSubtitle: "FormGate Dashboard",
    email: "Email",
    password: "Password",
    signIn: "Sign In",
    signingIn: "Signing in...",
    logoutSuccess: "Logged out successfully",
  },

  // ==========================================================================
  // Forms
  // ==========================================================================
  forms: {
    title: "Forms",
    newForm: "New Form",
    noForms: "No forms yet.",
    noFormsHint: "Click \"New Form\" to create your first form.",
    createTitle: "Create Form",
    formName: "Form Name",
    formNamePlaceholder: "e.g., Contact Us",
    slug: "Slug",
    slugPlaceholder: "e.g., contact",
    slugHint: "Used in URL: /f/<slug>",
    description: "Description",
    descriptionPlaceholder: "Form description (optional)",
    creating: "Creating...",
    created: "Created",
    updated: "Updated",
    publicUrl: "Public URL",
    copyUrl: "Copy URL",
    copiedUrl: "Copied!",
    openPreview: "Preview",
    deleteConfirm: "Delete this form? This action cannot be undone.",
    deleting: "Deleting...",
    nameRequired: "Name is required.",
    slugRequired: "Slug is required.",
    createFailed: "Failed to create form",
  },

  // ==========================================================================
  // Submissions
  // ==========================================================================
  submissions: {
    title: "Submissions",
    recent: "Recent Submissions",
    noSubmissions: "No submissions yet.",
    noSubmissionsFiltered: "No matching submissions.",
    exportCsv: "Export CSV",
    exporting: "Exporting...",
    exportLatest: "Latest 50",
    exportAll: "All",
    filters: "Filters",
    all: "All",
    today: "Today",
    last7Days: "Last 7 days",
    last30Days: "Last 30 days",
    searchByEmail: "Search by email",
    search: "Search",
    clear: "Clear",
    loaded: "Loaded",
    moreAvailable: "More available",
    end: "End",
    range: "Range",
    loadMore: "Load more",
    goToTop: "Back to top",
  },

  // ==========================================================================
  // Public Form
  // ==========================================================================
  publicForm: {
    emailLabel: "Email",
    emailPlaceholder: "example@example.com",
    messageLabel: "Message",
    messagePlaceholder: "Enter your message here",
    submit: "Submit",
    submitting: "Submitting...",
    thankYou: "Thank you!",
    thankYouMessage: "Your message has been received.",
    poweredBy: "Powered by FormGate",
  },

  // ==========================================================================
  // Integrations
  // ==========================================================================
  integrations: {
    title: "Integrations",
    backlog: {
      title: "Backlog Integration",
      description: "Automatically create Backlog issues from form submissions.",
      configure: "Configure",
      enabled: "Enabled",
      disabled: "Disabled",
      spaceUrl: "Space URL",
      spaceUrlPlaceholder: "https://your-space.backlog.jp",
      apiKey: "API Key",
      apiKeyPlaceholder: "Enter API key",
      apiKeyHint: "Get your API key from Backlog > Personal Settings > API",
      projectKey: "Project Key",
      projectKeyPlaceholder: "e.g., PROJ",
      projectKeyOverride: "Project Key Override (optional)",
      effectiveProjectKey: "Effective Project Key",
      testConnection: "Test Connection",
      testing: "Testing...",
      testSuccess: "Connection successful",
      testFailed: "Connection failed",
      saving: "Saving...",
      saved: "Saved",
      saveFailed: "Failed to save",
      connectionSafe: "Connection Info",
      defaultProjectKey: "Default Project Key",
      formSettings: "Form Settings",
      enableForForm: "Enable for this form",
      apiKeyNote: "Note: API key is never exposed. All Backlog operations are server-side.",
      invalidResponse: "Invalid response.",
      loadFailed: "Failed to load settings.",
      connectionOk: "Connection OK",
      // Field mapping
      fieldMapping: "Field Mapping",
      fieldMappingDesc: "Map form fields to Backlog issue fields.",
      summaryMapping: "Summary (Title)",
      summaryDefault: "Default ([FormGate] Form Name)",
      summaryField: "Use field value",
      summaryTemplate: "Use template",
      summaryFieldSelect: "Select field",
      summaryTemplatePlaceholder: "e.g., Inquiry from {company}",
      descriptionMapping: "Description",
      descriptionAuto: "Auto (show all fields)",
      descriptionField: "Use field value",
      descriptionTemplate: "Use template",
      descriptionTemplatePlaceholder: "e.g., Company: {company}\nEmail: {email}\n\n{message}",
      issueType: "Issue Type",
      issueTypeDefault: "Default (use first type)",
      priority: "Priority",
      priorityDefault: "Default (Normal)",
      customFields: "Custom Fields",
      customFieldsDesc: "Map form fields to Backlog custom fields",
      addCustomField: "Add mapping",
      removeCustomField: "Remove",
      backlogField: "Backlog Field",
      formField: "Form Field",
      noCustomFields: "No custom fields found for this project.",
      loadingMeta: "Loading project info...",
      loadMetaFailed: "Failed to load project info.",
      refreshMeta: "Refresh",
    },
  },

  // ==========================================================================
  // Billing
  // ==========================================================================
  billing: {
    title: "Billing",
    currentPlan: "Current Plan",
    free: "Free",
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
    upgrade: "Upgrade",
    manage: "Manage Plan",
  },

  // ==========================================================================
  // Errors
  // ==========================================================================
  errors: {
    generic: "An error occurred",
    network: "Network error. Please check your connection.",
    unauthorized: "Authentication required. Please log in.",
    invalidCredentials: "Invalid email or password.",
    rateLimited: "Too many requests. Please wait a moment.",
    notFound: "Not found.",
    invalidInput: "Please check your input.",
    slugExists: "This slug is already in use.",
    required: "This field is required.",
    invalidEmail: "Please enter a valid email address.",
  },

  // ==========================================================================
  // Field Builder
  // ==========================================================================
  fieldBuilder: {
    title: "Field Settings",
    addField: "Add Field",
    removeField: "Remove",
    moveUp: "Move Up",
    moveDown: "Move Down",
    fieldCount: "Fields",
    maxFieldsReached: "Maximum fields (20) reached",
    // Types
    typeText: "Text",
    typeEmail: "Email",
    typeNumber: "Number",
    typeTextarea: "Textarea",
    typeSelect: "Select",
    // Props
    fieldName: "Field Name",
    fieldLabel: "Label",
    fieldRequired: "Required",
    fieldPlaceholder: "Placeholder",
    minLength: "Min Length",
    maxLength: "Max Length",
    minValue: "Min Value",
    maxValue: "Max Value",
    // Select
    options: "Options",
    optionValue: "Value",
    optionLabel: "Label",
    addOption: "Add Option",
    removeOption: "Remove",
    // Preview
    showPreview: "Show Preview",
    hidePreview: "Hide Preview",
    previewTitle: "Preview",
    // Validation errors
    nameRequired: "Field name is required",
    nameInvalid: "Field name must start with a letter and contain only letters, numbers, underscores",
    nameDuplicate: "Duplicate field name",
    labelRequired: "Label is required",
    optionsRequired: "At least one option is required",
    optionEmpty: "Option value and label are required",
    // Actions
    saved: "Saved",
    saving: "Saving...",
    saveFailed: "Failed to save",
  },

  // ==========================================================================
  // Landing Page
  // ==========================================================================
  landing: {
    hero: {
      title: "Form → Backlog Ticket, Automatically.",
      subtitle: "Setup in 5 minutes. No code required.",
      cta: "Get Started Free",
      ctaLogin: "Login",
      badge: "Official Backlog API",
    },
    features: {
      title: "Simple 3-Step Setup",
      step1: {
        title: "Create Form",
        description: "Create a form in 30 seconds from dashboard",
      },
      step2: {
        title: "Connect Backlog",
        description: "Paste your API key and you're connected",
      },
      step3: {
        title: "Auto-Ticketing",
        description: "Submissions instantly create issues",
      },
    },
    usedBy: "Trusted by",
    pricing: {
      title: "Pricing",
      free: {
        name: "Free",
        price: "$0",
        period: "/month",
        features: ["1 form", "50 submissions/month", "FormGate branding"],
      },
      starter: {
        name: "Starter",
        price: "$25",
        period: "/month",
        features: ["5 forms", "500 submissions/month", "No branding"],
      },
      pro: {
        name: "Pro",
        price: "$79",
        period: "/month",
        features: ["Unlimited forms", "5,000 submissions/month", "Priority support"],
      },
    },
    footer: {
      copyright: "© 2026 FormGate",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
    },
  },
};
