import { describe, expect, it } from "vitest";
import {
  allProfileCountryIsos,
  countryLabelForIso,
  normalizeCountryIso,
  profileCountrySelectOptions,
} from "../profileCountry";

describe("profileCountry", () => {
  it("includes a comprehensive ISO country list", () => {
    expect(allProfileCountryIsos().length).toBeGreaterThan(200);
    expect(allProfileCountryIsos()).toContain("CN");
    expect(allProfileCountryIsos()).toContain("BO");
  });

  it("normalizes country codes", () => {
    expect(normalizeCountryIso(" cn ")).toBe("CN");
    expect(normalizeCountryIso("USA")).toBe("");
  });

  it("localizes country labels", () => {
    expect(countryLabelForIso("CN", "zh")).toContain("中国");
    expect(countryLabelForIso("US", "ar").length).toBeGreaterThan(2);
    expect(profileCountrySelectOptions("en").some((o) => o.iso === "DE")).toBe(
      true,
    );
    expect(profileCountrySelectOptions("ja")[0]?.label.length).toBeGreaterThan(
      0,
    );
  });
});
