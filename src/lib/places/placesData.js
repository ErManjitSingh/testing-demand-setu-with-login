import { unstable_cache } from "next/cache";
import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import {
  PLACES_COUNTRY,
  cleanText,
  detectPlaceType,
  slugify,
  titleCase,
  travelMinutes,
  truncate,
} from "@/lib/places/placesText";

/**
 * Server-only data layer for /places.
 *
 * The backend has no "all places" endpoint, so we walk
 *   states -> cities -> places
 * once, normalise everything, and cache the result (6h). Every page reads from that single
 * cached index, so crawling the API happens at most a few times a day, never per visitor.
 */

const REVALIDATE_SECONDS = 6 * 60 * 60;
const REQUEST_TIMEOUT_MS = 10000;
const CONCURRENCY = 24;

// The backend spells a few states differently from the public name — fix them for URLs/SEO.
const STATE_SLUG_FIX = {
  uttrakhand: "uttarakhand",
  gujrat: "gujarat",
  maharastra: "maharashtra",
  uttarpradesh: "uttar-pradesh",
  "jammu-kashmir": "jammu-and-kashmir",
  "jammu-and-kashmir": "jammu-and-kashmir",
};
const STATE_NAME_FIX = {
  "jammu-and-kashmir": "Jammu & Kashmir",
  odisha: "Odisha",
};

// next/image only accepts the hosts listed in next.config.mjs.
const IMAGE_HOSTS = new Set([
  "www.demandsetutours.com",
  "images.unsplash.com",
  "images.pexels.com",
  "firebasestorage.googleapis.com",
  "packagemaker-image.firebasestorage.app",
  "encrypted-tbn0.gstatic.com",
  "lh3.googleusercontent.com",
]);

function safeImage(url) {
  try {
    const u = new URL(String(url));
    return u.protocol === "https:" && IMAGE_HOSTS.has(u.hostname) ? u.toString() : null;
  } catch {
    return null;
  }
}

/* ------------------------------ network layer ------------------------------ */

class ApiStats {
  constructor() {
    this.total = 0;
    this.failed = 0;
  }
}

