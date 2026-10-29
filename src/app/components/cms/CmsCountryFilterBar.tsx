import type { CmsCountryFilter } from "../../utils/countryTargeting";
import { countryLabelForIso } from "../../utils/profileCountry";

export type CmsCountryFilterBarProps = {
  filter: CmsCountryFilter;
  onChange: (filter: CmsCountryFilter) => void;
  taggedCountries: string[];
  language: string;
  labels: {
    all: string;
    globalOnly: string;
  };
};

export function CmsCountryFilterBar({
  filter,
  onChange,
  taggedCountries,
  language,
  labels,
}: CmsCountryFilterBarProps) {
  const chipClass = (active: boolean) =>
    `text-xs px-2.5 py-1 rounded-full border transition-colors ${
      active
        ? "bg-emerald-600 text-white border-emerald-600"
        : "bg-white text-gray-600 border-gray-200 hover:border-emerald-300"
    }`;

  return (
    <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-gray-100">
      <button type="button" className={chipClass(!filter)} onClick={() => onChange("")}>
        {labels.all}
      </button>
      <button
        type="button"
        className={chipClass(filter === "__global__")}
        onClick={() => onChange("__global__")}
      >
        {labels.globalOnly}
      </button>
      {taggedCountries.map((iso) => (
        <button
          key={iso}
          type="button"
          className={chipClass(filter === iso)}
          onClick={() => onChange(iso)}
        >
          {countryLabelForIso(iso, language)} ({iso})
        </button>
      ))}
    </div>
  );
}

export function CmsCountryBadge({
  countries,
  language,
  allLabel,
}: {
  countries?: string[];
  language: string;
  allLabel: string;
}) {
  const list = countries?.filter(Boolean) ?? [];
  if (list.length === 0) {
    return (
      <span className="text-[10px] uppercase tracking-wide text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
        {allLabel}
      </span>
    );
  }
  const text = list
    .slice(0, 3)
    .map((iso) => iso.toUpperCase())
    .join(", ");
  const extra = list.length > 3 ? ` +${list.length - 3}` : "";
  return (
    <span
      className="text-[10px] uppercase tracking-wide text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded"
      title={list.join(", ")}
    >
      {text}
      {extra}
    </span>
  );
}
