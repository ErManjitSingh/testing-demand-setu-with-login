"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatGuestsRoomsLabel } from "@/components/booking/GuestsRoomsPicker";
import BookingPriceBreakdown from "@/components/booking/BookingPriceBreakdown";
import { formatPrice } from "@/lib/listings";
import { formatShortDate, getDefaultListingsDirectUrlDates, nightsBetween } from "@/lib/dates";
import { useTripSearch } from "@/hooks/useTripSearch";
import { usePropertyRoomSelection } from "@/contexts/PropertyRoomSelectionContext";
import { buildBookUrl, normalizeGuests, persistTripSearch } from "@/lib/bookingSearch";
import { calculateBookingPrice, formatGstSummaryLabel } from "@/lib/bookingPricing";
import {
  hasActiveRoomSelection,
  saveAndNavigateToBooking,
} from "@/lib/propertyBookingSave";

function PropertyBookingCardClient({
  listing,
  selectedRoomPrice,
  initialTrip,
  propertyState = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roomSelection = usePropertyRoomSelection();
  const nightly = selectedRoomPrice ?? listing.price;
  const defaultDates = useMemo(() => getDefaultListingsDirectUrlDates(), []);

  const serverFallback = useMemo(
    () => ({
      city: initialTrip?.city || "",
      state: initialTrip?.state || propertyState || "",
      checkIn: initialTrip?.checkIn || "",
      checkOut: initialTrip?.checkOut || "",
      guests: initialTrip?.guests,
      category: initialTrip?.category,
    }),
    [initialTrip, propertyState]
  );

  const trip = useTripSearch(serverFallback);

  const defaultGuests = useMemo(
    () =>
      normalizeGuests({
        adults: Math.min(listing.guests || 2, 2) || 2,
        children: 0,
        rooms: 1,
      }),
    [listing.guests]
  );

  const checkIn = trip.checkIn ?? defaultDates.checkIn;
  const checkOut = trip.checkOut ?? defaultDates.checkOut;
  const guests = normalizeGuests(trip.guests ?? defaultGuests);
  const resolvedState = trip.state || propertyState || "";
  const resolvedCity = trip.city || "";

  const nights = useMemo(
    () => nightsBetween(checkIn, checkOut, 1),
    [checkIn, checkOut]
  );

  const hasSelection = hasActiveRoomSelection(roomSelection);
  const lineItems = hasSelection ? roomSelection.selectionLineItems : [];
  const pricing = hasSelection
    ? roomSelection.grandTotal
    : calculateBookingPrice(nightly, nights);

  const guestsLabel = formatGuestsRoomsLabel(guests);

  const handleReserve = () => {
    const nextTrip = {
      category: trip.category,
      city: resolvedCity,
      state: resolvedState,
      checkIn,
      checkOut,
      guests,
    };
    if (hasSelection) {
      saveAndNavigateToBooking({
        listing,
        selection: roomSelection,
        pricing,
        router,
        pathname,
        searchParams,
      });
      return;
    }

    persistTripSearch(nextTrip, { router, pathname, searchParams, listing });
    router.push(buildBookUrl(listing, nextTrip, { price: nightly }));
  };

  return (
    <div className="overflow-hidden rounded-sm border border-[#d8d8d8] bg-white shadow-[0_1px_8px_rgba(0,0,0,0.08)] lg:flex lg:max-h-[calc(100vh-11rem)] lg:flex-col">
      <div className="m-3 shrink-0 overflow-hidden rounded-sm border border-[#e8e8e8]">
        <div className="grid grid-cols-2 divide-x divide-[#e8e8e8]">
          <ReadOnlyTripField label="Check-in" value={formatShortDate(checkIn)} />
          <ReadOnlyTripField label="Check-out" value={formatShortDate(checkOut)} />
        </div>
        <div className="border-t border-[#e8e8e8]">
          <ReadOnlyTripField
            label="Rooms & Guests"
            value={guestsLabel}
            fullWidth
          />
        </div>
      </div>

      <div
        className={`border-t border-[#e8e8e8] px-4 py-4 ${
          hasSelection ? "lg:flex lg:min-h-0 lg:flex-1 lg:flex-col" : ""
        }`}
      >
        <div className={hasSelection ? "lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain" : ""}>
          {hasSelection ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#757575]">
                Your selection
              </p>
              <p className="mt-1 text-2xl font-bold text-[#1a1a1a]">
                {formatPrice(pricing.total)}
              </p>
              <p className="mt-1 text-xs text-[#9b9b9b]">
                {roomSelection.totalSelectedRooms} room
                {roomSelection.totalSelectedRooms !== 1 ? "s" : ""} · {nights} night
                {nights !== 1 ? "s" : ""} incl. GST
              </p>

              <div className="mt-4 rounded-sm border border-[#ececec] bg-[#fafafa] p-3">
                <BookingPriceBreakdown
                  lineItems={lineItems}
                  subtotal={pricing.subtotal}
                  gst={pricing.gst}
                  total={pricing.total}
                  nights={nights}
                  compact
                  scrollable
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#757575]">
                Starting @
              </p>
              <p className="mt-1 text-2xl font-bold text-[#1a1a1a]">
                {formatPrice(nightly)}
                <span className="text-sm font-normal text-[#757575]"> /night</span>
              </p>
              <p className="mt-1 text-xs text-[#9b9b9b]">
                {nights} night{nights !== 1 ? "s" : ""} · Total {formatPrice(pricing.total)} incl. GST
              </p>
            </>
          )}
        </div>

        <div className="shrink-0 lg:border-t lg:border-[#ececec] lg:pt-4">
          <button
            type="button"
            onClick={handleReserve}
            disabled={roomSelection?.hasInventory && !hasSelection}
            className="mt-4 hidden w-full items-center justify-center rounded bg-brand py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-[#c0c0c0] lg:mt-0 lg:flex"
          >
            {hasSelection ? "Continue to Book" : "Select Room"}
          </button>

          {roomSelection?.hasInventory && !hasSelection ? (
            <p className="mt-2 text-center text-xs text-[#757575]">
              Choose a room and meal plan below to continue
            </p>
          ) : null}
        </div>
      </div>

      {!hasSelection ? (
        <div className="shrink-0 border-t border-[#f0f0f0] bg-[#fafafa] px-4 py-3 text-xs text-[#757575]">
          <p className="flex justify-between">
            <span>Room charges</span>
            <span className="font-semibold text-[#1a1a1a]">{formatPrice(pricing.subtotal)}</span>
          </p>
          <p className="mt-1 flex justify-between">
            <span>{formatGstSummaryLabel({ subtotal: pricing.subtotal, gst: pricing.gst, nights })}</span>
            <span className="font-semibold text-[#1a1a1a]">{formatPrice(pricing.gst)}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ReadOnlyTripField({ label, value, fullWidth = false }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3.5 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-brand">
        {label.includes("Guest") ? <GuestsIcon /> : <CalendarIcon />}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wide text-brand">
          {label}
        </span>
        <span className="mt-0.5 block text-sm font-bold text-[#1a1a1a]">{value}</span>
      </span>
    </div>
  );
}

export default function PropertyBookingCard(props) {
  return (
    <Suspense
      fallback={
        <div className="h-[420px] animate-pulse rounded-sm border border-[#e0e0e0] bg-white" />
      }
    >
      <PropertyBookingCardClient {...props} />
    </Suspense>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function GuestsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
