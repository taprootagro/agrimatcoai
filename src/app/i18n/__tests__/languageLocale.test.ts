import { describe, expect, it } from "vitest";
import {
  APP_LANGUAGE_GEO_LANGUAGE,
  APP_LANGUAGE_INTL_LOCALE,
  intlLocaleForAppLanguage,
} from "../languageLocale";
import { countryLabelForIso } from "../../utils/profileCountry";

const ALL_LANGUAGES = Object.keys(APP_LANGUAGE_INTL_LOCALE);

describe("languageLocale", () => {
  it("maps all 20 PWA languages", () => {
    expect(ALL_LANGUAGES).toHaveLength(20);
    for (const lang of ALL_LANGUAGES) {
      expect(intlLocaleForAppLanguage(lang)).toBeTruthy();
      expect(APP_LANGUAGE_GEO_LANGUAGE[lang as keyof typeof APP_LANGUAGE_GEO_LANGUAGE]).toBeTruthy();
    }
  });

  it("localizes country names per app language", () => {
    expect(countryLabelForIso("JP", "ja")).toMatch(/日本/);
    expect(countryLabelForIso("TW", "zh-TW")).toMatch(/台灣|台湾/);
    expect(countryLabelForIso("BO", "es")).toMatch(/Bolivia/i);
  });
});
