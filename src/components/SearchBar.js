"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BookingDateRangePicker from "@/components/booking/BookingDateRangePicker";
import GuestsRoomsPicker from "@/components/booking/GuestsRoomsPicker";
import StateCityLocationField from "@/components/location/StateCityLocationField";
import { useTripSearch } from "@/hooks/useTripSearch";
import { useTripLocationSearch } from "@/hooks/useTripLocationSearch";
import { getDefaultBookingDates } from "@/lib/dates";
import {
  buildListingsSearchUrl,
  DEFAULT_GUESTS,
  persistTripSearch,
  validateTripSearch,
} from "@/lib/bookingSearch";
import { markListingsScrollIntent } from "@/components/listings/ListingsScrollToResults";

function SearchBarClient({
  compact = false,
  elevated = false,
  category,
  listingsPage = false,
  defaultBookingDates = false,
  defaultCity = "",
  defaultState = "",
}) {
  const router = useRouter();
  const tripFallback = useMemo(
    () => ({
      category,
      city: defaultCity,
      state: defaultState,
    }),
    [category, defaultCity, defaultState]
  );
  const trip = useTripSearch(tripFallback);
  const tripRef = useRef(trip);
  tripRef.current = trip;
  const { resolveLocation, logSearch } = useTripLocationSearch();
  const [checkIn, setCheckIn] = useState(() =>
    defaultBookingDates ? getDefaultBookingDates().checkIn : null
  );
  const [checkOut, setCheckOut] = useState(() =>
    defaultBookingDates ? getDefaultBookingDates().checkOut : null
  );
  const [guests, setGuests] = useState(trip.guests || { ...DEFAULT_GUESTS });
  const [query, setQuery] = useState(trip.city || trip.state || "");
  const [city, setCity] = useState(trip.city || "");
  const [state, setState] = useState(trip.state || "");
  const [locationKind, setLocationKind] = useState(
    trip.locationKind || (trip.state ? "state" : trip.city ? "city" : null)
  );
  const [searchError, setSearchError] = useState("");

  const tripSyncKey = [
    trip.city || "",
    trip.state || "",
    trip.locationKind || "",
    trip.checkIn?.getTime() ?? 0,
    trip.checkOut?.getTime() ?? 0,
    `${trip.guests.adults}-${trip.guests.children}-${trip.guests.rooms}`,
  ].join("|");

  useEffect(() => {
    const currentTrip = tripRef.current;
    const tripLocation = currentTrip.city || currentTrip.state || "";
    const tripCheckInKey = currentTrip.checkIn?.getTime() ?? 0;
    const tripCheckOutKey = currentTrip.checkOut?.getTime() ?? 0;

    setQuery((prev) => (prev === tripLocation ? prev : tripLocation));
    setCity((prev) => {
      const next = currentTrip.city || "";
      return prev === next ? prev : next;
    });
    setState((prev) => {
      const next = currentTrip.state || "";
      return prev === next ? prev : next;
    });
    setLocationKind((prev) => {
      const next =
        currentTrip.locationKind ||
        (currentTrip.state ? "state" : currentTrip.city ? "city" : null);
      return prev === next ? prev : next;
    });

    if (tripCheckInKey) {
      setCheckIn((prev) =>
        prev?.getTime() === tripCheckInKey ? prev : currentTrip.checkIn
      );
    }
    if (tripCheckOutKey) {
      setCheckOut((prev) =>
        prev?.getTime() === tripCheckOutKey ? prev : currentTrip.checkOut
      );
    }

    setGuests((prev) => {
      const next = currentTrip.guests;
      if (
        prev.adults === next.adults &&
        prev.children === next.children &&
        prev.rooms === next.rooms
      ) {
        return prev;
      }
      return next;
    });
  }, [tripSyncKey]);

  const onLocationSelect = ({ city: c, state: s, kind }) => {
    const normalized = resolveLocation({ city: c, state: s, kind });
    setCity(normalized.city);
    setState(normalized.state);
    setLocationKind(normalized.kind);
    setQuery(normalized.city || normalized.state);
    if (searchError) setSearchError("");
  };

  const runSearch = () => {
    const normalized = resolveLocation({ city, state, kind: locationKind });
    const searchCategory =
      category ?? (listingsPage ? trip.category || "all" : "hotel");

    const nextTrip = {
      category: searchCategory,
      city: normalized.city,
      state: normalized.state,
      locationKind: normalized.kind,
      checkIn,
      checkOut,
      guests,
    };

    const err = validateTripSearch(nextTrip);
    if (err) {
      setSearchError(err);
      return;
    }

    setSearchError("");
    setCity(nextTrip.city);
    setState(nextTrip.state);
    setLocationKind(normalized.kind);
    setQuery(nextTrip.city || nextTrip.state);
    logSearch(listingsPage ? "listings-page-search" : "home-search", nextTrip);
    persistTripSearch(nextTrip);
    markListingsScrollIntent();

    router.push(
      buildListingsSearchUrl({
        category: nextTrip.category,
        city: nextTrip.city,
        state: nextTrip.state,
        checkIn,
        checkOut,
        guests,
      }),
      { scroll: false }
    );
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={runSearch}
        className="card-shine group flex w-full items-center gap-4 rounded-2xl border border-white/80 bg-white/90 p-2 pl-2 text-left shadow-xl shadow-stone-300/30 ring-1 ring-stone-900/5 transition hover:shadow-2xl hover:ring-brand/20"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-orange-400 text-white shadow-md shadow-brand/30">
          <SearchIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">Where to next?</p>
          <p className="truncate text-xs text-muted">
            {searchError || query || "Search city or state from our destinations"}
          </p>
        </div>
        <span className="mr-2 hidden rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600 sm:inline">
          Search
        </span>
      </button>
    );
  }

  const shellClass = [
    "rounded-3xl border bg-white/95 p-2 backdrop-blur-xl sm:p-2.5",
    listingsPage
      ? "border-white/90 shadow-[0_28px_70px_-12px_rgba(28,25,23,0.35)] ring-2 ring-white/90"
      : "border-white/60 shadow-2xl shadow-stone-900/10 ring-1 ring-white/80",
    elevated && !listingsPage && "animate-pulse-glow",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`relative z-20 overflow-visible ${shellClass}`}>
      <div className="grid gap-2 overflow-visible sm:grid-cols-[1.3fr_1fr_1fr_auto] sm:gap-0 sm:rounded-2xl sm:bg-stone-50/90 sm:p-1">
        <div className="group rounded-2xl border border-transparent bg-white px-4 py-2.5 shadow-sm transition hover:border-brand/15 hover:bg-white hover:shadow-md sm:rounded-l-xl sm:border-0 sm:bg-transparent sm:py-2.5 sm:shadow-none">
          <StateCityLocationField
            compact
            value={query}
            city={city}
            state={state}
            onChange={setQuery}
            onSelect={onLocationSelect}
            placeholder="Search city or state..."
            label="Where"
          />
        </div>

        <div className="relative z-30 overflow-visible rounded-2xl border border-transparent bg-white shadow-sm sm:rounded-none sm:border-0 sm:bg-transparent sm:shadow-none">
          <BookingDateRangePicker
            variant="combined"
            checkIn={checkIn}
            checkOut={checkOut}
            onChange={({ checkIn: ci, checkOut: co }) => {
              if (ci !== undefined) setCheckIn(ci);
              if (co !== undefined) setCheckOut(co);
              if (searchError) setSearchError("");
            }}
          />
        </div>

        <div className="relative z-30 overflow-visible rounded-2xl border border-transparent bg-white shadow-sm sm:border-0 sm:bg-transparent sm:shadow-none">
          <GuestsRoomsPicker
            value={guests}
            onChange={setGuests}
            label="Guests & Rooms"
            defaultLocation={city || state || query}
          />
        </div>

        <button
          type="button"
          onClick={runSearch}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand via-orange-500 to-amber-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-brand/40 transition hover:brightness-105 active:scale-[0.99] sm:mx-1 sm:my-1 sm:rounded-xl sm:py-3.5"
        >
          <SearchIcon className="h-5 w-5" />
          Search stays
        </button>
      </div>
      {searchError && (
        <p className="mt-2 px-2 text-center text-xs font-semibold text-red-600 sm:text-sm">
          {searchError}
        </p>
      )}
    </div>
  );
}

export default function SearchBar(props) {
  return (
    <Suspense
      fallback={
        <div className="h-24 animate-pulse rounded-3xl bg-white/80 sm:h-20" />
      }
    >
      <SearchBarClient {...props} />
    </Suspense>
  );
}

function SearchIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}
