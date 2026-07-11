"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  deriveGuestsFromPropertySelection,
  serializeChildAgesParam,
} from "@/lib/guestOccupancy";
import { persistTripSearch } from "@/lib/bookingSearch";
import {
  buildRoomComboAllocation,
  calculateSelectionGrandTotal,
  getAvailableMealPlansForStay,
  getCategoryAvailability,
  getCategorySlotsForPlan,
  getMaxSelectableWithCombo,
  getRemainingCategoryAvailability,
  getRequiredRoomCount,
  getStayNightDates,
  getTotalRoomsForMealPlan,
  isComboActiveForPrimary,
  isMealPlanAvailableForStay,
  sumCategorySelectedRooms,
} from "@/lib/propertyInventory";
import { getMinimumRoomsRequired } from "@/lib/guestOccupancy";
import { getDefaultListingsDirectUrlDates } from "@/lib/dates";
import { useTripSearch } from "@/hooks/useTripSearch";
const PropertyRoomSelectionContext = createContext(null);

export function PropertyRoomSelectionProvider({
  inventoryB2c,
  rooms,
  initialTrip,
  propertyState = "",
  children,
}) {
  const [selections, setSelections] = useState({});
  const [customRoomSlots, setCustomRoomSlots] = useState(null);
  const [availabilityNotice, setAvailabilityNotice] = useState(null);
  const [hasOverlay, setHasOverlay] = useState(false);
  const overlayIdsRef = useRef(new Set());
  const userClearedSelectionRef = useRef(false);
  const userCustomizedRef = useRef(false);
  const pageAvailabilityNoticeShownRef = useRef(false);
  const internalGuestsSyncRef = useRef(false);
  const pendingGuestsSyncRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const applyAllocationsToSelections = useCallback((base, allocations, mealPlan) => {
    const cleared = { ...base };
    for (const [key, sel] of Object.entries(base)) {
      if (!sel.plans?.[mealPlan]) continue;
      const newPlans = { ...sel.plans };
      delete newPlans[mealPlan];
      if (Object.keys(newPlans).length === 0) {
        delete cleared[key];
      } else {
        cleared[key] = { ...sel, plans: newPlans };
      }
    }

    const next = { ...cleared };
    for (const alloc of allocations) {
      const current = next[alloc.inventoryKey] || {
        inventoryKey: alloc.inventoryKey,
        roomId: alloc.roomId,
        categoryLabel: alloc.categoryLabel,
        plans: {},
      };
      next[alloc.inventoryKey] = {
        ...current,
        roomId: alloc.roomId,
        categoryLabel: alloc.categoryLabel,
        plans: {
          ...current.plans,
          [mealPlan]: alloc.roomCount,
        },
      };
    }
    return next;
  }, []);
  const trip = useTripSearch(initialTrip);
  const defaultDates = useMemo(() => getDefaultListingsDirectUrlDates(), []);

  const checkIn = trip.checkIn || defaultDates.checkIn;
  const checkOut = trip.checkOut || defaultDates.checkOut;
  const guests = trip.guests;
  const nightDates = useMemo(
    () => getStayNightDates(checkIn, checkOut),
    [checkIn, checkOut]
  );

  const guestsKey = useMemo(
    () =>
      `${guests?.adults}-${guests?.children}-${guests?.rooms}-${serializeChildAgesParam(guests?.childAges)}`,
    [guests]
  );

  const syncTripGuestsFromSelection = useCallback(
    (customSlots, totalRooms) => {
      const selectedRooms = Math.max(0, Number(totalRooms) || 0);
      if (selectedRooms < 1) return;

      const nextGuests = deriveGuestsFromPropertySelection(
        guests,
        customSlots,
        selectedRooms
      );
      const nextGuestsKey = `${nextGuests.adults}-${nextGuests.children}-${nextGuests.rooms}-${serializeChildAgesParam(nextGuests.childAges)}`;
      if (nextGuestsKey === guestsKey) return;

      internalGuestsSyncRef.current = true;
      persistTripSearch(
        {
          category: trip.category,
          city: trip.city,
          state: trip.state,
          checkIn,
          checkOut,
          guests: nextGuests,
        },
        { router, pathname, searchParams }
      );
    },
    [
      guests,
      guestsKey,
      trip.category,
      trip.city,
      trip.state,
      checkIn,
      checkOut,
      router,
      pathname,
      searchParams,
    ]
  );

  const queueGuestsSync = useCallback((customSlots, totalRooms) => {
    pendingGuestsSyncRef.current = { customSlots, totalRooms };
  }, []);

  useEffect(() => {
    const pending = pendingGuestsSyncRef.current;
    if (!pending) return;
    pendingGuestsSyncRef.current = null;
    syncTripGuestsFromSelection(pending.customSlots, pending.totalRooms);
  });

  const totalRoomsInSelections = useCallback((selectionMap) => {
    return Object.values(selectionMap || {}).reduce(
      (sum, selection) => sum + sumCategorySelectedRooms(selection),
      0
    );
  }, []);

  useEffect(() => {
    if (internalGuestsSyncRef.current) {
      internalGuestsSyncRef.current = false;
      return;
    }
    userClearedSelectionRef.current = false;
    userCustomizedRef.current = false;
    pageAvailabilityNoticeShownRef.current = false;
    setAvailabilityNotice(null);
    setCustomRoomSlots(null);
  }, [nightDates.join("|"), guestsKey]);

  useEffect(() => {
    if (!inventoryB2c || !nightDates.length) return;

    setSelections((prev) => {
      let changed = false;
      const next = {};

      for (const [key, selection] of Object.entries(prev)) {
        const categoryData = inventoryB2c[selection.inventoryKey];
        if (!categoryData) {
          changed = true;
          continue;
        }

        const validPlans = getAvailableMealPlansForStay(categoryData, nightDates);
        const filteredPlans = {};
        for (const [mealPlan, count] of Object.entries(selection.plans || {})) {
          if (validPlans.includes(mealPlan) && isMealPlanAvailableForStay(categoryData, mealPlan, nightDates)) {
            filteredPlans[mealPlan] = count;
          } else {
            changed = true;
          }
        }

        if (Object.keys(filteredPlans).length > 0) {
          next[key] = { ...selection, plans: filteredPlans };
        } else if (Object.keys(selection.plans || {}).length > 0) {
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [inventoryB2c, nightDates]);

  useEffect(() => {
    if (!inventoryB2c || !nightDates.length || !rooms?.length) return;

    const searchRoomCount = getRequiredRoomCount(guests);
    let notice = null;

    setSelections((prev) => {
      if (userCustomizedRef.current || userClearedSelectionRef.current) {
        if (Object.keys(prev).length === 0) return prev;
        let changed = false;
        const next = { ...prev };
        for (const [key, selection] of Object.entries(prev)) {
          const categoryData = inventoryB2c[selection.inventoryKey];
          if (!categoryData) continue;
          const updatedPlans = { ...selection.plans };
          for (const [plan, count] of Object.entries(selection.plans || {})) {
            const slots = getCategorySlotsForPlan(selection, categoryData, nightDates, plan);
            const capped = Math.min(slots, Math.max(0, Number(count) || 0));
            if (capped !== count) {
              updatedPlans[plan] = capped;
              changed = true;
            }
          }
          const hasPlans = Object.values(updatedPlans).some((c) => Number(c) > 0);
          if (hasPlans) {
            next[key] = { ...selection, plans: updatedPlans };
          } else {
            delete next[key];
            changed = true;
          }
        }
        return changed ? next : prev;
      }

      if (Object.keys(prev).length > 0) {
        return prev;
      }

      // Do not auto-select rooms on load — user picks via meal plan or customize.
      for (const room of rooms) {
        if (!room.inventoryCategoryKey) continue;
        const categoryData = inventoryB2c[room.inventoryCategoryKey];
        if (!categoryData) continue;

        const maxAvailable = getCategoryAvailability(categoryData, nightDates);
        if (maxAvailable <= 0) continue;

        const plans = getAvailableMealPlansForStay(categoryData, nightDates);
        if (!plans.length) continue;

        const mealPlan = plans[0];
        const count = Math.min(maxAvailable, searchRoomCount);

        if (searchRoomCount > count && !pageAvailabilityNoticeShownRef.current) {
          const maxCombo = getMaxSelectableWithCombo({
            inventoryB2c,
            rooms,
            selections: {},
            primaryInventoryKey: room.inventoryCategoryKey,
            mealPlan,
            nightDates,
            guests,
          });
          if (searchRoomCount > maxCombo) {
            notice = {
              requested: searchRoomCount,
              available: maxCombo,
              categoryLabel: room.inventoryLabel || room.name || room.category,
            };
            pageAvailabilityNoticeShownRef.current = true;
          }
        }
        break;
      }

      return prev;
    });

    if (notice) {
      setAvailabilityNotice(notice);
    }
  }, [inventoryB2c, nightDates, rooms, guests, applyAllocationsToSelections]);

  const dismissAvailabilityNotice = useCallback(() => {
    setAvailabilityNotice(null);
  }, []);

  const registerOverlay = useCallback((id) => {
    overlayIdsRef.current.add(id);
    setHasOverlay(true);
  }, []);

  const unregisterOverlay = useCallback((id) => {
    overlayIdsRef.current.delete(id);
    setHasOverlay(overlayIdsRef.current.size > 0);
  }, []);

  const applyComboSelection = useCallback(
    ({ inventoryKey, categoryLabel, roomId, mealPlan, count, categoryData }) => {
      const minRooms = getMinimumRoomsRequired(guests);
      const requestedCount = Math.max(0, Number(count) || 0);

      if (requestedCount === 0) {
        userClearedSelectionRef.current = true;
        userCustomizedRef.current = false;
        setCustomRoomSlots(null);
        setSelections({});
        return { fulfilled: true, comboRooms: 0 };
      }

      // Automatic combo replaces any customize selection (mutually exclusive).
      userClearedSelectionRef.current = false;
      userCustomizedRef.current = false;
      setCustomRoomSlots(null);
      const safeCount = Math.max(minRooms, requestedCount);
      let comboResult = null;
      let guestsSyncTotalRooms = 0;

      setSelections(() => {
        comboResult = buildRoomComboAllocation({
          inventoryB2c,
          rooms,
          selections: {},
          primaryInventoryKey: inventoryKey,
          mealPlan,
          requestedCount: safeCount,
          nightDates,
        });

        if (!comboResult.allocations.length) {
          return {};
        }

        const next = applyAllocationsToSelections(
          {},
          comboResult.allocations,
          mealPlan
        );
        guestsSyncTotalRooms = totalRoomsInSelections(next);
        return next;
      });

      if (guestsSyncTotalRooms > 0) {
        queueGuestsSync(null, guestsSyncTotalRooms);
      }

      return comboResult;
    },
    [
      inventoryB2c,
      rooms,
      nightDates,
      guests,
      applyAllocationsToSelections,
      queueGuestsSync,
      totalRoomsInSelections,
    ]
  );

  const applyCustomSelection = useCallback(
    ({ selections: nextSelections, roomSlots }) => {
      // Customize replaces any automatic combo selection (mutually exclusive).
      userClearedSelectionRef.current = false;
      userCustomizedRef.current = true;
      const slots = roomSlots?.length ? roomSlots : null;
      const nextSelectionMap = slots ? nextSelections || {} : {};
      setCustomRoomSlots(slots);
      setSelections(nextSelectionMap);
      const totalRooms = slots?.length
        ? slots.filter(Boolean).length
        : totalRoomsInSelections(nextSelectionMap);
      queueGuestsSync(slots, totalRooms);
    },
    [queueGuestsSync, totalRoomsInSelections]
  );

  const setPlanRoomCount = useCallback(
    ({ inventoryKey, categoryLabel, roomId, mealPlan, count, categoryData }) => {
      const maxAvailable = getCategoryAvailability(categoryData, nightDates);
      const rawCount = Math.max(0, Number(count) || 0);
      const safeCount = rawCount === 0 ? 0 : Math.min(rawCount, maxAvailable);

      userCustomizedRef.current = true;
      setCustomRoomSlots(null);

      let guestsSyncTotalRooms = 0;

      setSelections((prev) => {
        const current = prev[inventoryKey] || {
          inventoryKey,
          categoryLabel,
          roomId,
          plans: {},
        };
        const otherPlansTotal = Object.entries(current.plans).reduce((sum, [code, value]) => {
          if (code === mealPlan) return sum;
          return sum + Math.max(0, Number(value) || 0);
        }, 0);
        const allowed = Math.max(0, maxAvailable - otherPlansTotal);
        const nextCount = Math.min(safeCount, allowed);

        const nextPlans = { ...current.plans };
        if (nextCount > 0) {
          nextPlans[mealPlan] = nextCount;
        } else {
          delete nextPlans[mealPlan];
        }

        const next = { ...prev };
        if (Object.keys(nextPlans).length === 0) {
          delete next[inventoryKey];
        } else {
          next[inventoryKey] = { ...current, plans: nextPlans };
        }
        guestsSyncTotalRooms = totalRoomsInSelections(next);
        return next;
      });

      if (guestsSyncTotalRooms > 0) {
        queueGuestsSync(null, guestsSyncTotalRooms);
      }
    },
    [nightDates, queueGuestsSync, totalRoomsInSelections]
  );

  const clearMealPlanSelection = useCallback(
    ({ inventoryKey, categoryLabel, roomId, mealPlan, categoryData }) => {
      userClearedSelectionRef.current = true;
      userCustomizedRef.current = true;
      setCustomRoomSlots(null);
      setPlanRoomCount({
        inventoryKey,
        categoryLabel,
        roomId,
        mealPlan,
        count: 0,
        categoryData,
      });
    },
    [setPlanRoomCount]
  );

  const getSelectionForCategory = useCallback(
    (inventoryKey) => selections[inventoryKey] || null,
    [selections]
  );

  const getRemainingForCategory = useCallback(
    (inventoryKey, categoryData) => {
      const selection = selections[inventoryKey];
      return getRemainingCategoryAvailability(categoryData, nightDates, selection);
    },
    [nightDates, selections]
  );

  const getSelectedCountForPlan = useCallback(
    (inventoryKey, mealPlan) => {
      const selection = selections[inventoryKey];
      return Math.max(0, Number(selection?.plans?.[mealPlan]) || 0);
    },
    [selections]
  );

  const getComboMaxSelectable = useCallback(
    (primaryInventoryKey, mealPlan) => {
      if (!inventoryB2c) return 0;
      return getMaxSelectableWithCombo({
        inventoryB2c,
        rooms,
        selections,
        primaryInventoryKey,
        mealPlan,
        nightDates,
        guests,
      });
    },
    [inventoryB2c, rooms, selections, nightDates, guests]
  );

  const getPrimarySlotsForPlan = useCallback(
    (inventoryKey, categoryData, mealPlan) => {
      const selection = selections[inventoryKey];
      return getCategorySlotsForPlan(selection, categoryData, nightDates, mealPlan);
    },
    [selections, nightDates]
  );

  const isComboSelected = useCallback(
    (mealPlan, primaryInventoryKey) =>
      isComboActiveForPrimary(selections, rooms, mealPlan, primaryInventoryKey),
    [selections, rooms]
  );

  const getComboTotalForPlan = useCallback(
    (mealPlan) => getTotalRoomsForMealPlan(selections, mealPlan),
    [selections]
  );

  const grandTotal = useMemo(
    () =>
      calculateSelectionGrandTotal(
        selections,
        inventoryB2c,
        nightDates,
        guests,
        rooms,
        customRoomSlots
      ),
    [selections, inventoryB2c, nightDates, guests, rooms, customRoomSlots]
  );

  const totalSelectedRooms = useMemo(() => {
    if (customRoomSlots?.length) {
      return customRoomSlots.length;
    }
    return Object.values(selections).reduce(
      (sum, selection) => sum + sumCategorySelectedRooms(selection),
      0
    );
  }, [selections, customRoomSlots]);

  const value = useMemo(
    () => ({
      inventoryB2c,
      rooms,
      selections,
      trip,
      checkIn,
      checkOut,
      guests,
      nightDates,
      grandTotal,
      selectionLineItems: grandTotal.lineItems || [],
      totalSelectedRooms,
      setPlanRoomCount,
      applyComboSelection,
      applyCustomSelection,
      customRoomSlots,
      clearMealPlanSelection,
      availabilityNotice,
      dismissAvailabilityNotice,
      hasOverlay,
      registerOverlay,
      unregisterOverlay,
      getComboMaxSelectable,
      getPrimarySlotsForPlan,
      isComboSelected,
      getComboTotalForPlan,
      getSelectionForCategory,
      getRemainingForCategory,
      getSelectedCountForPlan,
      hasInventory: Boolean(inventoryB2c && Object.keys(inventoryB2c).length),
    }),
    [
      inventoryB2c,
      rooms,
      selections,
      trip,
      checkIn,
      checkOut,
      guests,
      nightDates,
      grandTotal,
      totalSelectedRooms,
      setPlanRoomCount,
      applyComboSelection,
      applyCustomSelection,
      customRoomSlots,
      clearMealPlanSelection,
      availabilityNotice,
      dismissAvailabilityNotice,
      hasOverlay,
      registerOverlay,
      unregisterOverlay,
      getComboMaxSelectable,
      getPrimarySlotsForPlan,
      isComboSelected,
      getComboTotalForPlan,
      getSelectionForCategory,
      getRemainingForCategory,
      getSelectedCountForPlan,
    ]
  );

  return (
    <PropertyRoomSelectionContext.Provider value={value}>
      {children}
    </PropertyRoomSelectionContext.Provider>
  );
}

export function usePropertyRoomSelection() {
  const context = useContext(PropertyRoomSelectionContext);
  return context;
}
