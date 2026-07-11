import { getApiPropertyType } from "@/lib/propertyTypes";

export const PRICE_FILTER_OPTIONS = [
  { id: "under-2000", label: "Under ₹2,000", min: 0, max: 2000 },
  { id: "2000-5000", label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { id: "5000-10000", label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
  { id: "10000-plus", label: "₹10,000+", min: 10000, max: Infinity },
];

export const STAR_FILTER_OPTIONS = [
  { id: "5", label: "5 Star" },
  { id: "4", label: "4 Star" },
  { id: "3", label: "3 Star" },
  { id: "2", label: "2 Star" },
  { id: "1", label: "1 Star" },
];

export const AMENITY_FILTER_OPTIONS = [
  { id: "wifi", label: "Free WiFi", match: (a) => /wifi/i.test(a) },
  { id: "pool", label: "Pool", match: (a) => /pool|swim/i.test(a) },
  { id: "breakfast", label: "Breakfast", match: (a) => /breakfast/i.test(a) },
  { id: "parking", label: "Parking", match: (a) => /parking/i.test(a) },
  { id: "pet", label: "Pet friendly", match: (a) => /pet/i.test(a) },
];

export function parseStarRating(raw) {
  const n = Number.parseInt(String(raw || "").replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(n) || n < 1 || n > 5) return null;
  return n;
}

export function mapApiPropertyTypeToCategory(propertyTypeRaw) {
  const raw = String(propertyTypeRaw || "").toLowerCase();
  if (raw.includes("bnb")) return "airbnb";
  if (raw.includes("homestay") || raw.includes("villa")) return "homestay";
  if (raw.includes("hotel")) return "hotel";
  return "hotel";
}

export function apiPropertyTypeMatches(listingType, apiTarget) {
  const raw = String(listingType || "").toLowerCase();
  const target = String(apiTarget || "").toLowerCase();
  if (!raw || !target) return false;
  if (target === "hotel") return raw.includes("hotel");
  if (target === "bnbs") return raw.includes("bnb");
  if (target === "homestays&villas" || target.includes("homestay") || target.includes("villa")) {
    return raw.includes("homestay") || raw.includes("villa");
  }
  return raw.includes(target);
}

export function listingMatchesCategory(listing, categoryId) {
  if (!categoryId || categoryId === "all") return true;

  const apiTarget = getApiPropertyType(categoryId);
  if (listing.apiPropertyType && apiTarget) {
    return apiPropertyTypeMatches(listing.apiPropertyType, apiTarget);
  }

  return listing.category === categoryId;
}

export function listingMatchesPrice(listing, priceIds) {
  if (!priceIds?.length) return true;
  const price = Number(listing.price) || 0;
  return priceIds.some((id) => {
    const band = PRICE_FILTER_OPTIONS.find((p) => p.id === id);
    if (!band) return false;
    return price >= band.min && price < band.max;
  });
}

export function getListingStarRating(listing) {
  if (listing.starRating != null) return listing.starRating;
  const rating = Number(listing.rating);
  if (Number.isFinite(rating) && rating >= 1 && rating <= 5) return Math.round(rating);
  return null;
}

export function listingMatchesStars(listing, starIds) {
  if (!starIds?.length) return true;
  const star = getListingStarRating(listing);
  if (star == null) return false;
  return starIds.includes(String(star));
}

export function listingMatchesAmenities(listing, amenityIds) {
  if (!amenityIds?.length) return true;
  const items = [
    ...(Array.isArray(listing.amenities) ? listing.amenities : []),
    ...(Array.isArray(listing.amenityKeys) ? listing.amenityKeys : []),
  ];
  const blob = items.join(" ").toLowerCase();

  return amenityIds.every((id) => {
    const opt = AMENITY_FILTER_OPTIONS.find((a) => a.id === id);
    if (!opt) return true;
    return items.some((a) => opt.match(String(a))) || opt.match(blob);
  });
}

export function applyListingFilters(listings, filters) {
  const { category = "all", prices = [], stars = [], amenities = [] } = filters;

  return listings.filter(
    (listing) =>
      listingMatchesCategory(listing, category) &&
      listingMatchesPrice(listing, prices) &&
      listingMatchesStars(listing, stars) &&
      listingMatchesAmenities(listing, amenities)
  );
}

export function countListingsByCategory(listings, filters = {}) {
  const base = { prices: filters.prices, stars: filters.stars, amenities: filters.amenities };
  return {
    all: applyListingFilters(listings, { ...base, category: "all" }).length,
    hotel: applyListingFilters(listings, { ...base, category: "hotel" }).length,
    airbnb: applyListingFilters(listings, { ...base, category: "airbnb" }).length,
    homestay: applyListingFilters(listings, { ...base, category: "homestay" }).length,
  };
}

export function parseCsvParam(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
