import {
  geoLanguageForAppLanguage,
  intlLocaleForAppLanguage,
} from "../i18n/languageLocale";
import { isAppPermissionEnabled } from "./appPermissions";
import { geo } from "./capacitor-bridge";

export type DetectCountryFailureReason =
  | "app_disabled"
  | "permission_denied"
  | "position_unavailable"
  | "geocode_failed";

export type DetectCountryResult =
  | { ok: true; iso: string }
  | { ok: false; reason: DetectCountryFailureReason };

const REVERSE_GEOCODE_ENDPOINTS = [
  "https://api-bdc.io/data/reverse-geocode-client",
  "https://api.bigdatacloud.net/data/reverse-geocode-client",
] as const;

/** Fallback when Intl.supportedValuesOf('region') is unavailable. */
const FALLBACK_ISO3166_ALPHA2 = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS",
  "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN",
  "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
  "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF",
  "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM",
  "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM",
  "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
  "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK",
  "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
  "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG",
  "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW",
  "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS",
  "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO",
  "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI",
  "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW",
] as const;

export function countryLabelForIso(iso: string, lang: string): string {
  if (!iso) return "";
  const code = iso.toUpperCase();
  const locale = intlLocaleForAppLanguage(lang);
  try {
    const primary =
      new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
    if (primary !== code) return primary;
    if (locale !== "en") {
      const en =
        new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
      if (en !== code) return en;
    }
    return primary;
  } catch {
    return code;
  }
}

export function normalizeCountryIso(raw: string): string {
  const c = raw.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(c) ? c : "";
}

export function allProfileCountryIsos(): string[] {
  try {
    const supported = Intl.supportedValuesOf?.("region");
    if (supported?.length) {
      return supported.filter((code) => /^[A-Z]{2}$/.test(code));
    }
  } catch {
    /* use fallback */
  }
  return [...FALLBACK_ISO3166_ALPHA2];
}

export function profileCountrySelectOptions(lang: string): {
  iso: string;
  label: string;
}[] {
  const locale = intlLocaleForAppLanguage(lang);
  return allProfileCountryIsos()
    .map((iso) => ({
      iso,
      label: countryLabelForIso(iso, lang) || iso,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
}

async function reverseGeocodeCountryIso(
  latitude: number,
  longitude: number,
  lang: string,
): Promise<string | null> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: geoLanguageForAppLanguage(lang),
  });
  const query = params.toString();

  for (const base of REVERSE_GEOCODE_ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const res = await fetch(`${base}?${query}`, {
        signal: controller.signal,
        redirect: "follow",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { countryCode?: string };
      const iso = normalizeCountryIso(data.countryCode ?? "");
      if (iso) return iso;
    } catch {
      /* try next endpoint */
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

/** IP-based country (no coordinates). Works in browser when GPS is denied or slow. */
async function reverseGeocodeCountryFromClientIp(
  lang: string,
): Promise<string | null> {
  const params = new URLSearchParams({
    localityLanguage: geoLanguageForAppLanguage(lang),
  });
  const query = params.toString();

  for (const base of REVERSE_GEOCODE_ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try {
      const res = await fetch(`${base}?${query}`, {
        signal: controller.signal,
        redirect: "follow",
      });
      if (!res.ok) continue;
      const data = (await res.json()) as { countryCode?: string };
      const iso = normalizeCountryIso(data.countryCode ?? "");
      if (iso) return iso;
    } catch {
      /* try next endpoint */
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

async function countryIsoFromIpFallback(
  lang: string,
): Promise<DetectCountryResult | null> {
  const iso = await reverseGeocodeCountryFromClientIp(lang);
  return iso ? { ok: true, iso } : null;
}

/**
 * GPS + reverse geocode → ISO country. Falls back to IP geolocation on web.
 * Call directly from a user click (single getCurrentPosition). Never throws.
 */
export async function detectCountryFromGps(
  lang = "en",
): Promise<DetectCountryResult> {
  if (!isAppPermissionEnabled("location")) {
    return { ok: false, reason: "app_disabled" };
  }

  if (typeof navigator !== "undefined" && !navigator.geolocation) {
    const fromIp = await countryIsoFromIpFallback(lang);
    return fromIp ?? { ok: false, reason: "position_unavailable" };
  }

  try {
    const pos = await geo.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 20_000,
      maximumAge: 300_000,
    });

    if (pos) {
      const iso = await reverseGeocodeCountryIso(
        pos.latitude,
        pos.longitude,
        lang,
      );
      if (iso) return { ok: true, iso };
      const fromIp = await countryIsoFromIpFallback(lang);
      return fromIp ?? { ok: false, reason: "geocode_failed" };
    }

    const perm = await geo.checkPermissions();
    if (perm === "denied") {
      const fromIp = await countryIsoFromIpFallback(lang);
      return fromIp ?? { ok: false, reason: "permission_denied" };
    }

    const fromIp = await countryIsoFromIpFallback(lang);
    return fromIp ?? { ok: false, reason: "position_unavailable" };
  } catch {
    const fromIp = await countryIsoFromIpFallback(lang);
    return fromIp ?? { ok: false, reason: "position_unavailable" };
  }
}

/** @deprecated Use detectCountryFromGps for structured errors. */
export async function detectCountryIsoFromGps(
  lang = "en",
): Promise<string | null> {
  const result = await detectCountryFromGps(lang);
  return result.ok ? result.iso : null;
}
