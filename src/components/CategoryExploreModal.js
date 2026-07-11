"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookingDateRangePicker from "@/components/booking/BookingDateRangePicker";
import GuestsRoomsPicker from "@/components/booking/GuestsRoomsPicker";
import StateCityLocationField from "@/components/location/StateCityLocationField";
import { useTripLocationSearch } from "@/hooks/useTripLocationSearch";
import { getApiPropertyType } from "@/lib/propertyTypes";
import {
  buildListingsSearchUrl,
  DEFAULT_GUESTS,
  persistTripSearch,
  validateTripSearch,
} from "@/lib/bookingSearch";

export default function CategoryExploreModal({ category, onClose }) {
  const router = useRouter();
  const { resolveLocation, logSearch } = useTripLocationSearch();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [locationKind, setLocationKind] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState({ ...DEFAULT_GUESTS });
  const [error, setError] = useState("");
  const [activePanel, setActivePanel] = useState(null);

  const handlePanelChange = (panel) => (isOpen) => {
    if (isOpen) setActivePanel(panel);
    else setActivePanel((current) => (current === panel ? null : current));
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (!category) return null;

  const destination = city || state;
  const hasDestination = Boolean(destination);

  const handleContinue = () => {
    const normalized = resolveLocation({ city, state, kind: locationKind });
    const trip = {
      category: category.id,
      city: normalized.city,
      state: normalized.state,
      locationKind: normalized.kind,
      checkIn,
      checkOut,
      guests,
    };

    const err = validateTripSearch(trip);
    if (err) {
      setError(err);
      return;
    }

    setError("");
    logSearch("category-modal-search", trip);
    persistTripSearch(trip);

    const extraParams = new URLSearchParams();
    const propertyType = getApiPropertyType(category.id);
    if (propertyType) extraParams.set("propertyType", propertyType);

    router.push(
      buildListingsSearchUrl({
        category: category.id,
        city: trip.city,
        state: trip.state,
        checkIn,
        checkOut,
        guests,
        extraParams: extraParams.toString(),
      })
    );
    onClose();
  };

  const onLocationSelect = ({ city: c, state: s, kind }) => {
    const normalized = resolveLocation({ city: c, state: s, kind });
    setCity(normalized.city);
    setState(normalized.state);
    setLocationKind(normalized.kind);
    setQuery(normalized.city || normalized.state);
    if (error) setError("");
  };

  const clearDatesError = () => {
    if (error) setError("");
  };

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center sm:items-center sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-explore-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-stone-950/55 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />

      <div className="relative flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-visible rounded-t-3xl bg-stone-50 shadow-2xl ring-1 ring-white/10 sm:max-h-[85vh] sm:max-w-md sm:rounded-3xl">
        {/* Header */}
        <div className="relative z-10 shrink-0 overflow-hidden rounded-t-3xl bg-gradient-to-br from-brand via-orange-500 to-amber-500 px-5 pb-6 pt-5 sm:rounded-t-3xl sm:px-6 sm:pb-7 sm:pt-6">
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-12 left-1/3 h-28 w-28 rounded-full bg-amber-300/25 blur-2xl"
            aria-hidden
          />

          <div className="relative flex items-start gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-lg ring-1 ring-white/30 backdrop-blur-sm">
              {category.icon}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                Plan your trip
              </p>
              <h2
                id="category-explore-title"
                className="text-xl font-extrabold tracking-tight text-white sm:text-2xl"
              >
                {category.label}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-white/85">
                {category.description}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 transition hover:bg-white/25"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Form */}
        <div
          className={`relative min-h-0 flex-1 px-4 py-3 sm:px-4 sm:py-4 ${
            activePanel
              ? "z-[505] overflow-visible"
              : "z-0 overflow-y-auto overscroll-contain"
          }`}
        >
          <div className="space-y-3">
            <FieldCard>
              <StateCityLocationField
                embedded
                capEmbeddedList
                autoFocus
                value={query}
                city={city}
                state={state}
                onChange={setQuery}
                onSelect={onLocationSelect}
                placeholder="Search city or state..."
                label="Where"
              />
            </FieldCard>

            <div className="relative grid gap-3 sm:grid-cols-2">
              <FieldCard active={activePanel === "dates"}>
                <BookingDateRangePicker
                  variant="combined"
                  compactPopover
                  open={activePanel === "dates"}
                  onOpenChange={handlePanelChange("dates")}
                  popoverClassName="z-[520]"
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={({ checkIn: ci, checkOut: co }) => {
                    if (ci !== undefined) setCheckIn(ci);
                    if (co !== undefined) setCheckOut(co);
                    clearDatesError();
                  }}
                />
              </FieldCard>

              <FieldCard active={activePanel === "guests"}>
                <GuestsRoomsPicker
                  value={guests}
                  onChange={setGuests}
                  label="Guests & rooms"
                  compactPopover
                  open={activePanel === "guests"}
                  onOpenChange={handlePanelChange("guests")}
                  popoverClassName="z-[520]"
                  defaultLocation={city || state || query}
                />
              </FieldCard>
            </div>
          </div>

          {hasDestination && !error && (
            <p className="mt-4 rounded-xl bg-white px-3 py-2.5 text-center text-sm text-stone-600 ring-1 ring-stone-200/80">
              Searching <span className="font-bold text-brand">{destination}</span> in{" "}
              <span className="font-semibold text-stone-800">{category.label}</span>
            </p>
          )}

          {error && (
            <p
              className="mt-3 rounded-xl bg-red-50 px-3 py-2.5 text-center text-sm font-semibold text-red-700 ring-1 ring-red-100"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="relative z-0 shrink-0 border-t border-stone-200/80 bg-white px-4 py-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-3.5">
          <button
            type="button"
            onClick={handleContinue}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand/30 transition hover:brightness-105 active:scale-[0.99] sm:text-[15px]"
          >
            <SearchIcon />
            Find {category.label} stays
          </button>
          <p className="mt-2 text-center text-[11px] text-stone-400">
            Location, dates & guests are required
          </p>
        </div>
      </div>
    </div>
  );
}

function FieldCard({ active = false, children }) {
  return (
    <div
      className={`relative overflow-visible rounded-2xl bg-white shadow-sm ring-1 ring-stone-200/90 ${
        active ? "z-[510]" : "z-0"
      }`}
    >
      {children}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}
