"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildListingsUrlPreservingFilters,
  enrichListingsTripFromPath,
  fillMissingListingsTripDefaults,
  loadTripSearch,
  mergeTripFromUrlAndSession,
  tripParamsNeedSync,
} from "@/lib/bookingSearch";
import { isListingsSlugPath, parseListingsSlugPath } from "@/lib/listingsSlug";

export default function ListingsTripHydrator() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSynced = useRef("");

  useEffect(() => {
    if (!isListingsSlugPath(pathname) && pathname !== "/listings") return;

    const slug = parseListingsSlugPath(pathname);
    const session = loadTripSearch();
    const merged = mergeTripFromUrlAndSession(searchParams, session, pathname);
    const hasUrlDates =
      searchParams.has("checkIn") && searchParams.has("checkOut");
    const hasUrlGuests =
      searchParams.has("adults") && searchParams.has("rooms");
    const hasLocation = Boolean(
      merged.city || merged.state || merged.locationSlug || slug?.locationSlug
    );

    if (!hasLocation && !hasUrlDates) return;

    let trip = merged;
    if (!trip.locationSlug && slug?.locationSlug) {
      trip = { ...trip, locationSlug: slug.locationSlug };
    }
    if (hasLocation && (!hasUrlDates || !hasUrlGuests)) {
      trip = fillMissingListingsTripDefaults({
        ...trip,
        checkIn: hasUrlDates ? trip.checkIn : null,
        checkOut: hasUrlDates ? trip.checkOut : null,
        guests: hasUrlGuests ? trip.guests : undefined,
      });
    }

    if (!tripParamsNeedSync(searchParams, trip, pathname)) return;

    const nextUrl = buildListingsUrlPreservingFilters(
      searchParams,
      enrichListingsTripFromPath(pathname, trip)
    );
    if (lastSynced.current === nextUrl) return;
    lastSynced.current = nextUrl;

    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
