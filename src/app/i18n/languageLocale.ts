import type { Language } from "../hooks/useLanguage";

/**
 * BCP 47 locales for Intl.DisplayNames / localeCompare — one entry per PWA language.
 */
export const APP_LANGUAGE_INTL_LOCALE: Record<Language, string> = {
  en: "en",
  zh: "zh-CN",
  "zh-TW": "zh-TW",
  es: "es",
  fr: "fr",
  ar: "ar",
  pt: "pt",
  hi: "hi",
  ru: "ru",
  bn: "bn",
  ur: "ur",
  id: "id",
  vi: "vi",
  ms: "ms",
  ja: "ja",
  th: "th",
  my: "my",
  tl: "fil",
  tr: "tr",
  fa: "fa",
};

/** ISO 639-1 for BigDataCloud reverse-geocode `localityLanguage` (countryCode unaffected). */
export const APP_LANGUAGE_GEO_LANGUAGE: Record<Language, string> = {
  en: "en",
  zh: "zh",
  "zh-TW": "zh",
  es: "es",
  fr: "fr",
  ar: "ar",
  pt: "pt",
  hi: "hi",
  ru: "ru",
  bn: "bn",
  ur: "ur",
  id: "id",
  vi: "vi",
  ms: "ms",
  ja: "ja",
  th: "th",
  my: "my",
  tl: "en",
  tr: "tr",
  fa: "fa",
};

export function intlLocaleForAppLanguage(lang: string): string {
  const key = lang as Language;
  if (key in APP_LANGUAGE_INTL_LOCALE) {
    return APP_LANGUAGE_INTL_LOCALE[key];
  }
  return lang;
}

export function geoLanguageForAppLanguage(lang: string): string {
  const key = lang as Language;
  if (key in APP_LANGUAGE_GEO_LANGUAGE) {
    return APP_LANGUAGE_GEO_LANGUAGE[key];
  }
  return "en";
}
