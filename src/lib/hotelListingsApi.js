import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { toLocationSlug } from "@/lib/listingsSlug";
import {
  mapApiPropertyTypeToCategory,
  parseStarRating,
} from "@/lib/listingFilters";
import {
  isValidImageUrl,
  resolveListingImage,
} from "@/lib/listingImages";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toSlug(value, fallback = "hotel") {
  const base = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}

export function mapHotelToListing(hotel) {
  const room = hotel?.rooms?.data?.[0] || {};
  const propertyImages = Array.isArray(hotel?.photosAndVideos?.images)
    ? hotel.photosAndVideos.images
    : [];
  const firstPropertyImage = propertyImages.map(String).find(isValidImageUrl) || "";
  const mandatoryAmenities = hotel?.amenities?.mandatory || {};
  const amenities = Object.entries(mandatoryAmenities)
    .filter(([, val]) => String(val).toLowerCase() === "yes")
    .map(([key]) => key)
    .slice(0, 5);

  const propertyTypeRaw = String(hotel?.basicInfo?.propertyType || "").trim();
  const rawStar = String(hotel?.basicInfo?.hotelStarRating || "");
  const starRating = parseStarRating(rawStar);
  const derivedRating = toNumber(rawStar.replace(/[^\d.]/g, ""), 4.2);
  const roundedRating = Math.min(Math.max(derivedRating, 3.5), 5);
  const displayCategory = mapApiPropertyTypeToCategory(propertyTypeRaw);
  const price = Math.max(toNumber(room?.baseRate, 0), 1000);
  const state = hotel?.location?.state || "India";
  const city = hotel?.location?.city || "";
  const propertyName = String(hotel?.basicInfo?.propertyName || "Hotel Stay").trim();
  const roomImage = String(room?.imageUrl || "").trim();
  const rawImage = isValidImageUrl(firstPropertyImage)
    ? firstPropertyImage
    : isValidImageUrl(roomImage)
      ? roomImage
      : "";
  const heroImage = resolveListingImage(rawImage, displayCategory);
  const categoryFallback = resolveListingImage("", displayCategory);

  return {
    hotelId: String(hotel?._id || ""),
    slug: `hotel-${toSlug(hotel?._id, "property")}`,
    title: propertyName,
    category: displayCategory,
    apiPropertyType: propertyTypeRaw,
    starRating,
    location: city ? `${city}, ${state}` : state,
    region: state,
    propertyCity: city,
    propertyState: state,
    rating: Number(roundedRating.toFixed(1)),
    reviews: 0,
    price,
    originalPrice: null,
    badge: rawStar || "Hotel",
    guests: Math.max(toNumber(room?.maxOccupancy, 2), 2),
    beds: 1,
    baths: 1,
    nights: 1,
    image: heroImage,
    gallery: propertyImages.filter(isValidImageUrl).length
      ? propertyImages.filter(isValidImageUrl)
      : isValidImageUrl(roomImage)
        ? [roomImage]
        : [categoryFallback],
    amenities: amenities.length ? amenities : ["Wifi", "Parking", "Room service"],
    amenityKeys: Object.keys(mandatoryAmenities),
    host: "Demand Setu Partner",
    description:
      hotel?.basicInfo?.propertyDescription ||
      "Comfortable stay with curated amenities and trusted service.",
  };
}

export async function fetchHotelsByState(stateName) {
  try {
    const response = await fetchWithTimeout(
      buildApiUrl(
        `api/packagemaker//get-packagemaker-hotels-by-state/${encodeURIComponent(stateName)}`
      ),
      { next: { revalidate: 300 } }
    );
    if (!response.ok) return [];
    const payload = await response.json();
    if (!payload?.success || !Array.isArray(payload.data)) return [];
    return payload.data.map(mapHotelToListing);
  } catch {
    return [];
  }
}

export async function fetchHotelsByCity(cityName) {
  try {
    const response = await fetchWithTimeout(
      buildApiUrl(
        `api/packagemaker//get-packagemaker-hotels-by-city-pi/${encodeURIComponent(cityName)}`
      ),
      { next: { revalidate: 300 } }
    );
    if (!response.ok) return [];
    const payload = await response.json();
    if (!payload?.success || !Array.isArray(payload.data)) return [];
    return payload.data.map(mapHotelToListing);
  } catch {
    return [];
  }
}

export const HOME_PAGE_STATE = "Himachal Pradesh";

export async function fetchHomePageHotels() {
  return fetchHotelsByState(HOME_PAGE_STATE);
}

export async function fetchHotelsByFilters({
  propertyType = "",
  cityName = "",
  stateName = "",
} = {}) {
  const type = String(propertyType || "").trim();
  const city = String(cityName || "").trim();
  const state = String(stateName || "").trim();

  if (!type || (!city && !state)) return [];

  try {
    const params = new URLSearchParams({ propertyType: type });
    if (city) params.set("cityName", city);
    if (state) params.set("stateName", state);

    const response = await fetchWithTimeout(
      buildApiUrl(`api/packagemaker/get-packagemaker-hotels-by-filters?${params}`),
      { next: { revalidate: 300 } }
    );
    if (!response.ok) return [];
    const payload = await response.json();
    if (!payload?.success || !Array.isArray(payload.data)) return [];
    return payload.data.map(mapHotelToListing);
  } catch {
    return [];
  }
}

const HOTEL_ID_PATTERN = /^[a-f0-9]{24}$/i;

export function parseHotelIdFromSlug(slug) {
  const value = String(slug || "").trim();
  if (!value.startsWith("hotel-")) return null;
  const id = value.slice("hotel-".length);
  return HOTEL_ID_PATTERN.test(id) ? id : null;
}

export async function fetchHotelById(id) {
  const hotelId = String(id || "").trim();
  if (!HOTEL_ID_PATTERN.test(hotelId)) return null;

  try {
    const response = await fetchWithTimeout(
      buildApiUrl(
        `api/packagemaker/get-packagemaker-by-id/${encodeURIComponent(hotelId)}`
      ),
      { next: { revalidate: 300 } }
    );
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload?.success || !payload?.data) return null;
    return payload.data;
  } catch {
    return null;
  }
}

/** Fetches all stays for a city or state (filter by property type on the client). */
export async function fetchListingsForLocation({ city = "", state = "" } = {}) {
  const selectedCity = String(city || "").trim();
  const selectedState = String(state || "").trim();
  const citySlug = toLocationSlug(selectedCity);
  const stateSlug = toLocationSlug(selectedState);
  const sameLocation = Boolean(citySlug && stateSlug && citySlug === stateSlug);

  if (selectedCity && selectedState && !sameLocation) {
    const listings = await fetchHotelsByCity(selectedCity);
    return {
      listings,
      city: selectedCity,
      state: selectedState,
    };
  }

  if (selectedState && !selectedCity) {
    const listings = await fetchHotelsByState(selectedState);
    return { listings, city: "", state: selectedState };
  }

  const lookupName = selectedCity || selectedState;
  if (!lookupName) {
    return { listings: [], city: "", state: "" };
  }

  const [byCity, byState] = await Promise.all([
    fetchHotelsByCity(lookupName),
    fetchHotelsByState(lookupName),
  ]);

  if (byState.length > byCity.length) {
    return { listings: byState, city: "", state: selectedState || lookupName };
  }
  if (byCity.length > 0) {
    return { listings: byCity, city: selectedCity || lookupName, state: "" };
  }
  if (byState.length > 0) {
    return { listings: byState, city: "", state: selectedState || lookupName };
  }

  return { listings: [], city: selectedCity, state: selectedState };
}
