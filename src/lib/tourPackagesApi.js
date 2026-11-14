import { cache } from "react";
import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { buildPackageSlug } from "@/lib/packagePath";
import { THEME_BY_ID } from "@/lib/tourPackageMeta";

const REVALIDATE_SECONDS = 300;

const ALLOWED_IMAGE_HOSTS = new Set([
  "www.demandsetutours.com",
  "images.unsplash.com",
  "images.pexels.com",
  "firebasestorage.googleapis.com",
  "packagemaker-image.firebasestorage.app",
  "encrypted-tbn0.gstatic.com",
  "lh3.googleusercontent.com",
]);

/** Our listing filter ids → packagemaker `by-theme` query values. */
export const THEME_ID_TO_API = {
  mountains: "hill-station",
  beaches: "beach",
  heritage: "cultural",
  spiritual: "religious",
  wildlife: "wildlife",
  honeymoon: "couple",
  adventure: "adventure",
  city: "holiday",
  family: "family",
};

/** Packagemaker theme tags → our listing filter ids. */
export const API_THEME_TO_ID = {
  "hill-station": "mountains",
  beach: "beaches",
  beaches: "beaches",
  cultural: "heritage",
  heritage: "heritage",
  religious: "spiritual",
  spiritual: "spiritual",
  wildlife: "wildlife",
  couple: "honeymoon",
  romantic: "honeymoon",
  honeymoon: "honeymoon",
  adventure: "adventure",
  holiday: "city",
  city: "city",
  family: "family",
  mountains: "mountains",
};

function text(value) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function safeImageUrl(value) {
  const raw = text(value);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    return ALLOWED_IMAGE_HOSTS.has(url.hostname) ? url.toString() : "";
  } catch {
    return "";
  }
}

