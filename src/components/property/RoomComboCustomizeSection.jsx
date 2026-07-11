"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatPrice } from "@/lib/listings";
import {
  countYoungChildren,
  getEffectiveAdults,
  MAX_GUESTS_PER_ROOM,
  normalizeChildAges,
} from "@/lib/guestOccupancy";
import { MEAL_PLAN_DEFS } from "@/lib/property";
import {
  buildMealPlanOffer,
  calculateSelectionGrandTotal,
  getAvailableMealPlansForStay,
  getCategoryAvailability,
  getInventoryCategoryData,
  getRequiredRoomCount,
  hasRoomComboScenario,
} from "@/lib/propertyInventory";
import { buildSelectionsFromGrid } from "@/components/property/roomComboCustomizeUtils";
import RoomGuestAddPopover from "@/components/property/RoomGuestAddPopover";
import { usePropertyOverlay } from "@/hooks/usePropertyOverlay";

function MealIcon({ type }) {
  const cls = "h-3.5 w-3.5";
  if (type === "breakfast") {
    return (
      <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M4 8h12v1.5a4.5 4.5 0 01-4.5 4.5H8.5A4.5 4.5 0 014 9.5V8z" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function slotsToGrid(slots) {
  const grid = {};
  for (const slot of slots) {
    if (!slot) continue;
    const key = `${slot.inventoryKey}::${slot.mealPlan}`;
    grid[key] = (grid[key] || 0) + 1;
  }
  return grid;
}

function initSlotsFromCustom(customRoomSlots, searchRooms) {
  if (customRoomSlots?.length) {
    const next = Array.from({ length: searchRooms }, () => null);
    customRoomSlots.forEach((slot, i) => {
      if (i < next.length) next[i] = { ...slot, id: slot.id || `slot-${i}` };
    });
    return next;
  }
  return Array.from({ length: searchRooms }, () => null);
}

function DesktopSelectionSidebar({
  slots,
  filledSlots,
  searchRooms,
  totalSearchGuests,
  guestsInSlots,
  allFilled,
  guestsFit,
  canProceed,
  preview,
  onClearSlot,
  onProceed,
}) {
  return (
    <aside className="sticky top-[10.5rem] z-10 w-56 max-h-[calc(100vh-11rem)] shrink-0 self-start overflow-y-auto border-l border-[#ececec] bg-[#fafafa] p-4 no-scrollbar">
      <p className="text-sm font-bold text-[#1a1a1a]">
        {filledSlots.length > 0
          ? `${filledSlots.length} Room${filledSlots.length !== 1 ? "s" : ""} Selected`
          : "No Room Selected"}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {slots.map((slot, index) => (
          <button
            key={`desktop-slot-${index}`}
            type="button"
            onClick={() => slot && onClearSlot(index)}
            className={`rounded border px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wide transition ${
              slot
                ? "border-brand bg-brand-muted text-brand"
                : "border-[#d4d4d4] bg-white text-[#9b9b9b]"
            }`}
            title={slot ? `${slot.categoryLabel} · Click to remove` : undefined}
          >
            Room {index + 1}
            {slot ? (
              <span className="mt-1 block truncate text-[9px] font-normal normal-case">
                {slot.categoryLabel}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-[#ececec] pt-3">
        {!allFilled || !guestsFit ? (
          <p className="flex items-start gap-1.5 text-[11px] font-semibold text-red-600">
            <span aria-hidden>⚠</span>
            <span>
              {filledSlots.length === 0
                ? `No Room Selected. Fits 0 out of ${totalSearchGuests} Guests`
                : !allFilled
                  ? `Select ${searchRooms - filledSlots.length} more room${
                      searchRooms - filledSlots.length !== 1 ? "s" : ""
                    }`
                  : `Fits ${guestsInSlots} out of ${totalSearchGuests} Guests — add capacity`}
            </span>
          </p>
        ) : (
          <p className="text-[11px] font-semibold text-[#2e7d32]">
            Fits {guestsInSlots} out of {totalSearchGuests} Guests
          </p>
        )}
      </div>

      {preview?.total ? (
        <p className="mt-3 text-lg font-bold text-[#1a1a1a]">
          {formatPrice(preview.total)}
          <span className="block text-[10px] font-normal text-[#757575]">incl. GST</span>
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canProceed}
        onClick={onProceed}
        className={`mt-4 w-full rounded py-3 text-xs font-bold uppercase tracking-wider text-white transition ${
          canProceed
            ? "bg-gradient-to-b from-brand to-brand-dark hover:opacity-95"
            : "cursor-not-allowed bg-[#bdbdbd]"
        }`}
      >
        Proceed
      </button>
    </aside>
  );
}

function MobileSelectionSummary({
  slots,
  filledSlots,
  searchRooms,
  totalSearchGuests,
  guestsInSlots,
  allFilled,
  guestsFit,
  canProceed,
  preview,
  onClearSlot,
  onProceed,
  onClose,
}) {
  const statusLine =
    !allFilled || !guestsFit
      ? filledSlots.length === 0
        ? `No room selected · fits 0 of ${totalSearchGuests} guests`
        : !allFilled
          ? `Select ${searchRooms - filledSlots.length} more room${
              searchRooms - filledSlots.length !== 1 ? "s" : ""
            }`
          : `Fits ${guestsInSlots} of ${totalSearchGuests} guests — add capacity`
      : `Fits ${guestsInSlots} of ${totalSearchGuests} guests`;

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#1a1a1a]">
            {filledSlots.length} of {searchRooms} rooms selected
          </p>
          <p
            className={`mt-1 text-[11px] font-semibold ${
              canProceed ? "text-[#2e7d32]" : "text-red-600"
            }`}
          >
            {statusLine}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-1.5 text-[#757575] transition hover:bg-[#f0f0f0] hover:text-[#1a1a1a]"
          aria-label="Close room summary"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {slots.map((slot, index) => (
          <button
            key={`mobile-slot-${index}`}
            type="button"
            onClick={() => slot && onClearSlot(index)}
            className={`rounded border px-2 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide transition ${
              slot
                ? "border-brand bg-brand-muted text-brand"
                : "border-[#d4d4d4] bg-white text-[#9b9b9b]"
            }`}
            title={slot ? `${slot.categoryLabel} · tap to remove` : undefined}
          >
            Room {index + 1}
            {slot ? (
              <span className="mt-1 block truncate text-[9px] font-normal normal-case">
                {slot.categoryLabel}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-[#ececec] pt-4">
        <div>
          {preview?.total ? (
            <>
              <p className="text-xl font-bold text-[#1a1a1a]">{formatPrice(preview.total)}</p>
              <p className="text-[10px] text-[#757575]">incl. GST</p>
            </>
          ) : (
            <p className="text-sm text-[#757575]">Add rooms to see total</p>
          )}
        </div>
        <button
          type="button"
          disabled={!canProceed}
          onClick={onProceed}
          className={`shrink-0 rounded px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition ${
            canProceed
              ? "bg-gradient-to-b from-brand to-brand-dark hover:opacity-95"
              : "cursor-not-allowed bg-[#bdbdbd]"
          }`}
        >
          Proceed
        </button>
      </div>
    </div>
  );
}

export default function RoomComboCustomizeSection({
  rooms,
  inventoryB2c,
  nightDates,
  guests,
  currentSelections,
  customRoomSlots,
  expanded = false,
  onExpandedChange,
  onApply,
  sectionRef,
}) {
  const searchRooms = getRequiredRoomCount(guests);
  const [slots, setSlots] = useState(() => initSlotsFromCustom(customRoomSlots, searchRooms));
  const [popover, setPopover] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prevFilledCountRef = useRef(0);

  useEffect(() => setMounted(true), []);

  usePropertyOverlay(Boolean(popover), "guest-popover");
  usePropertyOverlay(Boolean(summaryOpen && !popover), "customize-summary");

  const tripKey = `${nightDates.join("|")}-${guests?.adults}-${guests?.children}-${guests?.rooms}`;

  useEffect(() => {
    setSlots(initSlotsFromCustom(customRoomSlots, searchRooms));
  }, [tripKey, customRoomSlots, searchRooms]);

  const childAges = normalizeChildAges(guests?.childAges, guests?.children ?? 0);
  const totalSearchGuests =
    getEffectiveAdults({ adults: guests?.adults ?? 1, childAges }) +
    countYoungChildren(childAges);

  const filledSlots = slots.filter(Boolean);
  const nextEmptyIndex = slots.findIndex((s) => !s);

  const guestsInSlots = filledSlots.reduce(
    (sum, slot) => sum + slot.effectiveAdults + slot.youngChildren,
    0
  );

  const countCategoryUsed = useCallback(
    (inventoryKey, excludeIndex = -1) =>
      slots.reduce((sum, slot, index) => {
        if (!slot || index === excludeIndex) return sum;
        return slot.inventoryKey === inventoryKey ? sum + 1 : sum;
      }, 0),
    [slots]
  );

  const canAddToCategory = (inventoryKey, categoryData) => {
    if (nextEmptyIndex < 0) return false;
    const max = getCategoryAvailability(categoryData, nightDates);
    return countCategoryUsed(inventoryKey) < max;
  };

  const openAddPopover = (room, mealPlan, categoryData, offer, anchorEl) => {
    if (nextEmptyIndex < 0 || !anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    if (!rect.width && !rect.height) return;
    setPopover({
      slotIndex: nextEmptyIndex,
      slotLabel: `Room ${nextEmptyIndex + 1}`,
      room,
      mealPlan,
      categoryData,
      offer,
      anchorRect: rect,
    });
  };

  const handlePopoverConfirm = ({ effectiveAdults, youngChildren, childAge }) => {
    if (!popover) return;
    const { slotIndex, room, mealPlan } = popover;
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = {
        id: `slot-${slotIndex}`,
        inventoryKey: room.inventoryCategoryKey,
        mealPlan,
        roomId: room.id,
        categoryLabel: room.inventoryLabel || room.name,
        effectiveAdults,
        youngChildren,
        childAge: childAge ?? null,
      };
      return next;
    });
    setPopover(null);
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setSummaryOpen(true);
    }
  };

  const clearSlot = (index) => {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  };

  useEffect(() => {
    const count = filledSlots.length;
    if (count === 0) {
      setSummaryOpen(false);
    } else if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches &&
      count > prevFilledCountRef.current
    ) {
      setSummaryOpen(true);
    } else if (
      customRoomSlots?.length &&
      count > 0 &&
      prevFilledCountRef.current === 0 &&
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches
    ) {
      setSummaryOpen(true);
    }
    prevFilledCountRef.current = count;
  }, [filledSlots.length, customRoomSlots?.length]);

  const preview = useMemo(() => {
    if (!filledSlots.length) return null;
    const grid = slotsToGrid(slots);
    const selections = buildSelectionsFromGrid(grid, rooms);
    return calculateSelectionGrandTotal(
      selections,
      inventoryB2c,
      nightDates,
      guests,
      rooms,
      filledSlots
    );
  }, [slots, filledSlots, rooms, inventoryB2c, nightDates, guests]);

  const allFilled = filledSlots.length === searchRooms;
  const guestsFit = guestsInSlots >= totalSearchGuests;
  const canProceed = allFilled && guestsFit && filledSlots.length > 0;

  const handleProceed = () => {
    if (!canProceed) return;
    const grid = slotsToGrid(slots);
    onApply({
      selections: buildSelectionsFromGrid(grid, rooms),
      roomSlots: filledSlots,
    });
    setSummaryOpen(false);
  };

  const showSection = useMemo(() => {
    if (!inventoryB2c || !nightDates.length) return false;
    if (customRoomSlots?.length) return true;
    return hasRoomComboScenario({
      inventoryB2c,
      rooms,
      selections: currentSelections || {},
      nightDates,
      guests,
    });
  }, [inventoryB2c, nightDates, rooms, currentSelections, guests, customRoomSlots]);

  const sidebarProps = {
    slots,
    filledSlots,
    searchRooms,
    totalSearchGuests,
    guestsInSlots,
    allFilled,
    guestsFit,
    canProceed,
    preview,
    onClearSlot: clearSlot,
    onProceed: handleProceed,
  };

  const renderRoomRows = () =>
    rooms.map((room) => {
      const inventoryKey = room.inventoryCategoryKey;
      const categoryData = getInventoryCategoryData(inventoryB2c, inventoryKey);
      const mealPlans = categoryData
        ? getAvailableMealPlansForStay(categoryData, nightDates)
        : [];
      if (!mealPlans.length) return null;

      const specs = [room.size, room.view, room.bed].filter(Boolean);
      const maxAvailable = getCategoryAvailability(categoryData, nightDates);
      const canAddCategory = canAddToCategory(inventoryKey, categoryData);

      return (
        <article key={room.id} className="flex flex-col lg:flex-row">
          <div className="shrink-0 border-b border-[#ececec] p-4 lg:w-56 lg:border-b-0 lg:border-r xl:w-64">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm bg-stone-100">
              <Image
                src={room.image}
                alt={room.name}
                fill
                className="object-cover"
                sizes="256px"
              />
            </div>
            <div className="mt-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-[#1a1a1a]">{room.name}</h4>
                <span className="shrink-0 text-[10px] font-semibold text-[#757575]">
                  Max {MAX_GUESTS_PER_ROOM} Guests
                </span>
              </div>
              {specs.length > 0 ? (
                <ul className="mt-2 space-y-1 text-[11px] text-[#4a4a4a]">
                  {specs.map((s) => (
                    <li key={s} className="flex items-center gap-1.5">
                      <span className="text-brand">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-2 text-[11px] font-semibold text-[#2e7d32]">
                {maxAvailable} room{maxAvailable !== 1 ? "s" : ""} available
              </p>
              {room.amenities?.length > 0 ? (
                <ul className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-[#757575]">
                  {room.amenities.slice(0, 6).map((a) => (
                    <li key={a}>• {a}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>

          <div className="min-w-0 flex-1 divide-y divide-[#ececec] bg-white">
            {mealPlans.map((mealPlan) => {
              const offer = buildMealPlanOffer(categoryData, mealPlan, nightDates, guests);
              const def = MEAL_PLAN_DEFS[mealPlan];
              const addLabel =
                nextEmptyIndex >= 0 ? `Add Room ${nextEmptyIndex + 1}` : "All rooms added";

              return (
                <div
                  key={mealPlan}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      {def?.mmtLabel || mealPlan}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-[#757575]">
                      <MealIcon type={def?.inclusionType} />
                      {def?.inclusion}
                    </p>
                    {offer ? (
                      <p className="mt-2 text-lg font-bold text-[#1a1a1a]">
                        {formatPrice(offer.nightly)}
                        <span className="ml-1 text-xs font-normal text-[#757575]">/ night</span>
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={!offer || !canAddCategory}
                    onClick={(e) =>
                      openAddPopover(room, mealPlan, categoryData, offer, e.currentTarget)
                    }
                    className="inline-flex shrink-0 items-center justify-center rounded border-2 border-brand bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-brand transition hover:bg-brand-muted disabled:cursor-not-allowed disabled:border-[#d4d4d4] disabled:text-[#9b9b9b]"
                  >
                    {addLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </article>
      );
    });

  if (!showSection) return null;

  return (
    <div ref={sectionRef} id="customize-rooms" className="mt-4">
      {/* Desktop: original expand/collapse toggle */}
      <button
        type="button"
        onClick={() => onExpandedChange?.(!expanded)}
        className="mx-auto hidden w-full max-w-3xl items-center justify-center gap-2 rounded-full border-2 border-brand bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-brand shadow-sm transition hover:bg-brand-muted sm:text-sm lg:flex"
      >
        Customize your room combination
        <span
          className={`inline-block text-brand transition ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {/* Desktop: original expanded panel with sidebar */}
      {expanded ? (
        <div className="mt-4 hidden rounded-lg border border-[#d4d4d4] bg-white shadow-sm lg:block">
          <div className="border-b border-[#ececec] bg-[#fafafa] px-4 py-2.5">
            <p className="text-sm font-bold text-[#1a1a1a]">
              {rooms.length} Room Type{rooms.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-start">
            <div className="min-w-0 flex-1 divide-y divide-[#ececec]">{renderRoomRows()}</div>
            <DesktopSelectionSidebar {...sidebarProps} />
          </div>
        </div>
      ) : null}

      {/* Mobile: always-visible room list + top dropdown summary */}
      <div className="overflow-hidden rounded-lg border border-[#d4d4d4] bg-white shadow-sm lg:hidden">
        <div className="border-b border-[#ececec] bg-[#fafafa] px-4 py-2.5">
          <p className="text-sm font-bold text-[#1a1a1a]">Customize your room combination</p>
          <p className="mt-0.5 text-xs text-[#757575]">
            Add {searchRooms} rooms for your group — tap a meal plan below
          </p>
        </div>
        <div className="divide-y divide-[#ececec]">{renderRoomRows()}</div>
      </div>

      {filledSlots.length > 0 && !summaryOpen ? (
        <button
          type="button"
          onClick={() => setSummaryOpen(true)}
          className="fixed left-4 right-4 top-[calc(7.75rem+env(safe-area-inset-top,0px))] z-40 mx-auto flex max-w-lg items-center justify-between gap-3 rounded-full border border-brand/30 bg-white px-4 py-2.5 shadow-lg lg:hidden"
        >
          <span className="text-xs font-bold text-brand">
            {filledSlots.length}/{searchRooms} rooms
            {preview?.total ? ` · ${formatPrice(preview.total)}` : ""}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#757575]">
            View
          </span>
        </button>
      ) : null}

      {mounted && summaryOpen && filledSlots.length > 0 && !popover
        ? createPortal(
            <div className="fixed inset-x-0 top-0 z-[140] lg:hidden">
              <div
                className="animate-drop-from-top border-b border-[#e0e0e0] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.14)]"
                style={{
                  paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))",
                }}
              >
                <div className="mx-auto max-w-lg px-4 pb-4">
                  <MobileSelectionSummary
                    {...sidebarProps}
                    onClose={() => setSummaryOpen(false)}
                  />
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      <RoomGuestAddPopover
        open={Boolean(popover)}
        anchorRect={popover?.anchorRect}
        slotLabel={popover?.slotLabel}
        mealPlanLabel={popover?.offer?.mmtLabel || popover?.mealPlan}
        categoryData={popover?.categoryData}
        mealPlan={popover?.mealPlan}
        nightDates={nightDates}
        onClose={() => setPopover(null)}
        onConfirm={handlePopoverConfirm}
      />
    </div>
  );
}
