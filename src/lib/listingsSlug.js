/** Listings + property slug paths. */

export const SEGMENT_TO_CATEGORY = {
  explore: "all",
  stays: "all",
  hotel: "hotel",
  hotels: "hotel",
  airbnb: "airbnb",
  homestay: "homestay",
  villa: "homestay",
  villas: "homestay",
};

export const CATEGORY_TO_SEGMENT = {
  all: "explore",
  hotel: "hotels",
  airbnb: "airbnb",
  homestay: "villas",
};

const LISTINGS_PATH_RE =
  /^\/(explore|stays|hotels|hotel|airbnb|homestay|villa|villas)(?:\/([^/]+))?$/;

export function toLocationSlug(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function fromLocationSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function isListingsSlugSegment(segment) {
  return Object.hasOwn(SEGMENT_TO_CATEGORY, String(segment || "").toLowerCase());
}

export function isListingsSlugPath(pathname) {
  return LISTINGS_PATH_RE.test(String(pathname || "").split("?")[0]);
}

export function parseListingsSlugPath(pathname) {
  const path = String(pathname || "").split("?")[0];
  const match = path.match(LISTINGS_PATH_RE);
  if (!match) return null;

  return {
    category: SEGMENT_TO_CATEGORY[match[1]],
    categorySegment: match[1],
    locationSlug: match[2] || "",
    locationName: match[2] ? fromLocationSlug(match[2]) : "",
  };
}

export function buildListingsSlugPath({
  category = "all",
  city = "",
  state = "",
  locationSlug = "",
} = {}) {
  const cat = String(category || "all");
  const segment = CATEGORY_TO_SEGMENT[cat] ?? "hotels";
  const cityName = String(city || "").trim();
  const stateName = String(state || "").trim();
  const resolvedSlug =
    String(locationSlug || "").trim() ||
    (cityName
      ? toLocationSlug(cityName)
      : stateName
        ? toLocationSlug(stateName)
        : "");

  if (resolvedSlug) return `/${segment}/${resolvedSlug}`;
  return `/${segment}`;
}

const BOOKING_KEYS = ["checkIn", "checkOut", "adults", "children", "rooms", "childAges"];
const FILTER_KEYS = ["price", "stars", "amenities", "sort"];

export function isStateSlug(state, locationSlug) {
  return Boolean(state) && toLocationSlug(state) === locationSlug;
}

/** Merge slug route params + query into the plain object listings page already expects. */
export function mergeListingsRouteSearchParams(routeParams, queryParams = {}) {
  const segment = String(routeParams?.category || "").toLowerCase();
  if (!isListingsSlugSegment(segment)) return null;

  const locationSlug = String(routeParams?.location || "").trim();
  const slug = parseListingsSlugPath(
    locationSlug ? `/${segment}/${locationSlug}` : `/${segment}`
  );
  const query = { ...queryParams };

  const category = String(query.category || "").trim() || slug?.category || "all";
  if (category === "all") delete query.category;
  else query.category = category;

  const city = String(query.city || "").trim();
  const state = String(query.state || "").trim();
  const locationName = slug?.locationName || "";

  if (state) {
    query.state = state;
    if (!city && locationName && !isStateSlug(state, locationSlug)) {
      query.city = locationName;
    }
  } else if (city) {
    query.city = city;
  }
  // Slug-only: city/state resolved server-side via API catalog.

  return query;
}

export function listingsQueryFromParams(params) {
  const source =
    params instanceof URLSearchParams
      ? params
      : new URLSearchParams(params?.toString?.() || "");
  const query = new URLSearchParams();

  for (const key of [...BOOKING_KEYS, ...FILTER_KEYS]) {
    const value = source.get(key);
    if (value) query.set(key, value);
  }

  return query;
}
