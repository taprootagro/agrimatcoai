import { describe, expect, it } from "vitest";
import {
  collectTaggedCountries,
  filterByCountry,
  isVisibleInCountry,
  matchesCmsCountryFilter,
  normalizeCountryList,
} from "../countryTargeting";
import type { HomePageConfig } from "../../hooks/useHomeConfig";

describe("countryTargeting", () => {
  it("normalizes country lists", () => {
    expect(normalizeCountryList([" cn ", "CN", "US", "USA"])).toEqual([
      "CN",
      "US",
    ]);
  });

  it("treats empty tags as global", () => {
    expect(isVisibleInCountry({}, "")).toBe(true);
    expect(isVisibleInCountry({ countries: [] }, "")).toBe(true);
    expect(isVisibleInCountry({ countries: ["BO"] }, "")).toBe(false);
  });

  it("filters by user country", () => {
    const items = [
      { id: 1, countries: ["BO"] },
      { id: 2 },
      { id: 3, countries: ["CN"] },
    ];
    expect(filterByCountry(items, "BO").map((x) => x.id)).toEqual([1, 2]);
    expect(filterByCountry(items, "CN").map((x) => x.id)).toEqual([2, 3]);
    expect(filterByCountry(items, "").map((x) => x.id)).toEqual([2]);
  });

  it("collects tagged countries from config", () => {
    const cfg = {
      banners: [{ id: 1, url: "", alt: "", countries: ["PE"] }],
      marketPage: {
        categories: [],
        products: [{ id: 1, name: "x", image: "", price: "", category: "", subCategory: "", countries: ["BO"] }],
        advertisements: [],
      },
    } as unknown as HomePageConfig;
    expect(collectTaggedCountries(cfg)).toEqual(["BO", "PE"]);
  });

  it("matches CMS filter modes", () => {
    const tagged = { countries: ["BO"] };
    const global = {};
    expect(matchesCmsCountryFilter(global, "__global__")).toBe(true);
    expect(matchesCmsCountryFilter(tagged, "__global__")).toBe(false);
    expect(matchesCmsCountryFilter(tagged, "BO")).toBe(true);
    expect(matchesCmsCountryFilter(tagged, "CN")).toBe(false);
  });
});
