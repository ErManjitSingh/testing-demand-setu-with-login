"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BookingDateRangePicker from "@/components/booking/BookingDateRangePicker";
import GuestsRoomsPicker from "@/components/booking/GuestsRoomsPicker";
import MobilePickerSheet from "@/components/booking/MobilePickerSheet";
import StateCityLocationField from "@/components/location/StateCityLocationField";
import { useTripSearch } from "@/hooks/useTripSearch";
import { useTripLocationSearch } from "@/hooks/useTripLocationSearch";
import {
  buildListingsSearchUrl,
  DEFAULT_GUESTS,
  persistTripSearch,
  validateTripSearch,
} from "@/lib/bookingSearch";
import { isPropertySlugPath } from "@/lib/propertySlug";

function HeaderSearchBarClient({
  defaultLocation = "",
  defaultState = "",
  defaultCity = "",
  category = "all",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trip = useTripSearch({
    category,
    city: defaultCity || defaultLocation,
    state: defaultState,
  });
  const { resolveLocation, logSearch } = useTripLocationSearch();

  const fallbackQuery = defaultCity || defaultState || defaultLocation;
  const [checkIn, setCheckIn] = useState(trip.checkIn);
  const [checkOut, setCheckOut] = useState(trip.checkOut);
  const [guests, setGuests] = useState(trip.guests || { ...DEFAULT_GUESTS });
  const [query, setQuery] = useState(trip.city || trip.state || fallbackQuery);
  const [city, setCity] = useState(trip.city || defaultCity || "");
  const [state, setState] = useState(trip.state || defaultState || "");
  const [locationKind, setLocationKind] = useState(
    trip.locationKind ||
      (trip.state || defaultState ? "state" : trip.city || defaultCity ? "city" : null)
  );
  const [editOpen, setEditOpen] = useState(false);
  const [searchError, setSearchError] = useState("");

  const isPropertyPage =
    /^\/property\/[^/]+$/.test(pathname) ||
    (isPropertySlugPath(pathname) && !pathname.endsWith("/book"));
  const propertyCity = defaultCity || "";
  const propertyState = defaultState || "";
  const usePropertyLocation = isPropertyPage && (propertyCity || propertyState);

  const resolvedCity = usePropertyLocation ? propertyCity : trip.city || defaultCity || "";
  const resolvedState = usePropertyLocation ? propertyState : trip.state || defaultState || "";
  const tripLocation = resolvedCity || resolvedState || fallbackQuery;
  const tripCheckInKey = trip.checkIn?.getTime() ?? 0;
  const tripCheckOutKey = trip.checkOut?.getTime() ?? 0;
  const tripGuestsKey = `${trip.guests.adults}-${trip.guests.children}-${trip.guests.rooms}`;

  useEffect(() => {
    setQuery((prev) => (prev === tripLocation ? prev : tripLocation));
    setCity(resolvedCity);
    setState(resolvedState);
    setLocationKind(
      trip.locationKind ||
        (resolvedState && !resolvedCity
          ? "state"
          : resolvedCity
            ? "city"
            : null)
    );
    if (trip.checkIn) {
      setCheckIn((prev) =>
        prev?.getTime() === trip.checkIn.getTime() ? prev : trip.checkIn
      );
    }
    if (trip.checkOut) {
      setCheckOut((prev) =>
        prev?.getTime() === trip.checkOut.getTime() ? prev : trip.checkOut
      );
    }
    setGuests((prev) => {
      const next = trip.guests;
      if (
        prev.adults === next.adults &&
        prev.children === next.children &&
        prev.rooms === next.rooms
      ) {
        return prev;
      }
      return next;
    });
  }, [
    tripLocation,
    resolvedCity,
    resolvedState,
    fallbackQuery,
    tripCheckInKey,
    tripCheckOutKey,
    tripGuestsKey,
    trip.locationKind,
  ]);

  const syncTripEdit = useCallback(
    (overrides = {}) => {
      const loc = resolveLocation({
        city: overrides.city !== undefined ? overrides.city : city,
        state: overrides.state !== undefined ? overrides.state : state,
        kind: overrides.locationKind ?? locationKind,
      });
      const nextTrip = {
        category: category || trip.category || "all",
        city: loc.city,
        state: loc.state,
        locationKind: loc.kind,
        checkIn: overrides.checkIn !== undefined ? overrides.checkIn : checkIn,
        checkOut: overrides.checkOut !== undefined ? overrides.checkOut : checkOut,
        guests: overrides.guests !== undefined ? overrides.guests : guests,
      };
      if (nextTrip.checkIn && nextTrip.checkOut) {
        persistTripSearch(nextTrip, { router, pathname, searchParams });
      }
    },
    [
      category,
      trip.category,
      city,
      state,
      locationKind,
      checkIn,
      checkOut,
      guests,
      router,
      pathname,
      searchParams,
      resolveLocation,
    ]
  );

  const onLocationSelect = useCallback(
    ({ city: c, state: s, kind }) => {
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
    },
    [searchError, syncTripEdit, resolveLocation]
  );

  const runSearch = () => {
    const normalized = resolveLocation({ city, state, kind: locationKind });
    const nextTrip = {
      category: category || trip.category || "all",
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
    const isProductPage =
      /^\/property\/[^/]+$/.test(pathname) || isPropertySlugPath(pathname);
    logSearch(isProductPage ? "product-page-search" : "header-search", nextTrip);
    persistTripSearch(nextTrip);

    router.push(
      buildListingsSearchUrl({
        category: nextTrip.category,
        city: nextTrip.city,
        state: nextTrip.state,
        checkIn,
        checkOut,
        guests,
      })
    );
    setEditOpen(false);
  };

  const displayLocation = query.trim() || "Search city or state...";

  const locationField = (
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
  );

  return (
    <>
      <div className="relative z-20 w-full overflow-visible rounded-2xl border border-border/80 bg-white p-1.5 shadow-md ring-1 ring-stone-900/5 sm:rounded-full sm:p-1">
        <div className="flex items-center gap-3 px-2 py-1 sm:hidden">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
            <PinIcon />
          </span>
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-brand">
              Location
            </span>
            <p className="truncate text-sm font-bold text-foreground">{displayLocation}</p>
            {searchError && (
              <p className="truncate text-[10px] font-semibold text-red-600">{searchError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="shrink-0 rounded-full border-2 border-brand bg-white px-4 py-2 text-xs font-bold text-brand transition hover:bg-brand-muted active:scale-[0.98]"
          >
            Edit
          </button>
        </div>

        <div className="hidden overflow-visible sm:flex sm:flex-row sm:items-center">
          <div className="relative z-40 min-w-0 flex-1 rounded-xl py-1 transition hover:bg-stone-50 sm:rounded-l-full sm:pl-1">
            {locationField}
          </div>

          <Divider />

          <div className="relative z-30 min-w-0 flex-1 overflow-visible">
            <BookingDateRangePicker
              variant="combined"
              heroLayout
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={({ checkIn: ci, checkOut: co }) => {
                const nextIn = ci !== undefined ? ci : checkIn;
                const nextOut = co !== undefined ? co : checkOut;
                if (ci !== undefined) setCheckIn(ci);
                if (co !== undefined) setCheckOut(co);
                if (searchError) setSearchError("");
                syncTripEdit({ checkIn: nextIn, checkOut: nextOut });
              }}
              className="[&_button]:py-2.5"
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
              className="[&_button]:py-2.5"
              defaultLocation={city || state || query}
            />
          </div>

          <button
            type="button"
            onClick={runSearch}
            className="flex min-w-[130px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-brand/30 transition hover:brightness-105 active:scale-[0.99]"
          >
            <SearchIcon />
            <span className="whitespace-nowrap">Search stays</span>
          </button>
        </div>
      </div>

      <MobilePickerSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit your search"
      >
        <div className="space-y-3">
          <div className="overflow-visible rounded-2xl border border-stone-200 bg-stone-50/80 px-2 py-2">
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

          <div className="overflow-hidden rounded-2xl border border-stone-200">
            <BookingDateRangePicker
              variant="combined"
              heroLayout
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={({ checkIn: ci, checkOut: co }) => {
                const nextIn = ci !== undefined ? ci : checkIn;
                const nextOut = co !== undefined ? co : checkOut;
                if (ci !== undefined) setCheckIn(ci);
                if (co !== undefined) setCheckOut(co);
                if (searchError) setSearchError("");
                syncTripEdit({ checkIn: nextIn, checkOut: nextOut });
              }}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-stone-200">
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

          {searchError && (
            <p className="text-center text-xs font-semibold text-red-600">{searchError}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="flex-1 rounded-xl border border-stone-200 py-3 text-sm font-bold text-foreground"
            >
              Done
            </button>
            <button
              type="button"
              onClick={runSearch}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-orange-500 py-3 text-sm font-bold text-white shadow-md shadow-brand/30"
            >
              <SearchIcon />
              Search stays
            </button>
          </div>
        </div>
      </MobilePickerSheet>
    </>
  );
}

export default function HeaderSearchBar(props) {
  return (
    <Suspense
      fallback={
        <div className="h-14 animate-pulse rounded-2xl bg-stone-200 sm:rounded-full" />
      }
    >
      <HeaderSearchBarClient {...props} />
    </Suspense>
  );
}

function Divider() {
  return <div className="mx-0 h-auto w-px self-stretch bg-stone-200" />;
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}
