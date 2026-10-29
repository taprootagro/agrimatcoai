import type { HomePageConfig } from "../hooks/useHomeConfig";
import { normalizeCountryIso } from "./profileCountry";

export type CountryTargetable = { countries?: string[] };

export function normalizeCountryList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of raw) {
    const iso = normalizeCountryIso(String(entry ?? ""));
    if (!iso || seen.has(iso)) continue;
    seen.add(iso);
    out.push(iso);
  }
  return out;
}

/** Empty or missing countries = visible to all; tagged items need a matching user country. */
export function isVisibleInCountry(
  item: CountryTargetable,
  country: string,
): boolean {
  const tags = normalizeCountryList(item.countries);
  if (tags.length === 0) return true;
  const c = normalizeCountryIso(country);
  if (!c) return false;
  return tags.includes(c);
}

export function filterByCountry<T extends CountryTargetable>(
  items: T[],
  country: string,
): T[] {
  return items.filter((item) => isVisibleInCountry(item, country));
}

const CMS_TARGETABLE_KEYS = [
  "banners",
  "liveStreams",
  "articles",
] as const;

function pushCountriesFromList(
  list: CountryTargetable[] | undefined,
  acc: Set<string>,
): void {
  if (!list?.length) return;
  for (const item of list) {
    for (const iso of normalizeCountryList(item.countries)) {
      acc.add(iso);
    }
  }
}

/** Distinct ISO codes used in CMS content (for filter chips). */
export function collectTaggedCountries(cfg: HomePageConfig): string[] {
  const acc = new Set<string>();
  for (const key of CMS_TARGETABLE_KEYS) {
    pushCountriesFromList(cfg[key] as CountryTargetable[] | undefined, acc);
  }
  const mp = cfg.marketPage;
  if (mp) {
    pushCountriesFromList(mp.categories, acc);
    pushCountriesFromList(mp.products, acc);
    pushCountriesFromList(mp.advertisements, acc);
  }
  return [...acc].sort((a, b) => a.localeCompare(b));
}

export type CmsCountryFilter = "" | "__global__" | string;

/** CMS list preview: all / untagged only / specific ISO. */
export function matchesCmsCountryFilter(
  item: CountryTargetable,
  filter: CmsCountryFilter,
): boolean {
  if (!filter) return true;
  const tags = normalizeCountryList(item.countries);
  if (filter === "__global__") return tags.length === 0;
  return tags.includes(normalizeCountryIso(filter));
}

export function mergeVisibleReorder<T extends CountryTargetable & { id?: unknown }>(
  fullList: T[],
  reorderedVisible: T[],
  filter: CmsCountryFilter,
): T[] {
  if (!filter) return reorderedVisible;
  let vi = 0;
  return fullList.map((item) => {
    if (matchesCmsCountryFilter(item, filter)) {
      return reorderedVisible[vi++] ?? item;
    }
    return item;
  });
}

export function formatCountryTagsShort(
  countries: string[] | undefined,
  max = 3,
): string {
  const tags = normalizeCountryList(countries);
  if (tags.length === 0) return "";
  if (tags.length <= max) return tags.join(", ");
  return `${tags.slice(0, max).join(", ")} +${tags.length - max}`;
}
