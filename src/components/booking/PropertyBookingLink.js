"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  buildPropertyUrl,
  fillMissingBookingDefaults,
  loadTripSearch,
  mergeTripFromUrlAndSession,
  persistTripSearch,
  preferSessionBookingDates,
  TRIP_SEARCH_UPDATED,
} from "@/lib/bookingSearch";
import { normalizeListingRef } from "@/lib/propertySlug";

function attachListingLocation(trip, listingRef) {
  const listingCity = String(
    listingRef?.propertyCity || listingRef?.city || ""
  ).trim();
  const listingState = String(
    listingRef?.propertyState || listingRef?.region || ""
  ).trim();
  if (!listingCity && !listingState) return trip;
  return {
    ...trip,
    city: listingCity || trip.city,
    state: listingState || trip.state,
  };
}

function buildPropertyNavigationTrip({
  searchParams,
  pathname,
  listingRef,
  requireBooking,
}) {
  const session = loadTripSearch();
  let merged = mergeTripFromUrlAndSession(searchParams, session, pathname);
  merged = preferSessionBookingDates(merged, session, searchParams);
  const resolvedTrip = requireBooking ? fillMissingBookingDefaults(merged) : merged;
  return attachListingLocation(resolvedTrip, listingRef);
}

function getStaticPropertyHref(listingOrSlug, requireBooking) {
  const listing = normalizeListingRef(listingOrSlug);
  const resolved = requireBooking ? fillMissingBookingDefaults({}) : {};
  const listingCity = String(listing?.propertyCity || listing?.city || "").trim();
  const listingState = String(listing?.propertyState || listing?.region || "").trim();
  const trip = {
    ...resolved,
    city: listingCity || resolved.city,
    state: listingState || resolved.state,
  };
  return buildPropertyUrl(listing, trip);
}

function PropertyBookingLinkClient({
  listing,
  slug,
  className,
  children,
  requireBooking = false,
  onBlocked,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sessionVersion, setSessionVersion] = useState(0);
  const listingRef = useMemo(
    () => listing || normalizeListingRef(slug),
    [listing, slug]
  );

  useEffect(() => {
    const onUpdate = () => setSessionVersion((value) => value + 1);
    window.addEventListener(TRIP_SEARCH_UPDATED, onUpdate);
    return () => window.removeEventListener(TRIP_SEARCH_UPDATED, onUpdate);
  }, []);

  const queryKey = searchParams.toString();
  const propertyTrip = useMemo(
    () =>
      buildPropertyNavigationTrip({
        searchParams,
        pathname,
        listingRef,
        requireBooking,
      }),
    [queryKey, searchParams, pathname, listingRef, requireBooking, sessionVersion]
  );
  const href = useMemo(
    () => buildPropertyUrl(listingRef, propertyTrip),
    [listingRef, propertyTrip]
  );

  if (!requireBooking) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  const handleClick = (e) => {
    e.preventDefault();
    const latestTrip = buildPropertyNavigationTrip({
      searchParams,
      pathname,
      listingRef,
      requireBooking,
    });
    persistTripSearch(latestTrip);
    router.push(buildPropertyUrl(listingRef, latestTrip));
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}

export default function PropertyBookingLink(props) {
  const { listing, slug, className, children, requireBooking = false } = props;

  return (
    <Suspense
      fallback={
        <PropertyBookingLinkFallback
          listing={listing}
          slug={slug}
          className={className}
          requireBooking={requireBooking}
        >
          {children}
        </PropertyBookingLinkFallback>
      }
    >
      <PropertyBookingLinkClient {...props} />
    </Suspense>
  );
}

function PropertyBookingLinkFallback({
  listing,
  slug,
  className,
  children,
  requireBooking,
}) {
  const href = getStaticPropertyHref(listing || slug, requireBooking);

  return (
    <Link href={href} className={className} prefetch={false}>
      {children}
    </Link>
  );
}
