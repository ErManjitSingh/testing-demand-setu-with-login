"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import BookingDateRangePicker from "@/components/booking/BookingDateRangePicker";
import GuestsRoomsPicker from "@/components/booking/GuestsRoomsPicker";
import StateCityLocationField from "@/components/location/StateCityLocationField";
import {
  markListingsScrollIntent,
  scrollToListingsResults,
} from "@/components/listings/ListingsScrollToResults";
import { useTripLocationSearch } from "@/hooks/useTripLocationSearch";
import { parseDateParam } from "@/lib/dates";
import {
  DEFAULT_GUESTS,
  enrichListingsTripFromPath,
  listingsSearchWillNavigate,
  loadTripSearch,
  parseGuestsFromParams,
  parseListingsUrl,
  persistTripSearch,
  validateTripSearch,
} from "@/lib/bookingSearch";
import { fromLocationSlug, isListingsSlugPath, parseListingsSlugPath, toLocationSlug } from "@/lib/listingsSlug";

function guestsFromParts(adults, children, rooms) {
  return {
    adults: adults ?? DEFAULT_GUESTS.adults,
    children: children ?? DEFAULT_GUESTS.children,
    rooms: rooms ?? DEFAULT_GUESTS.rooms,
  };
}

/** Read trip from slug path + query. */
function readTripFromUrl(pathname, searchParams) {
  const trip = isListingsSlugPath(pathname)
    ? parseListingsUrl(pathname, searchParams)
    : {
        city: searchParams.get("city")?.trim() || "",
        state: searchParams.get("state")?.trim() || "",
        checkIn: parseDateParam(searchParams.get("checkIn")),
        checkOut: parseDateParam(searchParams.get("checkOut")),
        guests: parseGuestsFromParams(searchParams),
      };
  return trip;
}

function slugDisplayName(pathname, locationSlug = "") {
  const slug = parseListingsSlugPath(pathname);
  if (slug?.locationName) return slug.locationName;
  return fromLocationSlug(locationSlug);
}

