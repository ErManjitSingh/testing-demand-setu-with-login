import { getCategoryLabel } from "@/lib/listings";
import { parseDateParam, toDateParam } from "@/lib/dates";
import { toLocationSlug } from "@/lib/listingsSlug";

function formatDateForLog(date) {
  if (!date) return null;
  if (typeof date === "string") {
    const parsed = parseDateParam(date.trim());
    return parsed ? toDateParam(parsed) : date.trim() || null;
  }
  if (date instanceof Date && !Number.isNaN(date.getTime())) {
    return toDateParam(date);
  }
  return null;
}

/** Derive city vs state from trip fields and explicit user selection kind. */
export function inferLocationType(trip = {}) {
  const explicit = trip.locationKind || trip.kind;
  if (explicit === "state" || explicit === "city") return explicit;

  const city = String(trip.city || "").trim();
  const state = String(trip.state || "").trim();

  if (state && !city) return "state";
  if (city && !state) return "city";
  if (state && city && toLocationSlug(city) === toLocationSlug(state)) return "state";
  if (state && city) return "city";
  return null;
}

/**
 * Console-log search selection: category, city/state, dates, guests.
 * @param {string} source - e.g. "home-search", "state-click", "listings-page-search"
 * @param {object} trip - { category, city, state, kind|locationKind, checkIn, checkOut, guests }
 */
export function logSearchSelection(source, trip = {}) {
  if (typeof window === "undefined") return;

  const category = trip.category ?? "all";
  const city = String(trip.city || "").trim();
  const state = String(trip.state || "").trim();
  const locationType = inferLocationType(trip);

  const payload = {
    source,
    category,
    categoryLabel: getCategoryLabel(category),
    locationType,
    city: locationType === "state" ? null : city || null,
    state: locationType === "city" ? null : state || null,
    selectedAs: locationType,
    location: locationType === "state" ? state || city : city || state || null,
    checkIn: formatDateForLog(trip.checkIn),
    checkOut: formatDateForLog(trip.checkOut),
    guests: trip.guests ?? null,
  };

  console.log("[Demand Setu — Search Selection]", payload);
}