async function getJson(path, stats) {
  stats.total += 1;
  try {
    const res = await fetchWithTimeout(buildApiUrl(`api/${path}`), { cache: "no-store" }, REQUEST_TIMEOUT_MS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    // One retry — the backend occasionally drops a request under load.
    try {
      const res = await fetchWithTimeout(buildApiUrl(`api/${path}`), { cache: "no-store" }, REQUEST_TIMEOUT_MS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch {
      stats.failed += 1;
      return [];
    }
  }
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor;
      cursor += 1;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

const enc = encodeURIComponent;

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

/* -------------------------------- normalise -------------------------------- */

function publicStateSlug(raw) {
  const slug = slugify(raw);
  return STATE_SLUG_FIX[slug] ?? slug;
}

function publicStateName(slug) {
  return (
    STATE_NAME_FIX[slug] ??
    slug
      .split("-")
      .map((w) => (w === "and" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(" ")
  );
}

function normalisePlace(raw, { stateSlug, stateName, citySlug, cityName }) {
  const name = titleCase(raw.placeName);
  if (!name || raw.enabled === false) return null;

  // The backend still holds placeholder rows ("testing", "manali testing"); never publish those.
  const description = cleanText(raw.description);
  const looksLikeTest = /\b(test|testing|tetsing|tesing|tsting|dummy|lorem ipsum)\b/i;
  if (looksLikeTest.test(name) || (description.length < 40 && looksLikeTest.test(description))) return null;

  const images = (Array.isArray(raw.imageUrls) ? raw.imageUrls : []).map(safeImage).filter(Boolean);
  const km = Number(raw.distance);
  const distanceKm = km > 0 ? km : null;

  return {
    id: String(raw._id),
    name,
    description,
    image: images[0] ?? null,
    images,
    distanceKm,
    minutes: travelMinutes(raw.time, distanceKm),
    cost: {
      Hatchback: Number(raw.cost?.Hatchback) || 0,
      Sedan: Number(raw.cost?.Sedan) || 0,
      SUV: Number(raw.cost?.SUV) || 0,
      Traveller: Number(raw.cost?.Traveller) || 0,
    },
    type: detectPlaceType(name),
    city: cityName,
    citySlug,
    stateName,
    stateSlug,
    country: PLACES_COUNTRY.name,
    slug: "", // assigned once per city so slugs are unique
  };
}

/**
 * Some stored image links are dead (e.g. a storage bucket answering 402/404). A broken picture is the
 * ugliest glitch on a page, so probe every image once per cache cycle and drop the dead ones — those
 * places then fall back to the state photo. Network hiccups never drop an image (only a clear HTTP
 * failure does).
 */
async function pruneDeadImages(places) {
  const urls = unique(places.flatMap((p) => p.images));
  const dead = new Set();

  await mapPool(urls, CONCURRENCY, async (url) => {
    try {
      const res = await fetchWithTimeout(url, { method: "HEAD", cache: "no-store" }, 6000);
      if ([402, 403, 404, 410].includes(res.status)) dead.add(url);
    } catch {
      /* unknown — keep it */
    }
  });

  if (!dead.size) return;
  for (const place of places) {
    place.images = place.images.filter((url) => !dead.has(url));
    place.image = place.images[0] ?? null;
  }
}

async function buildIndex() {
  const stats = new ApiStats();

  const rawStates = await getJson(`states/getstates/${enc(PLACES_COUNTRY.name)}`, stats);
  const stateNames = unique(rawStates.map((s) => cleanText(s.stateName)));

  // The backend is case-sensitive and inconsistent ("haryana" vs "Haryana"), so ask for each
  // spelling and merge by id.
  const cityLists = await mapPool(stateNames, CONCURRENCY, async (name) => {
    const variants = unique([slugify(name), name, name.toLowerCase()]);
    const found = new Map();
    for (const variant of variants) {
      const rows = await getJson(`cities/getcities/${enc(PLACES_COUNTRY.name)}/${enc(variant)}`, stats);
      for (const row of rows) found.set(String(row._id), row);
    }
    return [...found.values()];
  });

  // Group city records by public state + city slug (duplicates exist in the source data).
  const states = new Map();
  for (const row of cityLists.flat()) {
    const cityName = titleCase(row.cityName);
    const rowState = cleanText(row.state);
    if (!cityName || !rowState) continue;

    const stateSlug = publicStateSlug(rowState);
    const citySlug = slugify(cityName);
    if (!stateSlug || !citySlug) continue;

    if (!states.has(stateSlug)) {
      states.set(stateSlug, { slug: stateSlug, name: publicStateName(stateSlug), cities: new Map() });
    }
    const state = states.get(stateSlug);
    if (!state.cities.has(citySlug)) {
      state.cities.set(citySlug, { slug: citySlug, name: cityName, sources: [], places: [] });
    }
    state.cities.get(citySlug).sources.push({ apiState: rowState, apiCity: cleanText(row.cityName) });
  }

  const cityJobs = [];
  for (const state of states.values()) {
    for (const city of state.cities.values()) cityJobs.push({ state, city });
  }

  await mapPool(cityJobs, CONCURRENCY, async ({ state, city }) => {
    const found = new Map();
    for (const { apiState, apiCity } of city.sources) {
      const variants = unique([apiCity, apiCity.toLowerCase()]);
      for (const variant of variants) {
        const rows = await getJson(
          `places/getplaces/${enc(PLACES_COUNTRY.name)}/${enc(apiState)}/${enc(variant)}`,
          stats
        );
        for (const row of rows) found.set(String(row._id), row);
      }
    }

    const used = new Set();
    city.places = [...found.values()]
      .map((row) =>
        normalisePlace(row, {
          stateSlug: state.slug,
          stateName: state.name,
          citySlug: city.slug,
          cityName: city.name,
        })
      )
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((place) => {
        let slug = slugify(place.name) || place.id;
        if (used.has(slug)) slug = `${slug}-${used.size + 1}`;
        used.add(slug);
        return { ...place, slug };
      });
  });

  await pruneDeadImages([...states.values()].flatMap((state) => [...state.cities.values()].flatMap((city) => city.places)));

  // If most of the API calls failed, don't let a broken snapshot get cached for hours.
  if (stats.total === 0 || stats.failed / stats.total > 0.35) {
    throw new Error(`Places API unavailable (${stats.failed}/${stats.total} requests failed)`);
  }

  const out = [...states.values()]
    .map((state) => {
      const cities = [...state.cities.values()]
        .map(({ slug, name, places }) => ({ slug, name, stateSlug: state.slug, stateName: state.name, places }))
        .sort((a, b) => b.places.length - a.places.length || a.name.localeCompare(b.name));
      return {
        slug: state.slug,
        name: state.name,
        cities,
        placeCount: cities.reduce((n, c) => n + c.places.length, 0),
      };
    })
    .filter((state) => state.placeCount > 0)
    .sort((a, b) => b.placeCount - a.placeCount || a.name.localeCompare(b.name));

  return { generatedAt: new Date().toISOString(), states: out };
}

/* --------------------------------- caching --------------------------------- */

const cachedBuild = unstable_cache(buildIndex, ["places-index-v4"], {
  revalidate: REVALIDATE_SECONDS,
  tags: ["places-index"],
});

let memo = null; // { at: number, value: Promise<Index> }
const MEMO_MS = 10 * 60 * 1000;

/** Single entry point for every /places page. Throws if the API is down and nothing is cached. */
export function getPlacesIndex() {
  const now = Date.now();
  if (memo && now - memo.at < MEMO_MS) return memo.value;

  const value = cachedBuild();
  memo = { at: now, value };
  // Don't remember failures — the next request should try again.
  value.catch(() => {
    if (memo?.value === value) memo = null;
  });
  return value;
}

/** Same as getPlacesIndex but resolves to null instead of throwing (for sitemap / optional widgets). */
export async function getPlacesIndexSafe() {
  try {
    return await getPlacesIndex();
  } catch {
    return null;
  }
}

/* --------------------------------- queries --------------------------------- */

export function flattenPlaces(index) {
  return index.states.flatMap((s) => s.cities.flatMap((c) => c.places));
}

export function findState(index, slug) {
  return index.states.find((s) => s.slug === slug) ?? null;
}

export function findCity(index, stateSlug, citySlug) {
  const state = findState(index, stateSlug);
  const city = state?.cities.find((c) => c.slug === citySlug) ?? null;
  return city && city.places.length ? { state, city } : null;
}

export function findPlace(index, stateSlug, citySlug, placeSlug) {
  const hit = findCity(index, stateSlug, citySlug);
  const place = hit?.city.places.find((p) => p.slug === placeSlug) ?? null;
  return place ? { ...hit, place } : null;
}

/** Recommended order: richer entries (photo, longer text) first, then A-Z. */
export function sortRecommended(a, b) {
  const score = (p) => (p.image ? 1000 : 0) + Math.min((p.description ?? p.blurb ?? "").length, 400);
  return score(b) - score(a) || a.name.localeCompare(b.name);
}

export function sortNearest(a, b) {
  const da = a.distanceKm ?? Infinity;
  const db = b.distanceKm ?? Infinity;
  return da - db || a.name.localeCompare(b.name);
}

/** Slim copy for client components / list pages (keeps payloads small). */
export function toCardPlace(place) {
  return {
    id: place.id,
    name: place.name,
    slug: place.slug,
    city: place.city,
    citySlug: place.citySlug,
    stateName: place.stateName,
    stateSlug: place.stateSlug,
    type: place.type,
    image: place.image,
    distanceKm: place.distanceKm,
    minutes: place.minutes,
    blurb: truncate(place.description, 170),
  };
}