export default function ListingsHeroSearch({
  category,
  initialCity = "",
  initialState = "",
  initialLocationKind = null,
  initialCheckIn = "",
  initialCheckOut = "",
  initialAdults = DEFAULT_GUESTS.adults,
  initialChildren = DEFAULT_GUESTS.children,
  initialRooms = DEFAULT_GUESTS.rooms,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryKey = `${pathname}?${searchParams.toString()}`;
  const { resolveLocation, logSearch } = useTripLocationSearch();
  const slugInfo = isListingsSlugPath(pathname) ? parseListingsSlugPath(pathname) : null;

  const serverFallback = useMemo(
    () => ({
      city: initialCity,
      state: initialState,
      locationKind:
        initialLocationKind ||
        (initialState ? "state" : initialCity ? "city" : null),
      checkIn: parseDateParam(initialCheckIn),
      checkOut: parseDateParam(initialCheckOut),
      guests: guestsFromParts(initialAdults, initialChildren, initialRooms),
    }),
    [
      initialCity,
      initialState,
      initialLocationKind,
      initialCheckIn,
      initialCheckOut,
      initialAdults,
      initialChildren,
      initialRooms,
    ]
  );

  const [query, setQuery] = useState(
    initialCity || initialState || slugInfo?.locationName || ""
  );
  const [city, setCity] = useState(initialCity);
  const [state, setState] = useState(initialState);
  const [locationKind, setLocationKind] = useState(serverFallback.locationKind);
  const [checkIn, setCheckIn] = useState(serverFallback.checkIn);
  const [checkOut, setCheckOut] = useState(serverFallback.checkOut);
  const [guests, setGuests] = useState(serverFallback.guests);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(false);
  }, [queryKey]);

  useEffect(() => {
    if (!isSearching) return undefined;
    const timer = window.setTimeout(() => setIsSearching(false), 3000);
    return () => window.clearTimeout(timer);
  }, [isSearching]);

  useEffect(() => {
    const fromUrl = readTripFromUrl(pathname, searchParams);
    const session = loadTripSearch();
    const hasUrlQueryLocation = Boolean(fromUrl.city || fromUrl.state);
    const hasUrlDates =
      searchParams.has("checkIn") && searchParams.has("checkOut");
    const hasUrlGuests = searchParams.has("adults");

    const applyNormalizedLocation = (cityVal, stateVal, kindVal) => {
      const normalized = resolveLocation({
        city: cityVal,
        state: stateVal,
        kind: kindVal,
      });
      setCity(normalized.city);
      setState(normalized.state);
      setLocationKind(normalized.kind);
      setQuery(normalized.city || normalized.state);
    };

    const pathSlug = fromUrl.locationSlug || slugInfo?.locationSlug || "";
    const sessionSlug = session
      ? toLocationSlug(session.city || session.state || session.locationSlug || "")
      : "";
    const sessionDiffersFromPath =
      Boolean(pathSlug && sessionSlug && sessionSlug !== pathSlug) &&
      Boolean(session?.city || session?.state);

    if (sessionDiffersFromPath) {
      applyNormalizedLocation(
        session.city,
        session.state,
        session.locationKind || (session.state && !session.city ? "state" : "city")
      );
    } else if (hasUrlQueryLocation) {
      applyNormalizedLocation(
        fromUrl.city,
        fromUrl.state,
        fromUrl.locationKind || (fromUrl.state ? "state" : "city")
      );
    } else if (serverFallback.city || serverFallback.state) {
      applyNormalizedLocation(
        serverFallback.city,
        serverFallback.state,
        serverFallback.locationKind
      );
    } else if (session?.city || session?.state) {
      applyNormalizedLocation(
        session.city,
        session.state,
        session.locationKind || (session.state ? "state" : "city")
      );
    } else if (fromUrl.locationSlug) {
      setQuery(slugDisplayName(pathname, fromUrl.locationSlug));
    } else if (session?.locationSlug) {
      setQuery(fromLocationSlug(session.locationSlug));
    }

    if (hasUrlDates) {
      setCheckIn(fromUrl.checkIn);
      setCheckOut(fromUrl.checkOut);
    } else if (session?.checkIn && session?.checkOut) {
      setCheckIn(session.checkIn);
      setCheckOut(session.checkOut);
    } else {
      setCheckIn(serverFallback.checkIn);
      setCheckOut(serverFallback.checkOut);
    }

    if (hasUrlGuests) {
      setGuests(fromUrl.guests);
    } else {
      setGuests(session?.guests || serverFallback.guests);
    }
  }, [pathname, queryKey, searchParams, serverFallback, resolveLocation]);

  const syncTripEdit = useCallback(
    (overrides = {}) => {
      const normalized = resolveLocation({
        city: overrides.city !== undefined ? overrides.city : city,
        state: overrides.state !== undefined ? overrides.state : state,
        kind: overrides.locationKind ?? locationKind,
      });
      const nextTrip = enrichListingsTripFromPath(pathname, {
        category: category || "all",
        city: normalized.city,
        state: normalized.state,
        locationKind: normalized.kind,
        checkIn: overrides.checkIn !== undefined ? overrides.checkIn : checkIn,
        checkOut: overrides.checkOut !== undefined ? overrides.checkOut : checkOut,
        guests: overrides.guests !== undefined ? overrides.guests : guests,
      });

      if (nextTrip.checkIn && nextTrip.checkOut) {
        persistTripSearch(nextTrip, { router, pathname, searchParams });
      }
    },
    [
      category,
      checkIn,
      checkOut,
      city,
      guests,
      locationKind,
      pathname,
      resolveLocation,
      router,
      searchParams,
      state,
    ]
  );

  const onLocationSelect = ({ city: c, state: s, kind }) => {
    const normalized = resolveLocation({ city: c, state: s, kind });
    setCity(normalized.city);
    setState(normalized.state);
    setLocationKind(normalized.kind);
    setQuery(normalized.city || normalized.state);
    if (searchError) setSearchError("");
    syncTripEdit({
      city: normalized.city,
      state: normalized.state,
      locationKind: normalized.kind,
    });
  };

  const handleSearch = () => {
    const fromUrl = readTripFromUrl(pathname, searchParams);
    const normalized = resolveLocation({ city, state, kind: locationKind });
    const trip = enrichListingsTripFromPath(pathname, {
      category: category || "all",
      city: normalized.city,
      state: normalized.state,
      locationKind: normalized.kind,
      checkIn,
      checkOut,
      guests,
    });

    const err = validateTripSearch(trip);
    if (err) {
      setSearchError(err);
      return;
    }

    setSearchError("");
    setCity(trip.city);
    setState(trip.state);
    setLocationKind(normalized.kind);
    setQuery(trip.city || trip.state || slugDisplayName(pathname, fromUrl.locationSlug));
    logSearch("listings-page-search", trip);
    const willNavigate = listingsSearchWillNavigate(pathname, searchParams, trip);
    markListingsScrollIntent();
    persistTripSearch(trip, { router, pathname, searchParams });
    scrollToListingsResults();
    setIsSearching(willNavigate);
  };

  return (
    <div id="listings-search" className="relative z-20 w-full scroll-mt-28 overflow-visible">
      <div className="relative z-20 w-full overflow-visible rounded-[2rem] bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.25)] ring-1 ring-white/80 sm:rounded-full sm:p-1.5">
        <div className="flex flex-col overflow-visible sm:flex-row sm:items-center">
          <div className="relative z-40 min-w-0 flex-1 py-0.5 sm:pl-1">
            <StateCityLocationField
              compact
              value={query}
              city={city}
              state={state}
              onChange={setQuery}
              onSelect={onLocationSelect}
              placeholder="Search city or state"
              label="Where"
            />
          </div>
          <Divider />
          <div className="relative z-30 min-w-0 flex-1 overflow-visible">
            <BookingDateRangePicker
              variant="combined"
              heroLayout
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={({ checkIn: ci, checkOut: co }) => {
                const nextCheckIn = ci !== undefined ? ci : checkIn;
                const nextCheckOut = co !== undefined ? co : checkOut;
                if (ci !== undefined) setCheckIn(ci);
                if (co !== undefined) setCheckOut(co);
                if (searchError) setSearchError("");
                if (nextCheckIn && nextCheckOut) {
                  syncTripEdit({ checkIn: nextCheckIn, checkOut: nextCheckOut });
                }
              }}
            />
          </div>
          <Divider />
          <div className="relative z-30 min-w-0 flex-1 overflow-visible">
            <GuestsRoomsPicker
              value={guests}
              onChange={(nextGuests) => {
                setGuests(nextGuests);
                syncTripEdit({ guests: nextGuests });
              }}
              label="Guests & Rooms"
              heroLayout
              defaultLocation={city || state || query}
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-orange-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand/35 transition hover:brightness-105 active:scale-[0.99] disabled:cursor-wait disabled:opacity-90 sm:mt-0 sm:min-w-[160px] sm:rounded-full sm:px-6"
          >
            {isSearching ? (
              <>
                <LoadingSpinner />
                <span className="whitespace-nowrap">Searching…</span>
              </>
            ) : (
              <>
                <SearchIcon />
                <span className="whitespace-nowrap">Search stays</span>
              </>
            )}
          </button>
        </div>
      </div>

      {searchError && (
        <p className="mt-2 text-center text-xs font-semibold text-red-300 sm:text-sm">
          {searchError}
        </p>
      )}

      {isSearching ? (
        <p className="mt-2 flex items-center justify-center gap-2 text-center text-xs font-semibold text-white/90 sm:text-sm">
          <LoadingSpinner className="h-4 w-4" />
          Finding stays for you…
        </p>
      ) : null}
    </div>
  );
}

function Divider() {
  return (
    <div className="mx-4 h-px bg-stone-200 sm:mx-0 sm:h-auto sm:w-px sm:self-stretch sm:bg-stone-200" />
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function LoadingSpinner({ className = "h-5 w-5" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