function stripHtml(value) {
  return text(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapApiThemes(themes) {
  return [...new Set((Array.isArray(themes) ? themes : []).map((t) => API_THEME_TO_ID[text(t).toLowerCase()]).filter((id) => id && THEME_BY_ID[id]))];
}

function websitePrice(finalCosting) {
  const n = Number(finalCosting?.finalPrices?.website ?? finalCosting?.baseTotal ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
}

function firstImage(images) {
  if (!Array.isArray(images)) return safeImageUrl(images) || "";
  for (const item of images) {
    const url = safeImageUrl(typeof item === "string" ? item : item?.url || item?.image);
    if (url) return url;
  }
  return "";
}

function placeNames(packagePlaces) {
  return (Array.isArray(packagePlaces) ? packagePlaces : [])
    .map((p) => text(p?.placeCover || p?.cityName || p?.name))
    .filter(Boolean);
}

/** Normalise a list-card package from by-state / by-theme / by-place. */
export function normalizeListPackage(raw, { state = "", place = "" } = {}) {
  if (!raw || typeof raw !== "object") return null;
  const id = text(raw._id);
  const title = text(raw.packageName);
  if (!id || !title) return null;

  const places = placeNames(raw.packagePlaces);
  const themes = mapApiThemes(raw.themes);
  const price = websitePrice(raw.finalCosting);
  const tags = (Array.isArray(raw.tags) ? raw.tags : []).map(text).filter(Boolean);
  const location = text(place) || text(state) || places[0] || "";

  return {
    id,
    slug: buildPackageSlug({ id, title }),
    title,
    subtitle: places.slice(0, 3).join(" · "),
    location,
    state: text(state) || location,
    country: "India",
    duration: text(raw.duration) || "Flexible",
    price,
    originalPrice: null,
    rating: 4.8,
    reviews: 24,
    badge: tags[0] || text(raw.packageType) || "",
    famous: tags.some((t) => /best seller|trending/i.test(t)),
    image: firstImage(raw.packageImages),
    highlights: places.slice(0, 5),
    inclusions: [],
    groupSize: "2–12 travellers",
    description: places.length ? `Visit ${places.join(", ")} on this ${text(raw.duration) || "custom"} trip.` : title,
    themes,
  };
}

function listFromHtmlOrArray(value) {
  if (Array.isArray(value)) return value.map(stripHtml).filter(Boolean);
  const plain = stripHtml(value);
  if (!plain) return [];
  return plain
    .split(/\n|•|\u2022|(?<=\.)\s+/)
    .map((s) => s.replace(/^\d+[\).\s-]+/, "").trim())
    .filter((s) => s.length > 2)
    .slice(0, 16);
}

/** Normalise `/api/add/get/:id` into the shape our detail UI already expects. */
export function normalizePackageDetail(doc) {
  if (!doc || typeof doc !== "object") return null;
  const raw = doc.package && typeof doc.package === "object" ? doc.package : doc;
  const id = text(doc._id || raw._id);
  const title = text(raw.packageName);
  if (!id || !title) return null;

  const places = placeNames(raw.packagePlaces);
  const themes = mapApiThemes(raw.themes);
  const price = websitePrice(doc.finalCosting || raw.finalCosting);
  const images = [
    ...((Array.isArray(doc.images) ? doc.images : []).map((u) => safeImageUrl(u)).filter(Boolean)),
    ...((Array.isArray(raw.packageImages) ? raw.packageImages : []).map((u) => safeImageUrl(u)).filter(Boolean)),
  ];
  const uniqueImages = [...new Set(images)];
  const state = text(raw.state);
  const description =
    stripHtml(raw.packageDescription) ||
    (places.length ? `Visit ${places.join(", ")} with Demand Setu Tours.` : title);

  return {
    id,
    slug: buildPackageSlug({ id, title }),
    title,
    subtitle: places.slice(0, 4).join(" · ") || state,
    location: state || places[0] || "India",
    state: state || places[0] || "",
    country: "India",
    duration: text(raw.duration) || "Flexible",
    price,
    originalPrice: null,
    rating: 4.8,
    reviews: 24,
    badge: text(raw.packageType) || (Array.isArray(raw.tags) ? text(raw.tags[0]) : "") || "",
    image: uniqueImages[0] || "",
    images: uniqueImages,
    highlights: places.slice(0, 6),
    inclusions: listFromHtmlOrArray(raw.packageInclusions),
    exclusions: listFromHtmlOrArray(raw.packageExclusions || raw.customExclusions),
    groupSize: "2–12 travellers",
    description,
    themes,
    pickup: text(raw.pickupLocation),
    itineraryDays: Array.isArray(raw.itineraryDays) ? raw.itineraryDays : [],
    metaTitle: text(doc.metaTitle),
    metaDescription: text(doc.metaDescription),
    canonicalTag: text(doc.canonicalTag),
  };
}

async function getJson(path) {
  try {
    const response = await fetchWithTimeout(
      buildApiUrl(path),
      {
        headers: { Accept: "application/json", "User-Agent": "DemandSetuTours/1.0" },
        next: { revalidate: REVALIDATE_SECONDS },
      },
      15000
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchPackagesByTheme(themeIdOrApi, { page = 1, limit = 48 } = {}) {
  const apiTheme = THEME_ID_TO_API[themeIdOrApi] || themeIdOrApi;
  if (!apiTheme) return { packages: [], pagination: null, apiTheme: "" };
  const data = await getJson(
    `api/add/packages/by-theme?theme=${encodeURIComponent(apiTheme)}&page=${page}&limit=${limit}`
  );
  const packages = (Array.isArray(data?.packages) ? data.packages : [])
    .map((row) => normalizeListPackage(row))
    .filter(Boolean);
  return { packages, pagination: data?.pagination ?? null, apiTheme };
}

export async function fetchPackagesByState(state, { page = 1, limit = 48 } = {}) {
  const name = text(state);
  if (!name) return { packages: [], pagination: null, state: "" };
  const data = await getJson(
    `api/add/packages/by-state?state=${encodeURIComponent(name)}&page=${page}&limit=${limit}`
  );
  const packages = (Array.isArray(data?.packages) ? data.packages : [])
    .map((row) => normalizeListPackage(row, { state: name }))
    .filter(Boolean);
  return { packages, pagination: data?.pagination ?? null, state: name };
}

export async function fetchPackagesByPlace(place, { page = 1, limit = 48 } = {}) {
  const name = text(place);
  if (!name) return { packages: [], pagination: null, place: "" };
  const data = await getJson(
    `api/add/packages/by-place?place=${encodeURIComponent(name)}&page=${page}&limit=${limit}`
  );
  const packages = (Array.isArray(data?.packages) ? data.packages : [])
    .map((row) => normalizeListPackage(row, { place: name }))
    .filter(Boolean);
  return { packages, pagination: data?.pagination ?? null, place: name };
}

export const fetchPackageById = cache(async (id) => {
  const packageId = text(id);
  if (!packageId) return null;
  const data = await getJson(`api/add/get/${encodeURIComponent(packageId)}`);
  return normalizePackageDetail(data);
});

/**
 * Pick the right list API from listing filters.
 * Theme → place (city) → q as state/destination.
 */
export async function fetchPackagesForFilters(filters = {}) {
  const themeId = Array.isArray(filters.themes) && filters.themes[0] ? filters.themes[0] : "";
  const place = text(filters.place);
  const q = text(filters.q);

  if (themeId) {
    const result = await fetchPackagesByTheme(themeId, { page: 1, limit: 48 });
    return { ...result, source: "theme", query: themeId };
  }
  if (place) {
    const result = await fetchPackagesByPlace(place, { page: 1, limit: 48 });
    return { ...result, source: "place", query: place };
  }
  if (q) {
    const result = await fetchPackagesByState(q, { page: 1, limit: 48 });
    return { ...result, source: "state", query: q };
  }
  return { packages: [], pagination: null, source: "none", query: "" };
}
