"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice } from "@/lib/listings";
import {
  canAddChildToRoom,
  CHILD_ADULT_AGE_THRESHOLD,
  DEFAULT_CHILD_AGE,
  getMaxAdultsForRoomSlot,
  isValidRoomSlotGuests,
  occupancyFromRoomGuests,
} from "@/lib/guestOccupancy";
import { calculateRoomsStayPricingWithOccupancies } from "@/lib/propertyInventory";

const PANEL_MAX_HEIGHT = "min(85vh, calc(100dvh - 1.5rem))";

function OrangeRadio({ checked, disabled }) {
  return (
    <span
      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
        disabled
          ? "border-[#e0e0e0] opacity-40"
          : checked
            ? "border-brand"
            : "border-[#bdbdbd]"
      }`}
      aria-hidden
    >
      {checked ? <span className="h-2 w-2 rounded-full bg-brand" /> : null}
    </span>
  );
}

function RadioRow({ checked, disabled, onChange, children }) {
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 py-0.5 text-sm text-[#1a1a1a] ${
        disabled ? "cursor-not-allowed opacity-40" : ""
      }`}
    >
      <input
        type="radio"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="sr-only"
      />
      <OrangeRadio checked={checked} disabled={disabled} />
      {children}
    </label>
  );
}

function computePosition(anchorRect, panelWidth, panelHeight) {
  const gap = 10;
  const padding = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const anchorCenterX = anchorRect.left + anchorRect.width / 2;
  let left = anchorCenterX - panelWidth / 2;
  left = Math.max(padding, Math.min(left, vw - panelWidth - padding));
  const arrowLeft = anchorCenterX - left;

  const spaceBelow = vh - anchorRect.bottom - gap - padding;
  const spaceAbove = anchorRect.top - gap - padding;

  let placement = "bottom";
  let top = anchorRect.bottom + gap;

  if (panelHeight <= spaceBelow) {
    top = anchorRect.bottom + gap;
  } else if (panelHeight <= spaceAbove) {
    placement = "top";
    top = anchorRect.top - panelHeight - gap;
  } else if (spaceAbove > spaceBelow) {
    placement = "top";
    top = padding;
  } else {
    placement = "bottom";
    top = vh - panelHeight - padding;
  }

  top = Math.max(padding, Math.min(top, vh - panelHeight - padding));

  return { top, left, arrowLeft, placement };
}

