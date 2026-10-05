import { TOUR_PACKAGES } from "@/lib/tourPackages";

/**
 * Listing-level metadata for every package: themes, season, hotel grade, etc.
 * Kept separate from tourPackages.js so the catalogue stays easy to edit.
 */

export const PACKAGE_THEMES = [
  { id: "mountains", label: "Mountains" },
  { id: "beaches", label: "Beaches & Islands" },
  { id: "heritage", label: "Heritage & Culture" },
  { id: "spiritual", label: "Spiritual" },
  { id: "wildlife", label: "Wildlife & Nature" },
  { id: "honeymoon", label: "Honeymoon" },
  { id: "adventure", label: "Adventure" },
  { id: "city", label: "City Breaks" },
  { id: "family", label: "Family" },
];

export const THEME_BY_ID = Object.fromEntries(PACKAGE_THEMES.map((t) => [t.id, t]));

export const DURATION_BUCKETS = [
  { id: "short", label: "Up to 3 nights", test: (n) => n <= 3 },
  { id: "mid", label: "4 – 5 nights", test: (n) => n >= 4 && n <= 5 },
  { id: "long", label: "6 – 7 nights", test: (n) => n >= 6 && n <= 7 },
  { id: "xl", label: "8+ nights", test: (n) => n >= 8 },
];

export const HOTEL_CATEGORIES = [
  { id: "standard", label: "Standard", stars: 3, factor: 1, blurb: "Clean, comfortable 3★ stays" },
  { id: "deluxe", label: "Deluxe", stars: 4, factor: 1.18, blurb: "4★ hotels with better views" },
  { id: "premium", label: "Premium", stars: 5, factor: 1.42, blurb: "5★ resorts & signature stays" },
];

export const DEPARTURE_CITIES = [
  "Delhi",
  "Mumbai",
  "Bengaluru",
  "Kolkata",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Ahmedabad",
  "Chandigarh",
  "Jaipur",
  "Lucknow",
  "Own arrangement",
];

// [themes, hotel stars, best months, difficulty, meal plan, pickup point, flights?]
const RAW_META = {
  "ladakh-escape": [["mountains", "adventure"], 3, "May – Sep", "Moderate", "Breakfast & dinner", "Leh Airport (IXL)", false],
  "himachal-honeymoon": [["honeymoon", "mountains"], 4, "Mar – Jun, Oct – Dec", "Easy", "Breakfast & dinner", "Chandigarh / Delhi", false],
  "rajasthan-heritage": [["heritage", "family"], 4, "Oct – Mar", "Easy", "Breakfast", "Jaipur Airport (JAI)", false],
  "kerala-backwaters": [["honeymoon", "family", "beaches"], 4, "Sep – Mar", "Easy", "All meals", "Kochi Airport (COK)", false],
  "kashmir-paradise": [["mountains", "honeymoon"], 4, "Apr – Oct", "Easy", "Breakfast & dinner", "Srinagar Airport (SXR)", false],
  "goa-beach-retreat": [["beaches", "family"], 4, "Nov – Mar", "Easy", "Breakfast", "Goa Airport (GOI)", false],
  "spiti-adventure": [["adventure", "mountains"], 3, "Jun – Sep", "Challenging", "All meals", "Manali", false],
  "golden-triangle": [["heritage", "city", "family"], 3, "Oct – Mar", "Easy", "Breakfast", "Delhi Airport (DEL)", false],
  "uttarakhand-char-dham": [["spiritual", "mountains"], 3, "May – Jun, Sep – Oct", "Moderate", "All meals", "Dehradun / Haridwar", false],
  "north-east-explorer": [["wildlife", "adventure"], 3, "Oct – May", "Moderate", "Breakfast", "Guwahati Airport (GAU)", false],
  "andaman-island": [["beaches", "honeymoon", "adventure"], 4, "Oct – May", "Easy", "Breakfast", "Port Blair (IXZ)", false],
  "varanasi-spiritual": [["spiritual", "heritage"], 3, "Oct – Mar", "Easy", "Breakfast", "Varanasi Airport (VNS)", false],
  "gujarat-rann": [["heritage", "wildlife"], 3, "Nov – Feb", "Easy", "All meals", "Bhuj Airport (BHJ)", false],
  "ooty-nilgiris": [["mountains", "family", "honeymoon"], 4, "Mar – Jun, Sep – Nov", "Easy", "Breakfast", "Coimbatore Airport (CJB)", false],
  "dubai-luxury": [["city", "family", "honeymoon"], 5, "Nov – Mar", "Easy", "Breakfast", "Dubai Airport (DXB)", true],
  "nepal-himalayan": [["mountains", "spiritual", "adventure"], 3, "Sep – Nov, Mar – May", "Moderate", "Breakfast", "Kathmandu (KTM)", true],
  "sikkim-darjeeling": [["mountains", "family"], 4, "Mar – Jun, Oct – Dec", "Easy", "Breakfast & dinner", "Bagdogra (IXB)", false],
  "thailand-tropical": [["beaches", "city", "family"], 4, "Nov – Apr", "Easy", "Breakfast", "Bangkok (BKK)", true],
  "bhutan-serenity": [["spiritual", "mountains", "heritage"], 4, "Mar – May, Sep – Nov", "Moderate", "All meals", "Paro Airport (PBH)", true],
  "maldives-paradise": [["honeymoon", "beaches"], 5, "Nov – Apr", "Easy", "All meals", "Malé (MLE)", true],
  "singapore-city": [["city", "family"], 4, "Feb – Apr, Jul – Sep", "Easy", "Breakfast", "Changi Airport (SIN)", true],
  "malaysia-twin": [["city", "beaches", "family"], 4, "Mar – Oct", "Easy", "Breakfast", "Kuala Lumpur (KUL)", true],
  "karnataka-heritage": [["heritage", "family"], 4, "Oct – Feb", "Easy", "Breakfast", "Bengaluru Airport (BLR)", false],
  "punjab-golden": [["spiritual", "heritage"], 3, "Oct – Mar", "Easy", "Breakfast", "Amritsar Airport (ATQ)", false],
  "assam-wildlife": [["wildlife", "adventure"], 3, "Nov – Apr", "Easy", "All meals", "Guwahati Airport (GAU)", false],
  "bali-retreat": [["beaches", "honeymoon", "city"], 4, "Apr – Oct", "Easy", "Breakfast", "Denpasar (DPS)", true],
  "sri-lanka-circle": [["beaches", "heritage", "wildlife"], 4, "Dec – Apr", "Easy", "Breakfast", "Colombo (CMB)", true],
  "mumbai-getaway": [["city", "family"], 4, "Nov – Mar", "Easy", "Breakfast", "Mumbai Airport (BOM)", false],
  "coorg-nature": [["wildlife", "honeymoon", "family"], 3, "Oct – May", "Easy", "Breakfast", "Bengaluru / Mysuru", false],
  "pondicherry-coastal": [["beaches", "heritage", "honeymoon"], 3, "Oct – Mar", "Easy", "Breakfast", "Chennai Airport (MAA)", false],
};

