import { X } from "lucide-react";
import {
  countryLabelForIso,
  profileCountrySelectOptions,
} from "../../utils/profileCountry";
import {
  normalizeCountryList,
  type CountryTargetable,
} from "../../utils/countryTargeting";

export type CountryTargetFieldProps = {
  value: string[] | undefined;
  onChange: (countries: string[] | undefined) => void;
  language: string;
  suggestedCountries?: string[];
  label: string;
  hint: string;
  addLabel: string;
  allCountriesLabel: string;
};

export function CountryTargetField({
  value,
  onChange,
  language,
  suggestedCountries = [],
  label,
  hint,
  addLabel,
  allCountriesLabel,
}: CountryTargetFieldProps) {
  const selected = normalizeCountryList(value);
  const allOptions = profileCountrySelectOptions(language);
  const remaining = allOptions.filter((o) => !selected.includes(o.iso));

  const remove = (iso: string) => {
    const next = selected.filter((c) => c !== iso);
    onChange(next.length ? next : undefined);
  };

  const add = (iso: string) => {
    if (!iso || selected.includes(iso)) return;
    onChange([...selected, iso]);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <p className="text-xs text-gray-500 mb-2">{hint}</p>
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {selected.length === 0 ? (
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
            {allCountriesLabel}
          </span>
        ) : (
          selected.map((iso) => (
            <span
              key={iso}
              className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full border border-gray-200"
            >
              {countryLabelForIso(iso, language)} ({iso})
              <button
                type="button"
                onClick={() => remove(iso)}
                className="p-0.5 rounded hover:bg-gray-200"
                aria-label={`Remove ${iso}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>
      {suggestedCountries.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestedCountries
            .filter((iso) => !selected.includes(iso))
            .map((iso) => (
              <button
                key={iso}
                type="button"
                onClick={() => add(iso)}
                className="text-[11px] px-2 py-0.5 rounded-full border border-dashed border-gray-300 text-gray-600 hover:border-emerald-400 hover:text-emerald-700"
              >
                + {countryLabelForIso(iso, language)}
              </button>
            ))}
        </div>
      )}
      <select
        value=""
        onChange={(e) => {
          add(e.target.value);
          e.target.value = "";
        }}
        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label={addLabel}
      >
        <option value="">{addLabel}</option>
        {remaining.map((o) => (
          <option key={o.iso} value={o.iso}>
            {o.label} ({o.iso})
          </option>
        ))}
      </select>
    </div>
  );
}

export function patchItemCountries(
  item: Record<string, unknown>,
  countries: string[] | undefined,
): Record<string, unknown> {
  const next = { ...item } as CountryTargetable & Record<string, unknown>;
  const list = normalizeCountryList(countries);
  if (list.length === 0) {
    delete next.countries;
  } else {
    next.countries = list;
  }
  return next;
}
