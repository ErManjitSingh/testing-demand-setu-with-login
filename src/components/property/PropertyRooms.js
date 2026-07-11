"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatPrice } from "@/lib/listings";
import { MAX_SELF_SERVICE_SEARCH_ROOMS } from "@/lib/guestOccupancy";
import { usePropertyRoomSelection } from "@/contexts/PropertyRoomSelectionContext";
import BulkStayEnquiryForm from "@/components/booking/BulkStayEnquiryForm";
import {
  buildMealPlanOffer,
  calculateRoomsStayPricing,
  getCategoryAvailability,
  getComboOfferForCategory,
  hasRoomComboScenario,
  getInventoryCategoryData,
  getAvailableMealPlansForStay,
  sumCategorySelectedRooms,
  getRequiredRoomCount,
} from "@/lib/propertyInventory";
import RoomSelectionModal from "@/components/property/RoomSelectionModal";
import RoomComboCustomizeSection from "@/components/property/RoomComboCustomizeSection";
import RoomAvailabilityNotice from "@/components/property/RoomAvailabilityNotice";
import RoomPricingDetail from "@/components/property/RoomPricingDetail";
import { usePropertyOverlay } from "@/hooks/usePropertyOverlay";

function MealInclusionIcon({ type }) {
  const cls = "h-4 w-4 shrink-0";
  if (type === "breakfast") {
    return (
      <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M4 8h12v1.5a4.5 4.5 0 01-4.5 4.5H8.5A4.5 4.5 0 014 9.5V8z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M6 8V5.5A2 2 0 018 3.5h4a2 2 0 012 2V8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M3 8h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "meals") {
    return (
      <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
        <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}

function InventoryMealPlanRow({
  room,
  mealPlan,
  offer,
  categoryData,
  inventoryKey,
  nightDates,
  guests,
  maxAvailable,
  planSlots,
  selectedCount,
  remainingForCategory,
  comboActive = false,
  onSelect,
  onClear,
}) {
  const nights = nightDates.length;
  const soldOut = maxAvailable <= 0 || !offer;
  const noSlotsLeft = !soldOut && remainingForCategory <= 0 && selectedCount === 0;

  const searchRooms = getRequiredRoomCount(guests);
  const otherPlanUsage = Math.max(0, maxAvailable - planSlots);
  const defaultRoomCount =
    selectedCount > 0 ? selectedCount : Math.min(searchRooms, planSlots);
  const multiRoomPricing =
    defaultRoomCount > 0
      ? calculateRoomsStayPricing(categoryData, mealPlan, nightDates, guests, defaultRoomCount)
      : null;

  return (
    <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-stretch lg:gap-0 lg:p-0">
      <div className="min-w-0 flex-1 p-0 lg:p-5">
        <h4 className="text-sm font-bold text-foreground sm:text-base">{offer?.mmtLabel || mealPlan}</h4>
        <ul className="mt-2 space-y-1.5">
          <li className="flex items-center gap-2 text-xs text-stone-600 sm:text-sm">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                offer?.inclusionType === "none"
                  ? "bg-stone-200 text-stone-500"
                  : "bg-brand-muted text-brand"
              }`}
            >
              <MealInclusionIcon type={offer?.inclusionType || "none"} />
            </span>
            {offer?.inclusion || "Meals as per plan"}
          </li>
        </ul>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center border-t border-border bg-white p-4 lg:border-l lg:border-t-0 lg:px-5 lg:py-4">
        {offer ? (
          <div className="space-y-2">
           
            <RoomPricingDetail
              pricing={multiRoomPricing || offer}
              roomCount={defaultRoomCount}
              nights={nights}
            />
            {selectedCount > 0 && !comboActive ? (
              <p className="rounded-sm bg-brand-muted/40 px-2 py-1.5 text-xs font-semibold text-brand">
                {selectedCount} room{selectedCount !== 1 ? "s" : ""} selected for booking
              </p>
            ) : comboActive ? (
              <p className="rounded-sm bg-stone-100 px-2 py-1.5 text-xs text-stone-600">
                Use room combo below for multi-category booking
              </p>
            ) : planSlots < searchRooms && maxAvailable >= searchRooms && planSlots > 0 ? (
              <p className="rounded-sm bg-amber-50 px-2 py-1.5 text-xs font-semibold text-amber-800">
                {planSlots} room{planSlots !== 1 ? "s" : ""} left for this plan
                {otherPlanUsage > 0
                  ? ` (${otherPlanUsage} already selected on another meal plan)`
                  : ""}
              </p>
            ) : searchRooms > maxAvailable && maxAvailable > 0 ? (
              <p className="rounded-sm bg-amber-50 px-2 py-1.5 text-xs font-semibold text-amber-800">
                Only {maxAvailable} room{maxAvailable !== 1 ? "s" : ""} available for your dates
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[#757575]">
            {soldOut ? "Not available for selected dates" : "Rates unavailable"}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border p-4 lg:w-44 lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:p-5">
        {offer ? (
          <div className="text-right lg:w-full">
            <p className="text-lg font-bold text-foreground sm:text-xl">
              {formatPrice(offer.nightly)}
            </p>
            <p className="text-[11px] text-muted">base rate / night</p>
          </div>
        ) : null}
        <div className="flex w-full flex-col gap-2 lg:w-auto">
          <button
            type="button"
            disabled={soldOut || noSlotsLeft}
            onClick={() =>
              onSelect({
                room,
                mealPlan,
                offer,
                categoryData,
                inventoryKey,
                selectedCount,
                categoryLabel: room.inventoryLabel || room.name,
                maxSelectable: Math.max(selectedCount, remainingForCategory + selectedCount),
              })
            }
            className={`inline-flex min-w-[8.5rem] items-center justify-center rounded border px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition sm:min-w-[9rem] sm:text-sm ${
              selectedCount > 0 && !comboActive
                ? "border-brand bg-white text-brand hover:bg-brand-muted"
                : "border-brand bg-brand text-white hover:bg-brand-dark"
            } disabled:cursor-not-allowed disabled:border-[#d0d0d0] disabled:bg-[#f0f0f0] disabled:text-[#9b9b9b]`}
          >
            {selectedCount > 0 && !comboActive ? `${selectedCount} Selected` : "Select Room"}
          </button>
          {selectedCount > 0 && !comboActive ? (
            <button
              type="button"
              onClick={onClear}
              className="text-center text-[11px] font-semibold text-[#757575] underline hover:text-brand"
            >
              Remove selection
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InventoryComboRow({
  room,
  comboOffer,
  inventoryKey,
  nightDates,
  comboSelected,
  customComboActive,
  comboTotal,
  onSelect,
  onCustomize,
  onClear,
}) {
  const nights = nightDates.length;
  const { pricing, comboLabel, mmtLabel, inclusion, inclusionType, nightly } = comboOffer;

  return (
    <div className="flex flex-col gap-4 border-t border-[#ececec] bg-[#fffbf7] p-4 lg:flex-row lg:items-stretch lg:gap-0 lg:p-0">
      <div className="min-w-0 flex-1 p-0 lg:p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand">Room Combo</p>
        <h4 className="mt-1 text-sm font-bold text-foreground sm:text-base">{mmtLabel}</h4>
        <p className="mt-2 text-xs font-semibold text-[#1a1a1a] sm:text-sm">{comboLabel}</p>
        <p className="mt-1.5 flex items-center gap-2 text-xs text-stone-500 sm:text-sm">
          <MealInclusionIcon type={inclusionType} />
          {inclusion}
        </p>
        {customComboActive ? (
          <p className="mt-2 inline-flex rounded-sm bg-brand-muted px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
            Customised selection
          </p>
        ) : comboSelected ? (
          <p className="mt-2 text-xs font-semibold text-brand">
            {comboTotal} room{comboTotal !== 1 ? "s" : ""} selected
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center border-t border-border bg-white p-4 lg:border-l lg:border-t-0 lg:px-5 lg:py-4">
        {pricing ? (
          <div className="space-y-2">
            {pricing.parts?.length > 1 ? (
              <ul className="space-y-1 text-xs text-[#4a4a4a]">
                {pricing.parts.map((part) => (
                  <li key={part.categoryLabel} className="flex justify-between gap-2">
                    <span>
                      {part.roomCount}× {part.categoryLabel}
                    </span>
                    <span className="font-semibold text-[#1a1a1a]">
                      {formatPrice(part.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            <RoomPricingDetail pricing={pricing} roomCount={pricing.roomCount} nights={nights} />
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border p-4 lg:w-44 lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:p-5">
        {nightly ? (
          <div className="text-right lg:w-full">
            <p className="text-xl font-bold text-foreground sm:text-2xl">
              {formatPrice(nightly)}
            </p>
            <p className="text-[11px] text-muted">base rate / night</p>
          </div>
        ) : null}
        <div className="flex w-full flex-col items-stretch gap-2 lg:w-auto">
          <button
            type="button"
            onClick={() =>
              onSelect({
                room,
                mealPlan: comboOffer.mealPlan,
                comboOffer,
                inventoryKey,
                isComboMode: true,
                selectedCount: comboSelected ? comboTotal : 0,
                categoryLabel: room.inventoryLabel || room.name,
                primarySlots: comboOffer.primarySlots,
                maxSelectable: comboOffer.maxSelectable,
                initialCount: comboSelected ? comboTotal : comboOffer.targetCount,
              })
            }
            className={`inline-flex min-w-[8.5rem] items-center justify-center rounded px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition sm:min-w-[9rem] sm:text-sm ${
              comboSelected && !customComboActive
                ? "border border-brand bg-white text-brand"
                : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            {comboSelected && !customComboActive ? `${comboTotal} Confirmed` : "Confirm Combo"}
          </button>
          <button
            type="button"
            onClick={onCustomize}
            className="text-center text-xs font-bold uppercase tracking-wide text-brand underline-offset-2 hover:underline"
          >
            {customComboActive ? "Edit customise" : "Customise"}
          </button>
          {comboSelected || customComboActive ? (
            <button
              type="button"
              onClick={onClear}
              className="text-center text-[11px] font-semibold text-[#757575] underline hover:text-brand"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StaticMealPlanRow({ plan }) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-foreground sm:text-base">{plan.mmtLabel}</h4>
        <ul className="mt-2 space-y-1.5">
          <li className="flex items-center gap-2 text-xs text-stone-600 sm:text-sm">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                plan.inclusionType === "none"
                  ? "bg-stone-200 text-stone-500"
                  : "bg-brand-muted text-brand"
              }`}
            >
              <MealInclusionIcon type={plan.inclusionType} />
            </span>
            {plan.inclusion}
          </li>
        </ul>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:gap-2 sm:text-right">
        <div>
          <p className="text-xl font-bold text-foreground sm:text-2xl">{formatPrice(plan.total)}</p>
          <p className="text-[11px] text-muted">per night + taxes</p>
        </div>
        <a
          href="#book"
          className="inline-flex min-w-[8.5rem] items-center justify-center rounded border border-brand bg-brand px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark sm:min-w-[9rem] sm:text-sm"
        >
          Select Room
        </a>
      </div>
    </div>
  );
}

function buildEnquiryDefaultLocation(propertyName, trip) {
  const place = trip?.city || trip?.state || "";
  if (propertyName && place) return `${propertyName}, ${place}`;
  return propertyName || place;
}

export default function PropertyRooms({ rooms, propertyName = "" }) {
  const selection = usePropertyRoomSelection();
  const [modalState, setModalState] = useState(null);
  const [customizeExpanded, setCustomizeExpanded] = useState(false);
  const [bulkEnquiryOpen, setBulkEnquiryOpen] = useState(false);
  const [bulkEnquiryVariant, setBulkEnquiryVariant] = useState("bulk");
  const [requestedBulkRooms, setRequestedBulkRooms] = useState(
    MAX_SELF_SERVICE_SEARCH_ROOMS + 1
  );
  const customizeSectionRef = useRef(null);
  const noMealPlansEnquiryTripRef = useRef(null);

  const openBulkEnquiry = useCallback((roomCount, variant = "bulk") => {
    if (variant === "unavailable") {
      setRequestedBulkRooms(Math.max(1, roomCount));
    } else {
      setRequestedBulkRooms(Math.max(MAX_SELF_SERVICE_SEARCH_ROOMS + 1, roomCount));
    }
    setBulkEnquiryVariant(variant);
    setBulkEnquiryOpen(true);
    setModalState(null);
  }, []);

  usePropertyOverlay(Boolean(modalState), "room-selection-modal");
  usePropertyOverlay(Boolean(selection?.availabilityNotice), "availability-notice");

  const openCustomizeSection = useCallback(() => {
    setCustomizeExpanded(true);
    requestAnimationFrame(() => {
      customizeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (selection?.customRoomSlots?.length) {
      setCustomizeExpanded(true);
    }
  }, [selection?.customRoomSlots?.length]);

  const roomCountLabel = useMemo(
    () => `${rooms.length} Room Type${rooms.length !== 1 ? "s" : ""}`,
    [rooms.length]
  );

  const hasInventory = Boolean(selection?.hasInventory);
  const inventoryB2c = selection?.inventoryB2c;
  const nightDates = selection?.nightDates || [];
  const guests = selection?.guests || { adults: 2, children: 0, rooms: 1, childAges: [] };
  const searchRooms = getRequiredRoomCount(guests);

  const needsComboMode = useMemo(() => {
    if (!hasInventory || !inventoryB2c) return false;
    if (selection?.customRoomSlots?.length) return true;
    return hasRoomComboScenario({
      inventoryB2c,
      rooms,
      selections: selection?.selections || {},
      nightDates,
      guests,
    });
  }, [
    hasInventory,
    inventoryB2c,
    rooms,
    selection?.selections,
    selection?.customRoomSlots,
    nightDates,
    guests,
  ]);

  const tripKey = `${nightDates.join("|")}-${guests?.adults}-${guests?.children}-${guests?.rooms}`;

  const enquiryDefaultLocation = useMemo(
    () => buildEnquiryDefaultLocation(propertyName, selection?.trip),
    [propertyName, selection?.trip?.city, selection?.trip?.state]
  );

  const hasUnavailableMealPlans = useMemo(() => {
    if (!hasInventory || !inventoryB2c) return false;
    return rooms.some((room) => {
      const categoryData = getInventoryCategoryData(inventoryB2c, room.inventoryCategoryKey);
      if (!categoryData) return false;
      return getAvailableMealPlansForStay(categoryData, nightDates).length === 0;
    });
  }, [hasInventory, inventoryB2c, rooms, nightDates]);

  useEffect(() => {
    if (needsComboMode) setCustomizeExpanded(true);
  }, [tripKey, needsComboMode]);

  useEffect(() => {
    if (!hasUnavailableMealPlans) return;
    if (noMealPlansEnquiryTripRef.current === tripKey) return;
    noMealPlansEnquiryTripRef.current = tripKey;
    openBulkEnquiry(searchRooms, "unavailable");
  }, [hasUnavailableMealPlans, tripKey, searchRooms, openBulkEnquiry]);

  const handleConfirm = (count) => {
    if (!modalState || !selection) return;
    const payload = {
      inventoryKey: modalState.inventoryKey,
      categoryLabel: modalState.room.inventoryLabel || modalState.room.name,
      roomId: modalState.room.id,
      mealPlan: modalState.mealPlan,
      count,
      categoryData: modalState.categoryData,
    };

    if (count > 0) {
      if (modalState.isComboMode) {
        if (count > MAX_SELF_SERVICE_SEARCH_ROOMS) {
          openBulkEnquiry(count);
          return;
        }
      } else {
        const currentTotal = selection.totalSelectedRooms || 0;
        const currentPlanCount = selection.getSelectedCountForPlan(
          modalState.inventoryKey,
          modalState.mealPlan
        );
        const newTotal = currentTotal - currentPlanCount + count;
        if (newTotal > MAX_SELF_SERVICE_SEARCH_ROOMS) {
          openBulkEnquiry(newTotal);
          return;
        }
      }
    }

    if (count === 0) {
      if (modalState.isComboMode) {
        selection.applyComboSelection(payload);
      } else {
        selection.clearMealPlanSelection(payload);
      }
    } else if (modalState.isComboMode) {
      selection.applyComboSelection(payload);
    } else {
      selection.setPlanRoomCount(payload);
    }
  };

  const handleCustomizeApply = ({ selections: nextSelections, roomSlots }) => {
    if (!selection) return;
    const total = roomSlots?.length || 0;
    if (total > MAX_SELF_SERVICE_SEARCH_ROOMS) {
      openBulkEnquiry(total);
      return;
    }
    selection.applyCustomSelection({ selections: nextSelections, roomSlots });
  };

  const handleCustomizeClear = () => {
    if (!selection) return;
    selection.applyCustomSelection({ selections: {}, roomSlots: [] });
  };

  const handleClear = (room, mealPlan, categoryData, inventoryKey, isCombo = false) => {
    if (!selection) return;
    const payload = {
      inventoryKey,
      categoryLabel: room.inventoryLabel || room.name,
      roomId: room.id,
      mealPlan,
      count: 0,
      categoryData,
    };
    if (isCombo) {
      selection.applyComboSelection(payload);
    } else {
      selection.clearMealPlanSelection(payload);
    }
  };

  return (
    <section id="rooms" className="scroll-mt-44">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">{roomCountLabel}</h2>
        <p className="text-xs text-muted">
          {hasInventory
            ? needsComboMode
              ? `${searchRooms} rooms needed — pick a combo or customise your mix`
              : "Prices & availability based on your dates and guests"
            : "Select dates & guests to see final price"}
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {rooms.map((room) => {
          const specs = [room.size, room.view, room.bed].filter(Boolean).join(" | ");
          const inventoryKey = room.inventoryCategoryKey;
          const categoryData = getInventoryCategoryData(inventoryB2c, inventoryKey);
          const staticPlans = room.mealPlans?.length ? room.mealPlans : [];
          const fallbackPlan = {
            code: "EP",
            mmtLabel: "Room Only",
            inclusion: "No meals included",
            inclusionType: "none",
            total: room.price,
          };

          const inventoryMealPlans =
            hasInventory && categoryData
              ? getAvailableMealPlansForStay(categoryData, nightDates)
              : [];

          const maxAvailable =
            hasInventory && categoryData
              ? getCategoryAvailability(categoryData, nightDates)
              : 0;

          const categorySelection = inventoryKey
            ? selection?.getSelectionForCategory(inventoryKey)
            : null;
          const remainingForCategory =
            hasInventory && categoryData && inventoryKey && selection
              ? selection.getRemainingForCategory(inventoryKey, categoryData)
              : 0;

          return (
            <article
              key={room.id}
              className="overflow-hidden border border-border bg-white shadow-sm"
            >
              <div className="flex flex-col md:flex-row">
                <div className="shrink-0 border-b border-border p-4 md:w-56 md:border-b-0 md:border-r lg:w-64">
                  <div className="relative h-40 w-full overflow-hidden bg-stone-100 sm:h-44">
                    <Image
                      src={room.image}
                      alt={room.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 256px"
                    />
                  </div>

                  <div className="mt-3">
                    <h3 className="text-base font-bold text-foreground">{room.name}</h3>
                    {(room.inventoryLabel || room.category) && (
                      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-brand">
                        {room.inventoryLabel || room.category}
                      </p>
                    )}
                    {specs && (
                      <p className="mt-0.5 text-xs text-muted sm:text-sm">({specs})</p>
                    )}

                    {hasInventory && categoryData ? (
                      <p className="mt-2 text-xs font-semibold text-[#2e7d32]">
                        {maxAvailable > 0
                          ? `${maxAvailable} room${maxAvailable !== 1 ? "s" : ""} available`
                          : "Sold out for selected dates"}
                      </p>
                    ) : null}

                    {room.amenities?.length > 0 && (
                      <ul className="mt-2.5 space-y-1">
                        {room.amenities.slice(0, 8).map((a) => (
                          <li
                            key={a}
                            className="flex items-center gap-2 text-xs text-stone-600 sm:text-sm"
                          >
                            <span className="text-brand">•</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}

                    {room.badge && (
                      <p className="mt-2 text-xs font-semibold text-brand">{room.badge}</p>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1 divide-y divide-border bg-[#fafafa]">
                  {hasInventory && categoryData && inventoryMealPlans.length > 0 ? (
                    inventoryMealPlans.map((mealPlan) => {
                      const offer = buildMealPlanOffer(
                        categoryData,
                        mealPlan,
                        nightDates,
                        guests
                      );
                      const selectedCount = selection
                        ? selection.getSelectedCountForPlan(inventoryKey, mealPlan)
                        : 0;
                      const comboActive =
                        selection?.isComboSelected(mealPlan, inventoryKey) &&
                        !selection?.customRoomSlots;
                      const customComboActive = Boolean(
                        selection?.customRoomSlots?.length && selection?.totalSelectedRooms > 0
                      );
                      const comboTotal = customComboActive
                        ? selection?.totalSelectedRooms || 0
                        : selection?.getComboTotalForPlan(mealPlan) || 0;
                      const comboOffer =
                        hasInventory && selection
                          ? getComboOfferForCategory({
                              inventoryB2c,
                              rooms,
                              selections: selection.selections,
                              primaryRoom: room,
                              mealPlan,
                              nightDates,
                              guests,
                            })
                          : null;
                      const planSlots = selection
                        ? selection.getPrimarySlotsForPlan(inventoryKey, categoryData, mealPlan)
                        : maxAvailable;
                      const primarySlots = planSlots;

                      if (needsComboMode && !comboOffer) return null;

                      return (
                        <div key={`${room.id}-${mealPlan}`}>
                          {!needsComboMode ? (
                            <InventoryMealPlanRow
                              room={room}
                              mealPlan={mealPlan}
                              offer={offer}
                              categoryData={categoryData}
                              inventoryKey={inventoryKey}
                              nightDates={nightDates}
                              guests={guests}
                              maxAvailable={maxAvailable}
                              planSlots={planSlots}
                              selectedCount={selectedCount}
                              remainingForCategory={remainingForCategory}
                              comboActive={comboActive}
                              onSelect={(state) =>
                                setModalState({
                                  ...state,
                                  isComboMode: false,
                                  primarySlots,
                                  maxSelectable: Math.max(
                                    selectedCount,
                                    remainingForCategory + selectedCount
                                  ),
                                  initialCount: Math.max(
                                    selectedCount,
                                    Math.min(searchRooms, primarySlots)
                                  ),
                                })
                              }
                              onClear={() =>
                                handleClear(room, mealPlan, categoryData, inventoryKey, false)
                              }
                            />
                          ) : null}
                          {comboOffer ? (
                            <InventoryComboRow
                              room={room}
                              comboOffer={comboOffer}
                              inventoryKey={inventoryKey}
                              nightDates={nightDates}
                              guests={guests}
                              comboSelected={comboActive}
                              customComboActive={customComboActive}
                              comboTotal={comboTotal}
                              onSelect={setModalState}
                              onCustomize={openCustomizeSection}
                              onClear={() => {
                                if (customComboActive) {
                                  handleCustomizeClear();
                                } else {
                                  handleClear(room, mealPlan, categoryData, inventoryKey, true);
                                }
                              }}
                            />
                          ) : null}
                        </div>
                      );
                    })
                  ) : hasInventory ? (
                    <div className="flex min-h-[8rem] flex-col items-center justify-center gap-3 p-6 text-center">
                      <p className="text-sm text-[#757575]">
                        No meal plans available for this room category on your selected dates.
                        <span className="mt-1 block text-xs">
                          Try different check-in or check-out dates.
                        </span>
                      </p>
                      <button
                        type="button"
                        onClick={() => openBulkEnquiry(searchRooms, "unavailable")}
                        className="rounded border border-brand bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-brand-dark"
                      >
                        Send enquiry
                      </button>
                    </div>
                  ) : (
                    (staticPlans.length > 0 ? staticPlans : [fallbackPlan]).map((plan) => (
                      <StaticMealPlanRow key={`${room.id}-${plan.code}`} plan={plan} />
                    ))
                  )}
                </div>
              </div>

              {categorySelection && sumCategorySelectedRooms(categorySelection) > 0 ? (
                <div className="border-t border-border bg-brand-muted/30 px-4 py-2 text-xs font-semibold text-brand">
                  {sumCategorySelectedRooms(categorySelection)} room
                  {sumCategorySelectedRooms(categorySelection) !== 1 ? "s" : ""} selected in{" "}
                  {room.inventoryLabel || room.category}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <RoomComboCustomizeSection
        sectionRef={customizeSectionRef}
        rooms={rooms}
        inventoryB2c={inventoryB2c}
        nightDates={nightDates}
        guests={guests}
        currentSelections={selection?.selections}
        customRoomSlots={selection?.customRoomSlots}
        expanded={customizeExpanded}
        onExpandedChange={setCustomizeExpanded}
        onApply={handleCustomizeApply}
      />

      <RoomSelectionModal
        open={Boolean(modalState)}
        onClose={() => setModalState(null)}
        roomName={modalState?.room?.name || "Room"}
        mealPlan={
          modalState?.offer || {
            code: modalState?.mealPlan,
            mmtLabel: modalState?.mealPlan,
          }
        }
        categoryData={modalState?.categoryData}
        inventoryKey={modalState?.inventoryKey}
        inventoryB2c={inventoryB2c}
        rooms={rooms}
        selections={selection?.selections}
        isComboMode={modalState?.isComboMode}
        categoryLabel={modalState?.categoryLabel}
        nightDates={nightDates}
        guests={guests}
        primarySlots={modalState?.primarySlots || 0}
        maxSelectable={modalState?.maxSelectable || 0}
        searchRoomCount={getRequiredRoomCount(guests)}
        initialCount={modalState?.initialCount || getRequiredRoomCount(guests)}
        hasSelection={(modalState?.selectedCount || 0) > 0}
        onConfirm={handleConfirm}
      />

      <RoomAvailabilityNotice
        notice={selection?.availabilityNotice}
        onDismiss={selection?.dismissAvailabilityNotice}
      />

      <BulkStayEnquiryForm
        open={bulkEnquiryOpen}
        onClose={() => setBulkEnquiryOpen(false)}
        guests={guests}
        requestedRooms={requestedBulkRooms}
        defaultLocation={enquiryDefaultLocation}
        variant={bulkEnquiryVariant}
      />
    </section>
  );
}
