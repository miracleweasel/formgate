// lib/i18n/index.ts
// Centralized i18n for FormGate
// MVP: Japanese only (target market)
// Future: Multi-language support ready

import { ja } from "./ja";
import { en } from "./en";
import type { TranslationSchema } from "./types";

// =============================================================================
// Supported Locales
// =============================================================================

export const SUPPORTED_LOCALES = ["ja", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "ja";

// Locale display names (in their own language)
export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  ja: "日本語",
  en: "English",
};

// =============================================================================
// Translation Dictionaries
// =============================================================================

const translations: Record<SupportedLocale, TranslationSchema> = {
  ja,
  en,
};

// =============================================================================
// Current Locale (MVP: hardcoded to Japanese)
// =============================================================================

// For MVP, we use Japanese only. This can be made dynamic later.
let currentLocale: SupportedLocale = DEFAULT_LOCALE;

/**
 * Get current locale
 */
export function getLocale(): SupportedLocale {
  return currentLocale;
}

/**
 * Set current locale (for future use)
 * @param locale - The locale to set
 */
export function setLocale(locale: SupportedLocale): void {
  if (SUPPORTED_LOCALES.includes(locale)) {
    currentLocale = locale;
  }
}

/**
 * Check if a locale is supported
 */
export function isValidLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

// =============================================================================
// Translation Access
// =============================================================================

/**
 * Get translations for a specific locale
 * Falls back to default locale if not found
 */
export function getTranslations(locale?: SupportedLocale): TranslationSchema {
  const targetLocale = locale ?? currentLocale;
  return translations[targetLocale] ?? translations[DEFAULT_LOCALE];
}

/**
 * Current translation dictionary (shorthand for components)
 * MVP: Always returns Japanese translations
 */
export const t = translations[currentLocale];

// Type exports for type-safe access
export type { TranslationSchema };
// Alias for backward compatibility
export type TranslationKeys = TranslationSchema;

// =============================================================================
// Locale Detection (for future use)
// =============================================================================

/**
 * Parse Accept-Language header and return best matching locale
 * @param acceptLanguage - The Accept-Language header value
 * @returns Best matching supported locale
 */
export function detectLocaleFromHeader(acceptLanguage: string | null): SupportedLocale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  // Parse Accept-Language: "ja,en-US;q=0.9,en;q=0.8"
  const languages = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      return {
        code: code.split("-")[0].toLowerCase(), // "en-US" -> "en"
        q: qValue ? parseFloat(qValue) : 1.0,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { code } of languages) {
    if (isValidLocale(code)) {
      return code;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Get locale from cookie value
 * @param cookieValue - The locale cookie value
 * @returns Valid locale or default
 */
export function getLocaleFromCookie(cookieValue: string | null): SupportedLocale {
  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }
  return DEFAULT_LOCALE;
}

// =============================================================================
// Formatting Helpers
// =============================================================================

/**
 * Format a template string with values
 * @param template - Template with {key} placeholders
 * @param values - Values to substitute
 * @returns Formatted string
 *
 * @example
 * format("Hello, {name}!", { name: "World" }) // "Hello, World!"
 */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? `{${key}}`));
}

/**
 * Get locale-specific date formatter
 * @param locale - Target locale
 * @returns Intl.DateTimeFormat instance
 */
export function getDateFormatter(
  locale?: SupportedLocale,
  options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  const targetLocale = locale ?? currentLocale;
  const localeString = targetLocale === "ja" ? "ja-JP" : "en-US";
  return new Intl.DateTimeFormat(localeString, options);
}

/**
 * Get locale-specific number formatter
 * @param locale - Target locale
 * @returns Intl.NumberFormat instance
 */
export function getNumberFormatter(
  locale?: SupportedLocale,
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
  const targetLocale = locale ?? currentLocale;
  const localeString = targetLocale === "ja" ? "ja-JP" : "en-US";
  return new Intl.NumberFormat(localeString, options);
}

/**
 * Format currency for the current locale
 * @param amount - Amount in smallest unit (e.g., cents/yen)
 * @param currency - Currency code (default: JPY for ja, USD for en)
 */
export function formatCurrency(
  amount: number,
  currency?: string,
  locale?: SupportedLocale
): string {
  const targetLocale = locale ?? currentLocale;
  const defaultCurrency = targetLocale === "ja" ? "JPY" : "USD";
  const curr = currency ?? defaultCurrency;

  // JPY has no decimal places
  const divisor = curr === "JPY" ? 1 : 100;

  return getNumberFormatter(targetLocale, {
    style: "currency",
    currency: curr,
  }).format(amount / divisor);
}

// =============================================================================
// Cookie Name for Locale Preference
// =============================================================================

export const LOCALE_COOKIE_NAME = "fg_locale";
