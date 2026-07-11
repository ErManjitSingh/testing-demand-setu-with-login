import { cache } from "react";
import { getListingBySlug } from "@/lib/listings";
import {
  fetchHotelById,
  fetchListingsForLocation,
  mapHotelToListing,
  parseHotelIdFromSlug,
} from "@/lib/hotelListingsApi";
import { resolveLocationFromSlug } from "@/lib/locationResolve";
import {
  parsePropertySegment,
  propertyNameMatchesSegment,
} from "@/lib/propertySlug";

export async function resolvePropertyBySlug(slug) {
  const staticListing = getListingBySlug(slug);
  if (staticListing) {
    return { listing: staticListing, hotel: null, source: "static" };
  }

  const hotelId = parseHotelIdFromSlug(slug);
  if (!hotelId) return null;

  const hotel = await fetchHotelById(hotelId);
  if (!hotel) return null;

  return {
    listing: mapHotelToListing(hotel),
    hotel,
    source: "api",
  };
}

function findListingMatch(listings, propertySegment) {
  return (listings || []).find((item) =>
    propertyNameMatchesSegment(item, propertySegment)
  );
}

async function resolvePropertyBySegments(propertySegment, locationSlug) {
  if (!propertySegment) return null;

  const parsed = parsePropertySegment(propertySegment);
  if (parsed.hotelId) {
    return resolvePropertyBySlug(parsed.internalSlug);
  }

  const staticListing = getListingBySlug(propertySegment);
  if (staticListing) {
    return { listing: staticListing, hotel: null, source: "static" };
  }

  if (!locationSlug) return null;

  const location = await resolveLocationFromSlug(locationSlug);
  const primary = await fetchListingsForLocation({
    city: location.city,
    state: location.state,
  });

  let match = findListingMatch(primary.listings, propertySegment);

  if (!match && location.state) {
    const stateWide = await fetchListingsForLocation({ state: location.state });
    match = findListingMatch(stateWide.listings, propertySegment);
  }

  if (!match && location.city) {
    const cityOnly = await fetchListingsForLocation({ city: location.city });
    match = findListingMatch(cityOnly.listings, propertySegment);
  }

  if (!match) return null;

  const hotelId = match.hotelId || parseHotelIdFromSlug(match.slug);
  if (!hotelId) return null;

  const hotel = await fetchHotelById(hotelId);
  if (!hotel) return null;

  return {
    listing: mapHotelToListing(hotel),
    hotel,
    source: "api",
  };
}

export const resolvePropertyByRouteParams = cache(async (routeParams) => {
  const propertySegment = String(routeParams?.property || "").trim();
  const locationSlug = String(routeParams?.location || "").trim().toLowerCase();
  return resolvePropertyBySegments(propertySegment, locationSlug);
});
