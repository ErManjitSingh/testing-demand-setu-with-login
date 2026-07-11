import { parseHotelIdFromSlug } from "@/lib/hotelListingsApi";
import { CATEGORY_TO_SEGMENT, toLocationSlug } from "@/lib/listingsSlug";

const PROPERTY_PATH_RE =
  /^\/(explore|stays|hotels|hotel|airbnb|homestay|villa|villas)\/([^/]+)\/([^/]+)(?:\/book)?$/;

export function buildPropertySegment(listing) {
  const hotelId =
    listing?.hotelId || parseHotelIdFromSlug(listing?.slug || "");
  if (hotelId) {
    return toLocationSlug(listing?.title) || "property";
  }
  return String(listing?.slug || "").trim();
}

export function propertyNameMatchesSegment(listing, propertySegment) {
  const segment = String(propertySegment || "").trim().toLowerCase();
  if (!segment) return false;
  if (buildPropertySegment(listing).toLowerCase() === segment) return true;

  const titleSlug = toLocationSlug(listing?.title).toLowerCase();
  if (titleSlug && (titleSlug === segment || segment.startsWith(`${titleSlug}-`))) {
    return true;
  }

  const listingHotelId =
    listing?.hotelId || parseHotelIdFromSlug(listing?.slug || "");
  if (listingHotelId) {
    const parsed = parsePropertySegment(propertySegment);
    if (parsed.hotelId && parsed.hotelId === listingHotelId) return true;
  }

  const listingSlug = String(listing?.slug || "").trim().toLowerCase();
  return listingSlug && listingSlug === segment;
}

/** True when the URL property segment points at the same listing. */
export function propertyRouteSegmentMatches(routeSegment, listing) {
  return propertyNameMatchesSegment(listing, routeSegment);
}

export function parsePropertySegment(segment) {
  const value = String(segment || "").trim();
  if (!value) return { internalSlug: "", hotelId: null };

  const idMatch = value.match(/-([a-f0-9]{24})$/i);
  if (idMatch) {
    return { internalSlug: `hotel-${idMatch[1]}`, hotelId: idMatch[1] };
  }

  if (value.startsWith("hotel-")) {
    const hotelId = parseHotelIdFromSlug(value);
    return { internalSlug: value, hotelId };
  }

  return { internalSlug: value, hotelId: parseHotelIdFromSlug(value) };
}

export function getPropertyLocationSlug(listing, trip = {}) {
  const city = String(
    listing?.propertyCity ||
      listing?.city ||
      listing?.location?.split(",")[0]?.trim() ||
      trip.city ||
      ""
  ).trim();
  const state = String(
    listing?.propertyState ||
      listing?.region ||
      listing?.location?.split(",")[1]?.trim() ||
      trip.state ||
      ""
  ).trim();

  if (city) return toLocationSlug(city);
  if (state) return toLocationSlug(state);
  const tripSlug = String(trip.locationSlug || "").trim();
  if (tripSlug) return toLocationSlug(tripSlug);
  return "india";
}

export function buildPropertyPath(listing, trip = {}) {
  const category = listing?.category || trip?.category || "hotel";
  const segment = CATEGORY_TO_SEGMENT[category] ?? "hotels";
  const locationSlug = getPropertyLocationSlug(listing, trip);
  const propertySegment = buildPropertySegment(listing);

  return `/${segment}/${locationSlug}/${propertySegment}`;
}

export function isPropertySlugPath(pathname) {
  return PROPERTY_PATH_RE.test(String(pathname || "").split("?")[0]);
}

export function isPropertyBookSlugPath(pathname) {
  const path = String(pathname || "").split("?")[0];
  return PROPERTY_PATH_RE.test(path.replace(/\/book$/, "")) && path.endsWith("/book");
}

export function parsePropertySlugPath(pathname) {
  const path = String(pathname || "").split("?")[0];
  const isBook = path.endsWith("/book");
  const base = isBook ? path.slice(0, -"/book".length) : path;
  const match = base.match(
    /^\/(stays|hotels|hotel|airbnb|homestay|villa|villas)\/([^/]+)\/([^/]+)$/
  );
  if (!match) return null;

  const parsed = parsePropertySegment(match[3]);
  return {
    categorySegment: match[1],
    locationSlug: match[2],
    propertySegment: match[3],
    internalSlug: parsed.internalSlug,
    hotelId: parsed.hotelId,
    isBook,
  };
}

/** Normalize listing object or legacy slug string for URL builders. */
export function normalizeListingRef(listingOrSlug) {
  if (listingOrSlug && typeof listingOrSlug === "object") {
    return listingOrSlug;
  }
  const slug = String(listingOrSlug || "").trim();
  return slug ? { slug } : { slug: "" };
}
