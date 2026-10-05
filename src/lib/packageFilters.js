import {
  DURATION_BUCKETS,
  PACKAGE_THEMES,
  THEME_BY_ID,
  getPackagePriceBounds,
} from "@/lib/tourPackageMeta";
import {
  DEFAULT_CHILD_AGE,
  TRAVELLER_LIMITS,
  parseCount,
  syncChildAges,
} from "@/lib/tourTravellers";

export const SORT_OPTIONS = [
  { id: "popular", label: "Most popular" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
  { id: "discount", label: "Biggest discount" },
  { id: "duration-asc", label: "Duration: shortest" },
  { id: "duration-desc", label: "Duration: longest" },
];

export const BUDGET_PRESETS = [
  { id: "any", label: "Any budget", min: null, max: null },
  { id: "u20", label: "Under ₹20,000", min: null, max: 20000 },
  { id: "20-35", label: "₹20,000 – ₹35,000", min: 20000, max: 35000 },
  { id: "35-55", label: "₹35,000 – ₹55,000", min: 35000, max: 55000 },
  { id: "55p", label: "₹55,000 & above", min: 55000, max: null },
];

export const PERK_FILTERS = [
  { id: "meals", label: "Dinner / all meals included" },
  { id: "flights", label: "Flight assistance" },
  { id: "visa", label: "Visa assistance (international)" },
  { id: "inseason", label: "Best season on my dates" },
];

export const RATING_OPTIONS = [
  { value: 0, label: "Any rating" },
  { value: 4.5, label: "4.5 & up" },
  { value: 4.8, label: "4.8 & up" },
];

export const PAGE_SIZE = 9;

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "May – Sep, Oct – Dec" → is month index (0-11) inside? Handles wrap-around ranges. */
export function isInSeason(bestTime = "", monthIndex) {
  if (!bestTime || bestTime.toLowerCase().includes("year")) return true;
  if (monthIndex == null || Number.isNaN(monthIndex)) return false;
  return bestTime.split(",").some((range) => {
    const parts = range
      .split(/[–-]/)
      .map((p) => MONTHS.indexOf(p.trim().slice(0, 3).toLowerCase()))
      .filter((n) => n >= 0);
    if (!parts.length) return false;
    const [start, end = start] = parts;
    return start <= end ? monthIndex >= start && monthIndex <= end : monthIndex >= start || monthIndex <= end;
  });
}

export function monthIndexFromDate(value) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d.getMonth();
}

export function createDefaultFilters() {
  const { min, max } = getPackagePriceBounds();
  return {
    q: "",
    date: "",
    travellers: { adults: 2, children: 0, infants: 0, childAges: [] },
    themes: [],
    region: "all",
    durations: [],
    price: [min, max],
    rating: 0,
    stars: [],
    perks: [],
    sort: "popular",
    view: "grid",
  };
}

const list = (value) =>
  String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const first = (value) => (Array.isArray(value) ? value[0] : value);

/** Parse Next.js `searchParams` (or URLSearchParams) into a filters object. */
export function parseFilters(params = {}) {
  const get = (key) => {
    if (typeof params.get === "function") return params.get(key) ?? undefined;
    return first(params[key]);
  };
  const defaults = createDefaultFilters();
  const { min, max } = getPackagePriceBounds();

  const adults = parseCount(get("adults"), 2, TRAVELLER_LIMITS.adults);
  const children = parseCount(get("children"), 0, TRAVELLER_LIMITS.children);
  const infants = parseCount(get("infants"), 0, TRAVELLER_LIMITS.infants);
  const ages = list(get("ages")).map((n) => parseCount(n, DEFAULT_CHILD_AGE, { min: 2, max: 11 }));

  const themeIds = new Set(PACKAGE_THEMES.map((t) => t.id));
  const durationIds = new Set(DURATION_BUCKETS.map((d) => d.id));
  const sortIds = new Set(SORT_OPTIONS.map((s) => s.id));
  const perkIds = new Set(PERK_FILTERS.map((p) => p.id));
  const region = get("region");
  const date = get("date");

  return {
    ...defaults,
    q: String(get("q") ?? "").slice(0, 80),
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(date ?? "")) ? date : "",
    travellers: { adults, children, infants, childAges: syncChildAges(ages, children) },
    themes: list(get("themes")).filter((t) => themeIds.has(t)),
    region: region === "india" || region === "international" ? region : "all",
    durations: list(get("dur")).filter((d) => durationIds.has(d)),
    price: [
      Math.max(min, parseCount(get("min"), min, { min, max })),
      Math.min(max, parseCount(get("max"), max, { min, max })),
    ],
    rating: [4.5, 4.8].includes(Number(get("rating"))) ? Number(get("rating")) : 0,
    stars: list(get("stars"))
      .map(Number)
      .filter((n) => [3, 4, 5].includes(n)),
    perks: list(get("perks")).filter((p) => perkIds.has(p)),
    sort: sortIds.has(get("sort")) ? get("sort") : "popular",
    view: get("view") === "list" ? "list" : "grid",
  };
}