function GuestPanelContent({
  slotLabel,
  mealPlanLabel,
  adults,
  setAdults,
  hasChild,
  setHasChild,
  childAge,
  setChildAge,
  maxAdults,
  childDisabled,
  selectChild,
  guestsValid,
  pricing,
  nights,
  taxesPerNight,
  onClose,
  onConfirm,
  occupancy,
}) {
  return (
    <>
      <div className="relative shrink-0 border-b border-[#ececec] px-5 py-4 pr-12">
        <p className="text-base font-bold leading-snug text-[#1a1a1a]">
          Select who will stay in {slotLabel}
        </p>
        <p className="mt-1 text-xs text-[#757575]">{mealPlanLabel}</p>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-lg leading-none text-[#9b9b9b] hover:text-[#4a4a4a]"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-5">
          <fieldset className="border-0 p-0">
            <legend className="text-xs font-bold text-[#1a1a1a]">Adults</legend>
            <ul className="mt-3 space-y-2.5">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <RadioRow
                    checked={adults === n}
                    disabled={n > maxAdults}
                    onChange={() => setAdults(n)}
                  >
                    {n} Adult{n !== 1 ? "s" : ""}
                  </RadioRow>
                </li>
              ))}
            </ul>
          </fieldset>

          <fieldset className="border-0 p-0">
            <legend className="text-xs font-bold text-[#1a1a1a]">Children</legend>
            <ul className="mt-3 space-y-2.5">
              <li>
                <RadioRow checked={!hasChild} onChange={() => setHasChild(false)}>
                  No Child
                </RadioRow>
              </li>
              <li>
                <RadioRow
                  checked={hasChild}
                  disabled={childDisabled}
                  onChange={selectChild}
                >
                  1 Child
                </RadioRow>
              </li>
            </ul>
            {hasChild ? (
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#f0f0f0] pt-3">
                <p className="text-xs font-semibold text-[#1a1a1a]">Child age</p>
                <select
                  value={childAge}
                  onChange={(e) => {
                    setChildAge(Number.parseInt(e.target.value, 10));
                  }}
                  className="rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#1a1a1a]"
                  aria-label="Child age"
                >
                  {Array.from({ length: 18 }, (_, i) => (
                    <option key={i} value={i}>
                      {i} yr{i !== 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {hasChild ? (
              <p className="mt-2 text-[10px] text-[#757575]">
                Children {CHILD_ADULT_AGE_THRESHOLD + 1}+ are charged as adults
              </p>
            ) : null}
          </fieldset>
        </div>
      </div>

      <div
        className="flex shrink-0 items-end justify-between gap-4 border-t border-[#ececec] bg-white px-5 py-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div>
          <p className="text-2xl font-bold text-[#1a1a1a]">
            {pricing ? formatPrice(pricing.subtotal / nights) : "—"}
          </p>
          {pricing ? (
            <p className="mt-0.5 text-[11px] text-[#757575]">
              + {formatPrice(taxesPerNight)} taxes & fees / per night
            </p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={!pricing || !guestsValid}
          onClick={() =>
            onConfirm({
              effectiveAdults: occupancy.effectiveAdults,
              youngChildren: occupancy.youngChildren,
              childAge: occupancy.childAge,
            })
          }
          className="shrink-0 rounded-md bg-gradient-to-b from-brand to-brand-dark px-7 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-sm hover:opacity-95 disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </>
  );
}

export default function RoomGuestAddPopover({
  open,
  anchorRect,
  slotLabel,
  mealPlanLabel,
  categoryData,
  mealPlan,
  nightDates,
  onClose,
  onConfirm,
}) {
  const panelRef = useRef(null);
  const [adults, setAdults] = useState(2);
  const [hasChild, setHasChild] = useState(false);
  const [childAge, setChildAge] = useState(DEFAULT_CHILD_AGE);
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    arrowLeft: 0,
    placement: "bottom",
  });
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const updatePosition = useCallback(() => {
    if (!open || !anchorRect || !panelRef.current || isMobile) return;
    const panel = panelRef.current;
    const rect = panel.getBoundingClientRect();
    setPosition(computePosition(anchorRect, rect.width, rect.height));
    setIsPositioned(true);
  }, [open, anchorRect, isMobile]);

  useEffect(() => {
    if (!open) {
      setIsPositioned(false);
      return;
    }
    setAdults(2);
    setHasChild(false);
    setChildAge(DEFAULT_CHILD_AGE);
  }, [open, slotLabel, mealPlan]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const occupancy = useMemo(
    () => occupancyFromRoomGuests(adults, hasChild, childAge),
    [adults, hasChild, childAge]
  );

  const maxAdults = getMaxAdultsForRoomSlot(hasChild);
  const guestsValid = isValidRoomSlotGuests(adults, hasChild, childAge);

  const selectChild = useCallback(() => {
    setHasChild(true);
    setAdults((current) => Math.min(current, getMaxAdultsForRoomSlot(true)));
  }, []);

  useLayoutEffect(() => {
    if (!open || !anchorRect || isMobile) {
      if (open && isMobile) setIsPositioned(true);
      return;
    }
    updatePosition();
  }, [open, anchorRect, adults, hasChild, childAge, updatePosition, isMobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    const onResize = () => updatePosition();
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, onClose, updatePosition]);

  const pricing = useMemo(() => {
    if (!open || !categoryData) return null;
    return calculateRoomsStayPricingWithOccupancies(categoryData, mealPlan, nightDates, [
      {
        effectiveAdults: occupancy.effectiveAdults,
        youngChildren: occupancy.youngChildren,
      },
    ]);
  }, [open, categoryData, mealPlan, nightDates, occupancy]);

  if (!open || typeof document === "undefined") return null;
  if (!isMobile && !anchorRect) return null;

  const nights = nightDates.length || 1;
  const taxesPerNight = pricing ? Math.round((pricing.gst || 0) / nights) : 0;

  const panelProps = {
    slotLabel,
    mealPlanLabel,
    adults,
    setAdults,
    hasChild,
    setHasChild,
    childAge,
    setChildAge,
    maxAdults,
    childDisabled: !canAddChildToRoom(adults),
    selectChild,
    guestsValid,
    pricing,
    nights,
    taxesPerNight,
    onClose,
    onConfirm,
    occupancy,
  };

  if (isMobile) {
    return createPortal(
      <div className="fixed inset-0 z-[150] flex items-end justify-center">
        <button
          type="button"
          className="absolute inset-0 bg-black/60"
          aria-label="Close guest selection"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Select guests for ${slotLabel}`}
          className="relative z-10 flex max-h-[min(90vh,calc(100dvh-env(safe-area-inset-bottom)))] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl"
        >
          <GuestPanelContent {...panelProps} />
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-[149] cursor-default bg-black/40"
        aria-label="Close guest selection"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Select guests for ${slotLabel}`}
        className="fixed z-[150] flex w-[min(calc(100vw-1.5rem),22rem)] flex-col overflow-hidden rounded-xl border border-[#d4d4d4] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
        style={{
          top: position.top,
          left: position.left,
          maxHeight: PANEL_MAX_HEIGHT,
          opacity: isPositioned ? 1 : 0,
          pointerEvents: isPositioned ? "auto" : "none",
        }}
      >
        <div
          className="pointer-events-none absolute h-3 w-3 rotate-45 border border-[#d4d4d4] bg-white"
          style={
            position.placement === "bottom"
              ? { top: -7, left: position.arrowLeft - 6 }
              : { bottom: -7, left: position.arrowLeft - 6 }
          }
        />

        <GuestPanelContent {...panelProps} />
      </div>
    </>,
    document.body
  );
}
