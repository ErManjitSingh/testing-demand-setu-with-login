import { STATIC_POPULAR_CITIES } from "@/lib/tourDestinations";
import { PACKAGE_THEMES, THEME_BY_ID } from "@/lib/tourPackageMeta";
import { API_THEME_TO_ID } from "@/lib/tourPackagesApi";

/** URL segment for /tour-packages/{slug}. */
export function slugifyTourSegment(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const STATE_ALIASES = {
  himachal: "Himachal Pradesh",
  "jammu-kashmir": "Jammu & Kashmir",
  "jammu-and-kashmir": "Jammu & Kashmir",
  "sri-lanka": "Sri Lanka",
};

const KNOWN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Dubai",
  "Bali",
  "Nepal",
  "Bhutan",
  "Maldives",
  "Singapore",
  "Malaysia",
  "Thailand",
  "Sri Lanka",
];

const STATE_BY_SLUG = new Map();
for (const name of KNOWN_STATES) {
  const slug = slugifyTourSegment(name);
  if (slug && !STATE_BY_SLUG.has(slug)) STATE_BY_SLUG.set(slug, name);
}
for (const [alias, name] of Object.entries(STATE_ALIASES)) {
  STATE_BY_SLUG.set(alias, name);
}

const CITY_BY_SLUG = new Map();
for (const name of STATIC_POPULAR_CITIES) {
  const slug = slugifyTourSegment(name);
  if (slug && !CITY_BY_SLUG.has(slug)) CITY_BY_SLUG.set(slug, name);
}
// Extra cities commonly linked from home / places
for (const name of [
  "Dwarka",
  "Somnath",
  "Mount Abu",
  "Kasol",
  "McLeod Ganj",
  "Bir Billing",
  "Spiti",
  "Leh",
  "Pangong",
  "Alleppey",
  "Kochi",
  "Hampi",
  "Agra",
  "Varanasi",
  "Rishikesh",
  "Haridwar",
  "Amritsar",
  "Jaisalmer",
  "Pushkar",
  "Ajmer",
]) {
  const slug = slugifyTourSegment(name);
  if (slug && !CITY_BY_SLUG.has(slug)) CITY_BY_SLUG.set(slug, name);
}

/**
 * Resolve `/tour-packages/[slug]` → theme | state | place.
 * Priority: theme id → known state → known city → title-cased place.
 */
export function resolveTourPackageSlug(slug) {
  const raw = slugifyTourSegment(slug);
  if (!raw) return null;

  if (THEME_BY_ID[raw]) {
    return { type: "theme", id: raw, label: THEME_BY_ID[raw].label, slug: raw };
  }

  const themeFromApi = API_THEME_TO_ID[raw];
  if (themeFromApi && THEME_BY_ID[themeFromApi]) {
    return {
      type: "theme",
      id: themeFromApi,
      label: THEME_BY_ID[themeFromApi].label,
      slug: themeFromApi,
    };
  }

  const state = STATE_BY_SLUG.get(raw);
  if (state) {
    return { type: "state", name: state, label: state, slug: slugifyTourSegment(state) };
  }

  const city = CITY_BY_SLUG.get(raw);
  if (city) {
    return { type: "place", name: city, label: city, slug: slugifyTourSegment(city) };
  }

  const place = titleFromSlug(raw);
  return { type: "place", name: place, label: place, slug: raw };
}

export function buildTourPackagesPath({ theme = "", state = "", place = "" } = {}) {
  if (theme) return `/tour-packages/${slugifyTourSegment(theme)}`;
  if (state) return `/tour-packages/${slugifyTourSegment(state)}`;
  if (place) return `/tour-packages/${slugifyTourSegment(place)}`;
  return "/packages";
}

export function tourPackageFiltersFromResolved(resolved) {
  if (!resolved) return { themes: [], q: "", place: "" };
  if (resolved.type === "theme") return { themes: [resolved.id], q: "", place: "" };
  if (resolved.type === "state") return { themes: [], q: resolved.name, place: "" };
  return { themes: [], q: resolved.name, place: resolved.name };
}

export function stripKeysForTourRoute(resolved) {
  if (!resolved) return [];
  if (resolved.type === "theme") return ["themes"];
  if (resolved.type === "state") return ["q", "place"];
  return ["place", "q"];
}

export const TOUR_PACKAGE_THEME_SLUGS = PACKAGE_THEMES.map((t) => t.id);