/** Serialise filters into a compact query string (only non-default values). */
export function filtersToQuery(filters) {
  const defaults = createDefaultFilters();
  const p = new URLSearchParams();
  const t = filters.travellers;

  if (filters.q.trim()) p.set("q", filters.q.trim());
  if (filters.date) p.set("date", filters.date);
  if (t.adults !== 2) p.set("adults", String(t.adults));
  if (t.children) {
    p.set("children", String(t.children));
    p.set("ages", t.childAges.join(","));
  }
  if (t.infants) p.set("infants", String(t.infants));
  if (filters.themes.length) p.set("themes", filters.themes.join(","));
  if (filters.region !== "all") p.set("region", filters.region);
  if (filters.durations.length) p.set("dur", filters.durations.join(","));
  if (filters.price[0] !== defaults.price[0]) p.set("min", String(filters.price[0]));
  if (filters.price[1] !== defaults.price[1]) p.set("max", String(filters.price[1]));
  if (filters.rating) p.set("rating", String(filters.rating));
  if (filters.stars.length) p.set("stars", filters.stars.join(","));
  if (filters.perks.length) p.set("perks", filters.perks.join(","));
  if (filters.sort !== "popular") p.set("sort", filters.sort);
  if (filters.view !== "grid") p.set("view", filters.view);
  return p.toString();
}

function matchesQuery(pkg, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [
    pkg.title,
    pkg.subtitle,
    pkg.location,
    pkg.state,
    pkg.country,
    ...(pkg.highlights ?? []),
    ...pkg.meta.themes.map((t) => THEME_BY_ID[t]?.label ?? t),
  ]
    .join(" ")
    .toLowerCase();
  return needle.split(/\s+/).every((word) => haystack.includes(word));
}

export function applyFilters(packages, filters) {
  const month = monthIndexFromDate(filters.date);

  return packages.filter((pkg) => {
    const { meta } = pkg;
    if (!matchesQuery(pkg, filters.q)) return false;
    if (filters.region === "india" && meta.international) return false;
    if (filters.region === "international" && !meta.international) return false;
    if (filters.themes.length && !filters.themes.some((t) => meta.themes.includes(t))) return false;
    if (filters.durations.length) {
      const hit = DURATION_BUCKETS.some((b) => filters.durations.includes(b.id) && b.test(meta.nights));
      if (!hit) return false;
    }
    if (pkg.price < filters.price[0] || pkg.price > filters.price[1]) return false;
    if (filters.rating && pkg.rating < filters.rating) return false;
    if (filters.stars.length && !filters.stars.includes(meta.stars)) return false;
    if (filters.perks.includes("meals") && meta.mealPlan === "Breakfast") return false;
    if (filters.perks.includes("flights") && !meta.flightsIncluded) return false;
    if (filters.perks.includes("visa") && !meta.international) return false;
    if (filters.perks.includes("inseason") && month != null && !isInSeason(meta.bestTime, month)) return false;
    return true;
  });
}

const popularity = (pkg) => pkg.rating * Math.log10(pkg.reviews + 10) + (pkg.famous ? 1.5 : 0);

export function sortPackages(packages, sort) {
  const copy = packages.slice();
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "discount":
      return copy.sort((a, b) => b.meta.discount - a.meta.discount);
    case "duration-asc":
      return copy.sort((a, b) => a.meta.nights - b.meta.nights);
    case "duration-desc":
      return copy.sort((a, b) => b.meta.nights - a.meta.nights);
    default:
      return copy.sort((a, b) => popularity(b) - popularity(a));
  }
}

/** Human-readable chips for the "active filters" bar. */
export function describeActiveFilters(filters) {
  const defaults = createDefaultFilters();
  const chips = [];
  if (filters.q.trim()) chips.push({ key: "q", label: `“${filters.q.trim()}”` });
  filters.themes.forEach((t) => chips.push({ key: `theme:${t}`, label: THEME_BY_ID[t]?.label ?? t }));
  if (filters.region !== "all") {
    chips.push({ key: "region", label: filters.region === "india" ? "India" : "International" });
  }
  filters.durations.forEach((d) =>
    chips.push({ key: `dur:${d}`, label: DURATION_BUCKETS.find((b) => b.id === d)?.label ?? d })
  );
  if (filters.price[0] !== defaults.price[0] || filters.price[1] !== defaults.price[1]) {
    chips.push({
      key: "price",
      label: `₹${filters.price[0].toLocaleString("en-IN")} – ₹${filters.price[1].toLocaleString("en-IN")}`,
    });
  }
  if (filters.rating) chips.push({ key: "rating", label: `${filters.rating}★ & up` });
  filters.stars.forEach((s) => chips.push({ key: `stars:${s}`, label: `${s}★ hotels` }));
  filters.perks.forEach((p) =>
    chips.push({ key: `perk:${p}`, label: PERK_FILTERS.find((x) => x.id === p)?.label ?? p })
  );
  return chips;
}

export function removeFilterChip(filters, key) {
  const defaults = createDefaultFilters();
  const [kind, value] = key.split(":");
  switch (kind) {
    case "q":
      return { ...filters, q: "" };
    case "theme":
      return { ...filters, themes: filters.themes.filter((t) => t !== value) };
    case "region":
      return { ...filters, region: "all" };
    case "dur":
      return { ...filters, durations: filters.durations.filter((d) => d !== value) };
    case "price":
      return { ...filters, price: defaults.price };
    case "rating":
      return { ...filters, rating: 0 };
    case "stars":
      return { ...filters, stars: filters.stars.filter((s) => String(s) !== value) };
    case "perk":
      return { ...filters, perks: filters.perks.filter((p) => p !== value) };
    default:
      return filters;
  }
}

/** Build a /packages link carrying search context (used by cards and quick links). */
export function buildDetailHref(slug, filters) {
  const p = new URLSearchParams();
  if (filters?.date) p.set("date", filters.date);
  const t = filters?.travellers;
  if (t) {
    if (t.adults !== 2) p.set("adults", String(t.adults));
    if (t.children) {
      p.set("children", String(t.children));
      p.set("ages", t.childAges.join(","));
    }
    if (t.infants) p.set("infants", String(t.infants));
  }
  const qs = p.toString();
  return `/packages/${slug}${qs ? `?${qs}` : ""}`;
}
