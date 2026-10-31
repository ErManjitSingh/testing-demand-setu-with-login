/**
 * Pure helpers for the /places section (safe on server and client).
 * Nothing here talks to the network.
 */

export const PLACES_BASE = "/places";
export const PLACES_COUNTRY = { slug: "india", name: "India" };

export function slugify(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function cleanText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titleCase(value) {
  const text = cleanText(value);
  // Only re-case names that are all lower / all upper ("kangra", "MANALI"); keep "McleodGanj" etc.
  if (text !== text.toLowerCase() && text !== text.toUpperCase()) return text;
  return text.replace(/(^|[\s\-/(])([a-z])/gi, (_, sep, ch) => sep + ch.toUpperCase()).replace(/\B[A-Z]+/g, (m) => m.toLowerCase());
}

export function truncate(text, max = 160) {
  const t = cleanText(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : cut.length).replace(/[\s,.;:–-]+$/, "")}…`;
}

/** Public state URLs read "places-to-visit-in-bihar" (the internal key stays "bihar"). */
export const STATE_SEGMENT_PREFIX = "places-to-visit-in-";

export function stateSegment(stateSlug) {
  return `${STATE_SEGMENT_PREFIX}${stateSlug}`;
}

/** Turns a URL segment back into the internal state slug; `canonical` is false for legacy un-prefixed URLs. */
export function parseStateSegment(segment) {
  const value = String(segment ?? "");
  const canonical = value.startsWith(STATE_SEGMENT_PREFIX);
  return { slug: canonical ? value.slice(STATE_SEGMENT_PREFIX.length) : value, canonical };
}

export const placesHref = {
  all: () => PLACES_BASE,
  country: () => `${PLACES_BASE}/${PLACES_COUNTRY.slug}`,
  state: (state) => `${PLACES_BASE}/${PLACES_COUNTRY.slug}/${stateSegment(state)}`,
  city: (state, city) => `${PLACES_BASE}/${PLACES_COUNTRY.slug}/${stateSegment(state)}/${city}`,
  place: (state, city, place) => `${PLACES_BASE}/${PLACES_COUNTRY.slug}/${stateSegment(state)}/${city}/${place}`,
};

/* ------------------------------ place types ------------------------------ */

// Order matters: the first matching rule wins.
export const PLACE_TYPES = [
  { id: "passes", label: "Passes & tunnels", re: /\bpass\b|\bla\b|tunnel|\bghat\b/i },
  { id: "waterfalls", label: "Waterfalls", re: /\bfalls?\b|waterfall|jharna/i },
  { id: "lakes", label: "Lakes", re: /\blake\b|\btal\b|talab|\bsar\b|reservoir|\bdam\b/i },
  { id: "treks", label: "Treks & peaks", re: /trek|bugyal|base camp|trail|\bpeak\b|\btop\b|triund/i },
  {
    id: "spiritual",
    label: "Temples & spiritual",
    re: /temple|mandir|gurudwara|gurdwara|\bdevi\b|\bmata\b|church|monaster|gompa|masjid|mosque|shrine|\bdham\b|ashram|mahadev|\bbaba\b|manikaran|\bbaths?\b|cathedral/i,
  },
  {
    id: "nature",
    label: "Nature & views",
    re: /valley|forest|park|garden|sanctuary|wildlife|\bzoo\b|van vihar|meadow|beach|river|rafting|view ?point|\bpoint\b|\bvan\b|\bghati\b|tea /i,
  },
  {
    id: "heritage",
    label: "Heritage & culture",
    re: /fort|castle|palace|museum|haveli|monument|bridge|memorial|heritage|village|\bgaon\b|artists/i,
  },
  { id: "leisure", label: "Markets & leisure", re: /market|\broad\b|\bmall\b|chowk|bazaar|club|cafe|\bscandal\b|ridge/i },
];
export const DEFAULT_PLACE_TYPE = { id: "sightseeing", label: "Sightseeing" };
export const PLACE_TYPE_BY_ID = Object.fromEntries([...PLACE_TYPES, DEFAULT_PLACE_TYPE].map((t) => [t.id, t]));

export function detectPlaceType(name) {
  const text = cleanText(name);
  return PLACE_TYPES.find((t) => t.re.test(text))?.id ?? DEFAULT_PLACE_TYPE.id;
}

/* ----------------------------- travel + price ----------------------------- */

/**
 * The API's `time` field mixes minutes (17, 38, 56) with hours written as h.mm (1.15, 2.38, 6.3).
 * Use the distance to tell them apart and return minutes, or null if it is not trustworthy.
 */
export function travelMinutes(time, distanceKm) {
  const t = Number(time);
  const km = Number(distanceKm);
  if (!(t > 0) || !(km > 0)) return null;

  const asMinutes = t >= 10 || km / (t / 60) <= 70;
  if (asMinutes) return Math.round(t);

  const hours = Math.floor(t);
  const frac = Math.round((t - hours) * 100);
  const minutes = frac < 60 ? frac : Math.round((t - hours) * 60);
  return hours * 60 + minutes;
}

export function formatDuration(minutes) {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function formatKm(km) {
  const n = Number(km);
  if (!(n > 0)) return "";
  return `${n % 1 === 0 ? n : n.toFixed(1)} km`;
}

export function formatRupees(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

export const CAB_LABELS = [
  { key: "Hatchback", label: "Hatchback" },
  { key: "Sedan", label: "Sedan" },
  { key: "SUV", label: "SUV" },
  { key: "Traveller", label: "Tempo Traveller" },
];

export function cabFares(cost) {
  return CAB_LABELS.map(({ key, label }) => ({ key, label, amount: Number(cost?.[key]) || 0 })).filter((f) => f.amount > 0);
}

/* ------------------------------ derived copy ------------------------------ */

export function distanceBucket(km) {
  const n = Number(km);
  if (!(n > 0)) return "unknown";
  return n <= 15 ? "near" : "far";
}

/** One factual sentence built only from API fields — used for meta descriptions and fallbacks. */
export function placeSummary(place) {
  const bits = [];
  const km = formatKm(place.distanceKm);
  if (km) bits.push(`about ${km} from ${place.city}`);
  const dur = formatDuration(place.minutes);
  if (dur) bits.push(`roughly ${dur} by road`);
  const where = `${place.city}, ${place.stateName}`;
  return bits.length ? `${place.name} in ${where} is ${bits.join(", ")}.` : `${place.name} is a place to visit in ${where}.`;
}

/** Pages with almost no unique text stay out of the index (and sitemap) until the data is richer. */
export function isThinPlace(place) {
  return cleanText(place.description).length < 40;
}
