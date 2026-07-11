"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addDays, getDefaultListingsDirectUrlDates, parseDateParam } from "@/lib/dates";
import {
  DEFAULT_GUESTS,
  hasSearchParam,
  loadTripSearch,
  mergeTripFromUrlAndSession,
  normalizeGuests,
  preferSessionBookingDates,
  TRIP_SEARCH_UPDATED,
} from "@/lib/bookingSearch";
import { isPropertySlugPath } from "@/lib/propertySlug";
import { serializeChildAgesParam } from "@/lib/guestOccupancy";

function guestsKey(guests) {
  const g = normalizeGuests(guests);
  return `${g.adults}-${g.children}-${g.rooms}-${serializeChildAgesParam(g.childAges)}`;
}

/** Resolves trip from URL query params + sessionStorage (session fills missing URL fields). */
export function useTripSearch(serverFallback) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryKey = `${pathname}?${searchParams.toString()}`;
  const [sessionVersion, setSessionVersion] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onUpdate = () => setSessionVersion((v) => v + 1);
    window.addEventListener(TRIP_SEARCH_UPDATED, onUpdate);
    return () => window.removeEventListener(TRIP_SEARCH_UPDATED, onUpdate);
  }, []);

  const fbCategory = String(serverFallback?.category || "all");
  const fbCity = String(serverFallback?.city || "").trim();
  const fbState = String(serverFallback?.state || "").trim();
  const fbCheckIn = String(serverFallback?.checkIn || "").trim();
  const fbCheckOut = String(serverFallback?.checkOut || "").trim();
  const fbGuestsKey = guestsKey(serverFallback?.guests || DEFAULT_GUESTS);

  return useMemo(() => {
    const fallback = {
      category: fbCategory,
      city: fbCity,
      state: fbState,
      checkIn: fbCheckIn ? parseDateParam(fbCheckIn) : null,
      checkOut: fbCheckOut ? parseDateParam(fbCheckOut) : null,
      guests: normalizeGuests(serverFallback?.guests || DEFAULT_GUESTS),
    };

    const session = mounted ? loadTripSearch() : null;
    let merged = mergeTripFromUrlAndSession(searchParams, session, pathname);
    if (session) {
      merged = preferSessionBookingDates(merged, session, searchParams);
    }
    const isPropertyPage =
      (isPropertySlugPath(pathname) && !String(pathname).endsWith("/book")) ||
      /^\/property\/[^/]+$/.test(String(pathname || ""));

    let city = merged.city || "";
    let state = merged.state || "";
    if (isPropertyPage && (fbCity || fbState)) {
      city = fbCity;
      state = fbState;
    } else {
      city = city || fbCity;
      state = state || fbState;
    }

    let checkIn = merged.checkIn || fallback.checkIn || null;
    let checkOut = merged.checkOut || fallback.checkOut || null;

    if (
      isPropertyPage &&
      !hasSearchParam(searchParams, "checkIn") &&
      !hasSearchParam(searchParams, "checkOut") &&
      (!checkIn || !checkOut)
    ) {
      const defaults = getDefaultListingsDirectUrlDates();
      checkIn = checkIn || defaults.checkIn;
      checkOut = checkOut || defaults.checkOut;
      if (!checkOut || checkOut <= checkIn) {
        checkOut = addDays(checkIn, 1);
      }
    }

    return {
      category: merged.category || fallback.category || "all",
      city,
      state,
      locationKind:
        merged.locationKind ||
        (state && !city ? "state" : city ? "city" : null),
      checkIn,
      checkOut,
      guests: normalizeGuests(merged.guests || fallback.guests || DEFAULT_GUESTS),
      locationLabel: city || state || "",
    };
  }, [
    pathname,
    queryKey,
    mounted,
    sessionVersion,
    fbCategory,
    fbCity,
    fbState,
    fbCheckIn,
    fbCheckOut,
    fbGuestsKey,
  ]);
}
