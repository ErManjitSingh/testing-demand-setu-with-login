"use client";

import { useEffect, useMemo, useState } from "react";
import { getMinimumRoomsRequired } from "@/lib/guestOccupancy";
import {
  buildRoomComboAllocation,
  calculateComboPricingPreview,
  calculateRoomsStayPricing,
  getRequiredRoomCount,
  getSearchRoomCount,
} from "@/lib/propertyInventory";
import RoomPricingDetail from "@/components/property/RoomPricingDetail";
import { formatPrice } from "@/lib/listings";

export default function RoomSelectionModal({
  open,
  onClose,
  roomName,
  mealPlan,
  categoryData,
  inventoryKey,
  inventoryB2c,
  rooms,
  selections,
  isComboMode = false,
  nightDates,
  guests,
  primarySlots = 0,
  maxSelectable = 0,
  initialCount = 1,
  searchRoomCount,
  hasSelection = false,
  onConfirm,
}) {
  const minRooms = getMinimumRoomsRequired(guests);
  const floorCount = isComboMode ? minRooms : 0;
  const requestedRooms = searchRoomCount ?? getRequiredRoomCount(guests);
  const [count, setCount] = useState(floorCount);

  const comboRoomCount = useMemo(() => {
    if (!isComboMode) return count;
    const locked =
      hasSelection && initialCount > 0
        ? initialCount
        : initialCount > 0
          ? initialCount
          : requestedRooms;
    return Math.min(Math.max(minRooms, locked), maxSelectable || locked);
  }, [
    isComboMode,
    count,
    hasSelection,
    initialCount,
    requestedRooms,
    minRooms,
    maxSelectable,
  ]);

  const activeCount = isComboMode ? comboRoomCount : count;

  useEffect(() => {
    if (!open || isComboMode) return;

    const fromSearch = Math.min(Math.max(floorCount, requestedRooms), maxSelectable);
    const fromSelection =
      hasSelection && initialCount > 0
        ? Math.min(initialCount, maxSelectable)
        : fromSearch;
    setCount(fromSelection);
  }, [open, isComboMode, initialCount, maxSelectable, floorCount, requestedRooms, hasSelection]);

  const comboAllocation = useMemo(() => {
    if (!open || !isComboMode || activeCount < 1 || !inventoryB2c || !inventoryKey) return null;
    return buildRoomComboAllocation({
      inventoryB2c,
      rooms,
      selections: selections || {},
      primaryInventoryKey: inventoryKey,
      mealPlan: mealPlan.code,
      requestedCount: activeCount,
      nightDates,
    });
  }, [
    open,
    isComboMode,
    activeCount,
    inventoryB2c,
    inventoryKey,
    rooms,
    selections,
    mealPlan.code,
    nightDates,
  ]);

  const pricing = useMemo(() => {
    if (!open || activeCount < 1) return null;
    if (isComboMode && comboAllocation?.allocations?.length) {
      return calculateComboPricingPreview(
        comboAllocation.allocations,
        mealPlan.code,
        nightDates,
        guests
      );
    }
    return calculateRoomsStayPricing(categoryData, mealPlan.code, nightDates, guests, activeCount);
  }, [
    open,
    activeCount,
    isComboMode,
    comboAllocation,
    categoryData,
    mealPlan.code,
    nightDates,
    guests,
  ]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const nights = nightDates.length;
  const usesCombo = isComboMode && Boolean(comboAllocation?.comboRooms > 0);
  const canFulfill = !isComboMode || comboAllocation?.fulfilled !== false;

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close room selection"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-selection-title"
        className="relative z-10 flex max-h-[min(90vh,calc(100dvh-env(safe-area-inset-bottom)))] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-xl"
      >
        <div className="shrink-0 border-b border-[#e8e8e8] px-5 py-4">
          <h3 id="room-selection-title" className="text-lg font-bold text-[#1a1a1a]">
            {isComboMode ? `Room Combo · ${roomName}` : `Select ${roomName}`}
          </h3>
          <p className="mt-1 text-sm text-[#757575]">{mealPlan.mmtLabel}</p>
          <p className="mt-1 text-xs text-[#9b9b9b]">
            {isComboMode
              ? "Suggested combination for your search — confirm to book"
              : `Choose any room count · search: ${getSearchRoomCount(guests)} room${getSearchRoomCount(guests) !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {isComboMode ? (
            <div className="rounded-sm border border-brand/20 bg-brand-muted/30 px-4 py-3">
              <p className="text-sm font-semibold text-[#1a1a1a]">
                {activeCount} room{activeCount !== 1 ? "s" : ""} · auto combo
              </p>
              <p className="mt-0.5 text-xs text-[#757575]">
                Room split is fixed. Use customise below to build your own mix.
              </p>
            </div>
          ) : (
            <div className="rounded-sm border border-[#e8e8e8] bg-[#fafafa] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">Rooms</p>
                  <p className="mt-0.5 text-xs text-[#757575]">
                    Up to {maxSelectable} in this category
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCount((value) => Math.max(floorCount, value - 1))}
                    disabled={count <= floorCount}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d0d0d0] text-lg font-bold text-[#1a1a1a] disabled:opacity-40"
                    aria-label="Decrease rooms"
                  >
                    −
                  </button>
                  <span className="min-w-[2rem] text-center text-lg font-bold text-[#1a1a1a]">
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCount((value) => Math.min(maxSelectable, value + 1))}
                    disabled={count >= maxSelectable}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-brand bg-brand text-lg font-bold text-white disabled:opacity-40"
                    aria-label="Increase rooms"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {usesCombo && comboAllocation?.allocations?.length ? (
            <div className="overflow-hidden rounded-lg border border-brand/25 bg-brand-muted/30">
              <p className="border-b border-brand/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brand">
                Combo breakdown
              </p>
              <div className="space-y-2 px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {comboAllocation.allocations.map((alloc) => (
                    <span
                      key={alloc.inventoryKey}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        alloc.isPrimary ? "bg-brand text-white" : "border border-brand/30 bg-white text-brand"
                      }`}
                    >
                      {alloc.roomCount}× {alloc.categoryLabel}
                    </span>
                  ))}
                </div>
                {pricing?.parts?.map((part) => (
                  <p key={part.categoryLabel} className="flex justify-between text-xs text-[#4a4a4a]">
                    <span>
                      {part.roomCount}× {part.categoryLabel}
                    </span>
                    <span className="font-semibold">{formatPrice(part.subtotal)}</span>
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          {!canFulfill ? (
            <div className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              Only {activeCount - (comboAllocation?.remaining || 0)} of {activeCount} rooms can
              be filled.
            </div>
          ) : null}

          {activeCount > 0 && pricing ? (
            <RoomPricingDetail pricing={pricing} roomCount={activeCount} nights={nights} />
          ) : (
            <p className="text-sm text-[#757575]">Select at least 1 room to continue.</p>
          )}
        </div>

        <div
          className="shrink-0 space-y-3 border-t border-[#e8e8e8] bg-white px-5 py-4"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
        >
          {hasSelection ? (
            <button
              type="button"
              onClick={() => {
                onConfirm(0);
                onClose();
              }}
              className="w-full rounded border border-[#e0e0e0] py-2.5 text-sm font-semibold text-[#757575] hover:border-red-200 hover:text-red-600"
            >
              Remove selection
            </button>
          ) : null}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-[#d0d0d0] py-3 text-sm font-bold text-[#1a1a1a]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={activeCount < 1 || !canFulfill}
              onClick={() => {
                onConfirm(activeCount);
                onClose();
              }}
              className="flex-1 rounded bg-brand py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {isComboMode ? "Confirm" : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
