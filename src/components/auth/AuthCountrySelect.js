import { PHONE_COUNTRY_CODES } from "@/lib/phoneCountryCodes";

const POPULAR_COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "Singapore",
  "Australia",
];

const countryNames = PHONE_COUNTRY_CODES.map((entry) => entry.name);
const popularSet = new Set(POPULAR_COUNTRIES);
const otherCountries = countryNames.filter((name) => !popularSet.has(name));

export default function AuthCountrySelect({
  id = "country",
  value,
  onChange,
  required = true,
  compact = false,
}) {
  return (
    <div>
      <label htmlFor={id} className="auth-label">
        Country {required ? <span className="text-brand">*</span> : null}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`auth-input mt-1 ${compact ? "auth-select-compact" : ""}`}
      >
        {POPULAR_COUNTRIES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
        <optgroup label="More">
          {otherCountries.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
