/** Shared traveller helpers for the packages listing, product page and enquiry forms. */

export const TRAVELLER_LIMITS = {
  adults: { min: 1, max: 20 },
  children: { min: 0, max: 8 },
  infants: { min: 0, max: 4 },
};

export const CHILD_AGE_MIN = 2;
export const CHILD_AGE_MAX = 11;
export const DEFAULT_CHILD_AGE = 8;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function parseCount(value, fallback, { min, max }) {
  const n = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return clamp(n, min, max);
}

/** One room per two adults; children share with parents. */
export function getRoomsNeeded(adults = 2) {
  return Math.max(1, Math.ceil(adults / 2));
}

/** Keep childAges the same length as the number of children. */
export function syncChildAges(childAges = [], children = 0) {
  const next = childAges.slice(0, children);
  while (next.length < children) next.push(DEFAULT_CHILD_AGE);
  return next;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** e.g. "2 Adults · 1 Child · 1 Infant" */
export function formatTravellerSummary({ adults = 2, children = 0, infants = 0 } = {}) {
  const parts = [pluralize(adults, "Adult")];
  if (children > 0) parts.push(pluralize(children, "Child", "Children"));
  if (infants > 0) parts.push(pluralize(infants, "Infant"));
  return parts.join(" · ");
}

export function totalTravellers({ adults = 2, children = 0, infants = 0 } = {}) {
  return adults + children + infants;
}

/**
 * Long-form trip description appended to the CRM tour type so the sales desk sees
 * children, ages, room count and hotel grade without needing new CRM fields.
 */
export function buildTripNotes({
  adults = 2,
  children = 0,
  infants = 0,
  childAges = [],
  rooms,
  hotelCategory,
  departureCity,
} = {}) {
  const notes = [formatTravellerSummary({ adults, children, infants })];
  if (children > 0 && childAges.length) notes.push(`Child ages: ${childAges.join(", ")}`);
  if (rooms) notes.push(pluralize(rooms, "room"));
  if (hotelCategory) notes.push(`${hotelCategory} hotels`);
  if (departureCity) notes.push(`Ex ${departureCity}`);
  return notes.join(" | ");
}

export function toDateInputValue(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayInputValue() {
  return toDateInputValue(new Date());
}

export function formatDisplayDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", options);
}
