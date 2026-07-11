"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/listings";
import { nightsBetween } from "@/lib/dates";
import { usePropertyRoomSelection } from "@/contexts/PropertyRoomSelectionContext";
import { calculateBookingPrice } from "@/lib/bookingPricing";
import {
  hasActiveRoomSelection,
  saveAndNavigateToBooking,
} from "@/lib/propertyBookingSave";
import { PROPERTY_GALLERY_OPEN_EVENT } from "@/components/property/PropertyGallery";

function PropertyMobileBarClient({ listing, price }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selection = usePropertyRoomSelection();
  const [mounted, setMounted] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const nightly = price ?? listing.price;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const syncGalleryOpen = () => {
      setGalleryOpen(document.body.dataset.propertyGalleryOpen === "true");
    };
    syncGalleryOpen();
    window.addEventListener(PROPERTY_GALLERY_OPEN_EVENT, syncGalleryOpen);
    return () => window.removeEventListener(PROPERTY_GALLERY_OPEN_EVENT, syncGalleryOpen);
  }, []);

  const checkIn = selection?.checkIn;
  const checkOut = selection?.checkOut;
  const nights = useMemo(
    () => nightsBetween(checkIn, checkOut, 1),
    [checkIn, checkOut]
  );

  const hasSelection = hasActiveRoomSelection(selection);
  const lineItems = selection?.selectionLineItems || [];
  const pricing = hasSelection
    ? selection.grandTotal
    : calculateBookingPrice(nightly, nights);

  const firstLine = lineItems[0];
  const label = hasSelection
    ? `${selection.totalSelectedRooms} room${selection.totalSelectedRooms !== 1 ? "s" : ""} · ${nights} night${nights !== 1 ? "s" : ""}`
    : `${nights} night${nights !== 1 ? "s" : ""} · from`;

  const handleAction = () => {
    if (!hasSelection) {
      document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    saveAndNavigateToBooking({
      listing,
      selection,
      pricing,
      router,
      pathname,
      searchParams,
    });
  };

  if (!mounted || selection?.hasOverlay || galleryOpen) return null;

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-[100] isolate border-t border-[#d8d8d8] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)] lg:hidden">
      <div
        className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 pt-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="min-w-0 flex-1">
          {hasSelection && firstLine ? (
            <p className="truncate text-[11px] font-semibold text-brand">
              {firstLine.roomName} · {firstLine.mealPlanLabel}
            </p>
          ) : (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#757575]">
              Starting @
            </p>
          )}
          <p className="text-xl font-bold leading-tight text-[#1a1a1a]">
            {formatPrice(pricing.total)}
          </p>
          <p className="mt-0.5 text-[11px] leading-snug text-[#757575]">{label}</p>
          {hasSelection ? (
            <p className="mt-0.5 text-[10px] leading-snug text-[#9b9b9b]">
              Incl. GST {formatPrice(pricing.gst)}
              {(firstLine?.extraAdultSubtotal ?? 0) > 0 ? " · Extra adult applied" : ""}
            </p>
          ) : (
            <p className="mt-0.5 text-[10px] leading-snug text-[#9b9b9b]">
              {formatPrice(nightly)}/night · select a room below
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAction}
          className="shrink-0 rounded bg-brand px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-brand-dark sm:px-6 sm:py-3 sm:text-sm"
        >
          {hasSelection ? "Book Now" : "Select Room"}
        </button>
      </div>
    </div>,
    document.body
  );
}

export default function PropertyMobileBar(props) {
  return (
    <Suspense fallback={null}>
      <PropertyMobileBarClient {...props} />
    </Suspense>
  );
}