const FALLBACK_META = [["family"], 4, "Year round", "Easy", "Breakfast", "Nearest airport", false];

export function parseDuration(duration = "") {
  const nights = Number.parseInt(String(duration).match(/(\d+)\s*N/i)?.[1] ?? "", 10);
  const days = Number.parseInt(String(duration).match(/(\d+)\s*D/i)?.[1] ?? "", 10);
  const safeNights = Number.isFinite(nights) ? nights : Math.max(1, (days || 3) - 1);
  return { nights: safeNights, days: Number.isFinite(days) ? days : safeNights + 1 };
}

/** Deterministic string hash (stable between server and client renders). */
export function hashString(input = "") {
  let hash = 0;
  const str = String(input);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getPackageMeta(pkg) {
  const [themes, stars, bestTime, difficulty, mealPlan, pickup, flightsIncluded] =
    RAW_META[pkg.id] ?? FALLBACK_META;
  const { nights, days } = parseDuration(pkg.duration);
  const seed = hashString(pkg.id);
  const international = pkg.country !== "India";
  const discount =
    pkg.originalPrice && pkg.originalPrice > pkg.price
      ? Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)
      : 0;

  return {
    themes,
    stars,
    bestTime,
    difficulty,
    mealPlan,
    pickup,
    flightsIncluded,
    nights,
    days,
    international,
    discount,
    bookedThisMonth: 18 + (seed % 61),
    seatsLeft: 3 + (seed % 7),
    viewing: 6 + (seed % 19),
  };
}

let cachedListing;

/** Packages merged with listing metadata (computed once). */
export function getListingPackages() {
  if (!cachedListing) {
    cachedListing = TOUR_PACKAGES.map((pkg) => ({ ...pkg, meta: getPackageMeta(pkg) }));
  }
  return cachedListing;
}

export function getPackagePriceBounds() {
  const prices = TOUR_PACKAGES.map((p) => p.price);
  const min = Math.floor(Math.min(...prices) / 1000) * 1000;
  const max = Math.ceil(Math.max(...prices) / 5000) * 5000;
  return { min, max };
}
