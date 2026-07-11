"use client";

import PhoneInput from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import { DEFAULT_PHONE_COUNTRY_ISO } from "@/lib/phoneCountryCodes";

export default function PhoneNumberField({
  id = "mobile",
  label = "Phone number",
  required = false,
  hint = "",
  country = DEFAULT_PHONE_COUNTRY_ISO,
  onCountryChange,
  value,
  onChange,
  placeholder = "Enter phone number",
  national = false,
  compact = false,
  auth = false,
  className = "",
}) {
  const variantClass = [
    national ? "ds-phone-input--national" : "",
    compact ? "ds-phone-input--compact" : "",
    auth ? "ds-phone-input--auth" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-bold text-foreground">
        {label} {required ? <span className="text-brand">*</span> : null}
      </label>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      <div className={`ds-phone-input mt-1.5 ${variantClass}`}>
        <PhoneInput
          id={id}
          international={!national}
          countryCallingCodeEditable={false}
          defaultCountry={DEFAULT_PHONE_COUNTRY_ISO}
          country={country}
          onCountryChange={onCountryChange}
          labels={en}
          placeholder={placeholder}
          value={value || undefined}
          onChange={(next) => onChange?.(next || "")}
          numberInputProps={{
            id,
            name: id,
            required,
            autoComplete: "tel-national",
          }}
        />
      </div>
    </div>
  );
}
