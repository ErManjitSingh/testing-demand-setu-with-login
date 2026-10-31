import { distanceBucket } from "@/lib/places/placesText";

export const PAGE_SIZE = 24;

export const SORT_OPTIONS = [
  { id: "recommended", label: "Recommended" },
  { id: "nearest", label: "Nearest first" },
  { id: "az", label: "A – Z" },
];

export const DISTANCE_OPTIONS = [
  { id: "", label: "Any distance" },
  { id: "near", label: "Nearby (up to 15 km)" },
  { id: "far", label: "Day trips (15 km+)" },
];

const one = (v) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Normalise raw `searchParams` into the filter shape used by the /places page and filter bar. */
export function parsePlacesParams(raw = {}) {
  const sortRaw = String(one(raw.sort));
  const distRaw = String(one(raw.dist));
  const page = Number.parseInt(String(one(raw.page)), 10);
  return {
    q: String(one(raw.q)).trim().slice(0, 80),
    state: String(one(raw.state)).trim().toLowerCase(),
    city: String(one(raw.city)).trim().toLowerCase(),
    type: String(one(raw.type)).trim().toLowerCase(),
    dist: ["near", "far"].includes(distRaw) ? distRaw : "",
    sort: SORT_OPTIONS.some((s) => s.id === sortRaw) ? sortRaw : "recommended",
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 500) : 1,
  };
}

export function hasActiveFilters(f) {
  return Boolean(f.q || f.state || f.city || f.type || f.dist || f.sort !== "recommended");
}

export function filterPlaces(places, f) {
  const q = f.q.toLowerCase();
  return places.filter((p) => {
    if (f.state && p.stateSlug !== f.state) return false;
    if (f.city && p.citySlug !== f.city) return false;
    if (f.type && p.type !== f.type) return false;
    if (f.dist && distanceBucket(p.distanceKm) !== f.dist) return false;
    if (q && !`${p.name} ${p.city} ${p.stateName}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function buildPlacesQuery(f, overrides = {}) {
  const next = { ...f, ...overrides };
  const qs = new URLSearchParams();
  if (next.q) qs.set("q", next.q);
  if (next.state) qs.set("state", next.state);
  if (next.city) qs.set("city", next.city);
  if (next.type) qs.set("type", next.type);
  if (next.dist) qs.set("dist", next.dist);
  if (next.sort && next.sort !== "recommended") qs.set("sort", next.sort);
  if (next.page && next.page > 1) qs.set("page", String(next.page));
  const s = qs.toString();
  return s ? `?${s}` : "";
}
