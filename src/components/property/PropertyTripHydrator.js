"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildPropertyUrlPreservingTrip,
  fillMissingListingsTripDefaults,
  loadTripSearch,
  mergeTripFromUrlAndSession,
  preferSessionBookingDates,
  saveTripSearch,
  tripParamsNeedSync,
} from "@/lib/bookingSearch";
import { parsePropertySlugPath } from "@/lib/propertySlug";

function PropertyTripHydratorClient({
  listing,
  propertyState = "",
  propertyCity = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSynced = useRef("");

  useEffect(() => {
    const parsed = parsePropertySlugPath(pathname);
    const legacyMatch = pathname.match(/^\/property\/([^/]+)$/);
    const internalSlug = parsed?.internalSlug || legacyMatch?.[1] || "";
    if (!internalSlug || !listing) return;

    const session = loadTripSearch();
    let merged = mergeTripFromUrlAndSession(searchParams, session, pathname);
    merged = preferSessionBookingDates(merged, session, searchParams);

    const anchorCity = String(propertyCity || "").trim();
    const anchorState = String(propertyState || "").trim();
    if (anchorCity || anchorState) {
      merged = {
        ...merged,
        city: anchorCity,
        state: anchorState,
        locationKind: anchorCity ? "city" : anchorState ? "state" : merged.locationKind,
      };
    } else if (!merged.city && !merged.state) {
      if (anchorState) merged = { ...merged, state: anchorState };
      else if (anchorCity) merged = { ...merged, city: anchorCity };
    }

    if (!merged.category || merged.category === "all") {
      merged = { ...merged, category: listing.category || merged.category };
    }

    const hasLocation = Boolean(merged.city || merged.state);
    const hasDates = Boolean(merged.checkIn && merged.checkOut);

    if (!hasLocation && !hasDates) return;

    const trip =
      (hasLocation || hasDates) && !hasDates
        ? fillMissingListingsTripDefaults(merged)
        : merged;

    if (session) {
      saveTripSearch({
        ...session,
        checkIn: trip.checkIn,
        checkOut: trip.checkOut,
        guests: trip.guests,
        category: trip.category || session.category,
      });
    }

    if (!tripParamsNeedSync(searchParams, trip, pathname)) return;

    const nextUrl = buildPropertyUrlPreservingTrip(searchParams, listing, trip);
    if (lastSynced.current === nextUrl) return;
    lastSynced.current = nextUrl;

    router.replace(nextUrl, { scroll: false });
  }, [listing, pathname, propertyCity, propertyState, router, searchParams]);

  return null;
}

export default function PropertyTripHydrator({
  listing,
  propertyState = "",
  propertyCity = "",
}) {
  return (
    <Suspense fallback={null}>
      <PropertyTripHydratorClient
        listing={listing}
        propertyState={propertyState}
        propertyCity={propertyCity}
      />
    </Suspense>
  );
}
