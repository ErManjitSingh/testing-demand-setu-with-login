import { CATEGORIES } from "@/lib/listings";
import { buildListingsSearchUrl } from "@/lib/bookingSearch";

export const ALL_STAYS_CATEGORY = {
  id: "all",
  label: "All stays",
  description: "Hotels, villas & unique stays — pick a city or state.",
  icon: "✨",
};

export const TOUR_PACKAGES_CATEGORY = {
  id: "tour-package",
  label: "Tour Package",
  description: "Curated India & international tour packages",
  icon: "🗺️",
  count: "30+",
  countSuffix: "packages",
  cover:
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  href: "/",
};

/** Home page collection cards — stays + tour packages */
export const HOME_COLLECTIONS = [...CATEGORIES, TOUR_PACKAGES_CATEGORY];

export function resolveExploreCategory(categoryOrId) {
  if (!categoryOrId) return null;
  if (typeof categoryOrId === "object") return categoryOrId;
  if (categoryOrId === "all") return ALL_STAYS_CATEGORY;
  if (categoryOrId === TOUR_PACKAGES_CATEGORY.id) return TOUR_PACKAGES_CATEGORY;
  return CATEGORIES.find((c) => c.id === categoryOrId) ?? null;
}

export function buildExploreListingsUrl({ categoryId = "all", city = "", state = "" } = {}) {
  return buildListingsSearchUrl({
    category: categoryId,
    city,
    state,
  });
}
