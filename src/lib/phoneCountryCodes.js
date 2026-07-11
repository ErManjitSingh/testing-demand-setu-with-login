import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import { COUNTRY_NAMES_EN } from "@/lib/countryNamesEn";

export const DEFAULT_PHONE_COUNTRY_ISO = "IN";

function getCountryName(iso) {
  if (!iso) return "";
  return COUNTRY_NAMES_EN[iso] || iso;
}

/** All countries + dial codes from libphonenumber-js. */
export const PHONE_COUNTRY_CODES = getCountries()
  .map((iso) => ({
    iso,
    name: getCountryName(iso),
    dial: `+${getCountryCallingCode(iso)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

const CHECKOUT_COUNTRY_ALIASES = {
  uae: "AE",
  uk: "GB",
  usa: "US",
  "falkland islands (islas malvinas)": "FK",
};

export function phoneToDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function getPhoneCountryByIso(iso) {
  const code = String(iso || DEFAULT_PHONE_COUNTRY_ISO).toUpperCase();
  const resolved = getCountries().includes(code) ? code : DEFAULT_PHONE_COUNTRY_ISO;
  return {
    iso: resolved,
    name: getCountryName(resolved),
    dial: `+${getCountryCallingCode(resolved)}`,
  };
}

/** E.164 string e.g. +919876543210 */
export function formatFullPhone(dialCode, localNumber) {
  const raw = String(localNumber || "").trim();
  if (raw.startsWith("+")) return raw;

  const dialDigits = phoneToDigits(dialCode);
  const localDigits = phoneToDigits(localNumber);
  if (!localDigits) return "";
  if (!dialDigits) return localDigits;
  return `+${dialDigits}${localDigits}`;
}

export function normalizePhoneValue(value, defaultCountry = DEFAULT_PHONE_COUNTRY_ISO) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const parsed =
    parsePhoneNumberFromString(raw) ||
    parsePhoneNumberFromString(raw, defaultCountry);

  return parsed?.number || (raw.startsWith("+") ? raw : "");
}

export function getPhoneCountryCode(value) {
  const parsed = parsePhoneNumberFromString(String(value || ""));
  if (!parsed) return "";
  return `+${parsed.countryCallingCode}`;
}

/** Split stored mobile into ISO, dial code, local part, and E.164. */
export function parseStoredPhone(stored, defaultIso = DEFAULT_PHONE_COUNTRY_ISO) {
  const raw = String(stored || "").trim();
  if (!raw) {
    const fallback = getPhoneCountryByIso(defaultIso);
    return {
      iso: fallback.iso,
      dial: fallback.dial,
      local: "",
      e164: "",
    };
  }

  const parsed =
    parsePhoneNumberFromString(raw) ||
    parsePhoneNumberFromString(raw, defaultIso);

  if (parsed) {
    return {
      iso: parsed.country || defaultIso,
      dial: `+${parsed.countryCallingCode}`,
      local: parsed.nationalNumber,
      e164: parsed.number,
    };
  }

  const fallback = getPhoneCountryByIso(defaultIso);
  const digits = phoneToDigits(raw);
  if (digits.length === 10 && defaultIso === "IN") {
    return {
      iso: fallback.iso,
      dial: fallback.dial,
      local: digits,
      e164: formatFullPhone(fallback.dial, digits),
    };
  }

  return {
    iso: fallback.iso,
    dial: fallback.dial,
    local: digits,
    e164: digits ? formatFullPhone(fallback.dial, digits) : "",
  };
}

export function phoneIsoForCountryName(countryName) {
  const normalized = String(countryName || "").trim().toLowerCase();
  if (!normalized) return DEFAULT_PHONE_COUNTRY_ISO;

  const alias = CHECKOUT_COUNTRY_ALIASES[normalized];
  if (alias) return alias;

  const match = PHONE_COUNTRY_CODES.find(
    (entry) => entry.name.toLowerCase() === normalized
  );
  return match?.iso || DEFAULT_PHONE_COUNTRY_ISO;
}
