import { addDays, startOfDay, toDateParam } from "@/lib/dates";
import {
  applyPropertyPriceMarkup,
  applyPropertyPricingMarkup,
  calculateGstFromNightlyAmounts,
} from "@/lib/bookingPricing";
import { MEAL_PLAN_DEFS } from "@/lib/property";
import {
  countYoungChildren,
  getEffectiveAdults,
  getMinimumRoomsRequired,
  normalizeChildAges,
} from "@/lib/guestOccupancy";

export const INVENTORY_MEAL_PLANS = ["EP", "CP", "MAP", "AP"];

export function normalizeCategoryKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function dateKey(value) {
  if (!value) return "";
  if (value instanceof Date) return toDateParam(value);
  return String(value).slice(0, 10);
}

export function getStayNightDates(checkIn, checkOut) {
  if (!checkIn || !checkOut) return [];
  const dates = [];
  let current = startOfDay(checkIn);
  const end = startOfDay(checkOut);
  while (current < end) {
    dates.push(toDateParam(current));
    current = addDays(current, 1);
  }
  return dates;
}

function scoreCategoryMatch(inventoryKey, candidate) {
  const key = normalizeCategoryKey(inventoryKey);
  const target = normalizeCategoryKey(candidate);
  if (!key || !target) return 0;
  if (key === target) return 1000;
  if (key.startsWith(target) || target.startsWith(key)) {
    return 500 + Math.min(key.length, target.length);
  }
  if (key.includes(target) || target.includes(key)) {
    return 100 + Math.min(key.length, target.length);
  }
  return 0;
}

/**
 * Match a property room to an inventory.b2c category.
 * Prefer roomName over roomType — API roomType is often generic (e.g. "Deluxe").
 */
export function findInventoryCategory(b2c, ...candidates) {
  if (!b2c) return null;

  const targets = candidates
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  if (!targets.length) return null;

  let best = null;
  let bestScore = 0;

  for (const [key, data] of Object.entries(b2c)) {
    for (let i = 0; i < targets.length; i++) {
      const score = scoreCategoryMatch(key, targets[i]) - i * 5;
      if (score > bestScore) {
        bestScore = score;
        best = { key, data };
      }
    }
  }

  return bestScore > 0 ? best : null;
}

export function getRateValue(rateArray, nightDate) {
  if (!Array.isArray(rateArray)) return null;
  const target = dateKey(nightDate);
  const entry = rateArray.find((row) => dateKey(row?.date) === target);
  const raw = entry?.value;
  if (raw === null || raw === undefined || raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function getMinAvailabilityForStay(availability, nightDates) {
  if (!Array.isArray(availability) || !nightDates.length) return 0;

  let minAvailable = Infinity;
  for (const night of nightDates) {
    const entry = availability.find((row) => dateKey(row?.date) === night);
    const available = Number(entry?.available);
    if (!Number.isFinite(available)) return 0;
    minAvailable = Math.min(minAvailable, available);
  }

  return Number.isFinite(minAvailable) ? Math.max(0, minAvailable) : 0;
}

export function isMealPlanAvailableForStay(categoryData, mealPlan, nightDates) {
  const planRates = categoryData?.rates?.[mealPlan];
  if (!planRates?.["1"] || !nightDates.length) return false;

  return nightDates.every((night) => {
    const value = getRateValue(planRates["1"], night);
    return value !== null && value > 0;
  });
}

export function getInventoryMealPlans(categoryData) {
  if (!categoryData?.rates) return [];
  return INVENTORY_MEAL_PLANS.filter((code) => {
    const rates = categoryData.rates[code];
    return rates && typeof rates === "object" && rates["1"];
  });
}

/** Meal plans that have valid base rates on every night of the stay. */
export function getAvailableMealPlansForStay(categoryData, nightDates) {
  if (!categoryData?.rates || !nightDates?.length) return [];
  return INVENTORY_MEAL_PLANS.filter((code) =>
    isMealPlanAvailableForStay(categoryData, code, nightDates)
  );
}

export function distributeGuestsAcrossRoomCount(guests, roomCount) {
  const count = Math.max(1, Number(roomCount) || 1);
  const childAges = normalizeChildAges(guests?.childAges, guests?.children ?? 0);
  const totalEffectiveAdults = getEffectiveAdults({
    adults: guests?.adults ?? 2,
    childAges,
  });
  let remainingYoungChildren = countYoungChildren(childAges);

  const distribution = Array.from({ length: count }, () => ({
    effectiveAdults: 0,
    youngChildren: 0,
  }));

  let adultsLeft = totalEffectiveAdults;
  let guard = 0;
  while (adultsLeft > 0 && guard < count * 4) {
    for (let i = 0; i < count && adultsLeft > 0; i++) {
      if (distribution[i].effectiveAdults < 3) {
        distribution[i].effectiveAdults += 1;
        adultsLeft -= 1;
      }
    }
    guard += 1;
  }

  for (let i = 0; i < count && remainingYoungChildren > 0; i++) {
    if (distribution[i].youngChildren < 1) {
      distribution[i].youngChildren += 1;
      remainingYoungChildren -= 1;
    }
  }

  return distribution;
}

export function distributeGuestsAcrossRooms(guests) {
  const roomCount = Math.max(1, Number.parseInt(String(guests?.rooms ?? 1), 10) || 1);
  const childAges = normalizeChildAges(guests?.childAges, guests?.children ?? 0);
  const totalEffectiveAdults = getEffectiveAdults({
    adults: guests?.adults ?? 2,
    childAges,
  });
  let remainingYoungChildren = countYoungChildren(childAges);

  const distribution = Array.from({ length: roomCount }, () => ({
    effectiveAdults: 0,
    youngChildren: 0,
  }));

  let adultsLeft = totalEffectiveAdults;
  let guard = 0;
  while (adultsLeft > 0 && guard < roomCount * 4) {
    for (let i = 0; i < roomCount && adultsLeft > 0; i++) {
      if (distribution[i].effectiveAdults < 3) {
        distribution[i].effectiveAdults += 1;
        adultsLeft -= 1;
      }
    }
    guard += 1;
  }

  for (let i = 0; i < roomCount && remainingYoungChildren > 0; i++) {
    if (distribution[i].youngChildren < 1) {
      distribution[i].youngChildren += 1;
      remainingYoungChildren -= 1;
    }
  }

  return distribution;
}

export function getSearchRoomCount(guests) {
  return Math.max(1, Number.parseInt(String(guests?.rooms ?? 1), 10) || 1);
}

/** Rooms to price/select: at least guest search count and minimum required for occupancy. */
export function getRequiredRoomCount(guests) {
  return Math.max(getSearchRoomCount(guests), getMinimumRoomsRequired(guests));
}

export function calculateRoomNightPriceBreakdown(rates, mealPlan, nightDate, effectiveAdults) {
  const planRates = rates?.[mealPlan];
  if (!planRates) return null;

  const baseRate = getRateValue(planRates["1"], nightDate);
  if (baseRate === null) return null;

  const extraAdultRate = getRateValue(planRates["3"], nightDate) ?? 0;
  const extraAdultCount = Math.max(0, Math.min(1, effectiveAdults - 2));
  const extraAdult = extraAdultCount * extraAdultRate;

  return {
    base: baseRate,
    extraAdult,
    extraAdultCount,
    total: baseRate + extraAdult,
  };
}

export function calculateRoomNightPrice(rates, mealPlan, nightDate, effectiveAdults) {
  const breakdown = calculateRoomNightPriceBreakdown(
    rates,
    mealPlan,
    nightDate,
    effectiveAdults
  );
  return breakdown?.total ?? null;
}

/** Average base rate (2 guests / room) per night across the stay — no extra adult charges. */
export function getAverageBaseRatePerNight(categoryData, mealPlan, nightDates) {
  const planRates = categoryData?.rates?.[mealPlan];
  if (!planRates || !nightDates?.length) return null;

  let total = 0;
  for (const night of nightDates) {
    const base = getRateValue(planRates["1"], night);
    if (base === null) return null;
    total += base;
  }

  return Math.round(total / nightDates.length);
}

export function formatGuestDistributionLabel(roomDetails) {
  if (!roomDetails?.length) return "";

  return roomDetails
    .map((room) => {
      let label = `Room ${room.roomIndex}: ${room.effectiveAdults} guest${
        room.effectiveAdults !== 1 ? "s" : ""
      }`;
      if (room.youngChildren > 0) {
        label += ` + ${room.youngChildren} child ≤7`;
      }
      if (room.extraAdultSubtotal > 0) {
        label += " (extra adult rate)";
      }
      return label;
    })
    .join(" · ");
}

function accumulateRoomNightAmounts(categoryData, mealPlan, nightDates, effectiveAdults) {
  let roomBase = 0;
  let roomExtra = 0;
  const nightCharges = [];

  for (const night of nightDates) {
    const breakdown = calculateRoomNightPriceBreakdown(
      categoryData.rates,
      mealPlan,
      night,
      effectiveAdults
    );
    if (!breakdown) return null;
    roomBase += breakdown.base;
    roomExtra += breakdown.extraAdult;
    nightCharges.push(breakdown.base + breakdown.extraAdult);
  }

  return { roomBase, roomExtra, nightCharges };
}

export function calculateRoomsStayPricingWithOccupancies(
  categoryData,
  mealPlan,
  nightDates,
  occupancies
) {
  if (!categoryData || !nightDates.length || !occupancies?.length) return null;

  let baseSubtotal = 0;
  let extraAdultSubtotal = 0;
  const roomDetails = [];
  const nightCharges = [];

  for (let index = 0; index < occupancies.length; index++) {
    const occupancy = occupancies[index];
    const effectiveAdults = Math.max(1, Number(occupancy.effectiveAdults) || 2);
    const youngChildren = Math.max(0, Number(occupancy.youngChildren) || 0);
    const amounts = accumulateRoomNightAmounts(
      categoryData,
      mealPlan,
      nightDates,
      effectiveAdults
    );
    if (!amounts) return null;

    baseSubtotal += amounts.roomBase;
    extraAdultSubtotal += amounts.roomExtra;
    nightCharges.push(...amounts.nightCharges);
    roomDetails.push({
      roomIndex: index + 1,
      effectiveAdults,
      youngChildren,
      baseSubtotal: amounts.roomBase,
      extraAdultSubtotal: amounts.roomExtra,
      subtotal: amounts.roomBase + amounts.roomExtra,
    });
  }

  if (!roomDetails.length) return null;

  const subtotal = baseSubtotal + extraAdultSubtotal;
  const gst = calculateGstFromNightlyAmounts(nightCharges);

  return applyPropertyPricingMarkup({
    subtotal,
    baseSubtotal,
    extraAdultSubtotal,
    gst,
    total: subtotal + gst,
    nights: nightDates.length,
    roomCount: roomDetails.length,
    roomDetails,
    nightCharges,
    occupancyLabel: formatGuestDistributionLabel(roomDetails),
  });
}

export function calculateRoomsStayPricing(
  categoryData,
  mealPlan,
  nightDates,
  guests,
  roomCount,
  startRoomIndex = 0,
  occupancyDistribution = null
) {
  if (!categoryData || !nightDates.length || roomCount < 1) return null;

  const distribution =
    occupancyDistribution ||
    distributeGuestsAcrossRoomCount(guests, Math.max(roomCount + startRoomIndex, guests?.rooms ?? 1));
  let baseSubtotal = 0;
  let extraAdultSubtotal = 0;
  const roomDetails = [];
  const nightCharges = [];

  for (let i = 0; i < roomCount; i++) {
    const roomIndex = startRoomIndex + i;
    const occupancy = distribution[roomIndex] || { effectiveAdults: 2, youngChildren: 0 };
    const amounts = accumulateRoomNightAmounts(
      categoryData,
      mealPlan,
      nightDates,
      occupancy.effectiveAdults
    );
    if (!amounts) return null;

    baseSubtotal += amounts.roomBase;
    extraAdultSubtotal += amounts.roomExtra;
    nightCharges.push(...amounts.nightCharges);
    roomDetails.push({
      roomIndex: roomIndex + 1,
      effectiveAdults: occupancy.effectiveAdults,
      youngChildren: occupancy.youngChildren,
      baseSubtotal: amounts.roomBase,
      extraAdultSubtotal: amounts.roomExtra,
      subtotal: amounts.roomBase + amounts.roomExtra,
    });
  }

  const subtotal = baseSubtotal + extraAdultSubtotal;
  const gst = calculateGstFromNightlyAmounts(nightCharges);

  return applyPropertyPricingMarkup({
    subtotal,
    baseSubtotal,
    extraAdultSubtotal,
    gst,
    total: subtotal + gst,
    nights: nightDates.length,
    roomCount,
    roomDetails,
    nightCharges,
    occupancyLabel: formatGuestDistributionLabel(roomDetails),
    searchRoomCount: getSearchRoomCount(guests),
  });
}

export function buildMealPlanOffer(categoryData, mealPlan, nightDates, guests) {
  const def = MEAL_PLAN_DEFS[mealPlan];
  if (!def || !isMealPlanAvailableForStay(categoryData, mealPlan, nightDates)) {
    return null;
  }

  const searchRooms = getRequiredRoomCount(guests);
  const pricing = calculateRoomsStayPricing(
    categoryData,
    mealPlan,
    nightDates,
    guests,
    searchRooms
  );
  if (!pricing) return null;

  const nightlyBaseRate = getAverageBaseRatePerNight(categoryData, mealPlan, nightDates);

  return {
    code: mealPlan,
    name: def.name,
    short: def.short,
    mmtLabel: def.mmtLabel,
    inclusion: def.inclusion,
    inclusionType: def.inclusionType,
    nightly: applyPropertyPriceMarkup(nightlyBaseRate),
    subtotal: pricing.subtotal,
    baseSubtotal: pricing.baseSubtotal,
    extraAdultSubtotal: pricing.extraAdultSubtotal,
    gst: pricing.gst,
    total: pricing.total,
    nights: pricing.nights,
    searchRoomCount: searchRooms,
    roomDetails: pricing.roomDetails,
    occupancyLabel: pricing.occupancyLabel,
  };
}

export function attachInventoryToRooms(rooms, b2c) {
  if (!b2c || !rooms?.length) return rooms;

  return rooms.map((room) => {
    const match = findInventoryCategory(b2c, room.name, room.category);
    return {
      ...room,
      inventoryCategoryKey: match?.key || null,
    };
  });
}

export function getInventoryCategoryData(b2c, inventoryCategoryKey) {
  if (!b2c || !inventoryCategoryKey) return null;
  return b2c[inventoryCategoryKey] || null;
}

export function getCategoryAvailability(categoryData, nightDates) {
  return getMinAvailabilityForStay(categoryData?.availability, nightDates);
}

export function sumCategorySelectedRooms(selection) {
  if (!selection?.plans) return 0;
  return Object.values(selection.plans).reduce(
    (sum, count) => sum + Math.max(0, Number(count) || 0),
    0
  );
}

export function getRemainingCategoryAvailability(categoryData, nightDates, selection) {
  const maxAvailable = getCategoryAvailability(categoryData, nightDates);
  const used = sumCategorySelectedRooms(selection);
  return Math.max(0, maxAvailable - used);
}

/** Free slots in a category for one meal plan (other plans in same category reduce capacity). */
export function getCategorySlotsForPlan(selection, categoryData, nightDates, mealPlan) {
  if (!categoryData || !nightDates.length) return 0;
  const maxAvailable = getCategoryAvailability(categoryData, nightDates);
  const otherPlansTotal = Object.entries(selection?.plans || {})
    .filter(([code]) => code !== mealPlan)
    .reduce((sum, [, value]) => sum + Math.max(0, Number(value) || 0), 0);
  return Math.max(0, maxAvailable - otherPlansTotal);
}

export function getOrderedSelections(selections, rooms) {
  const ordered = [];
  const seen = new Set();

  for (const room of rooms || []) {
    const key = room.inventoryCategoryKey;
    if (!key || !selections?.[key] || seen.has(key)) continue;
    ordered.push(selections[key]);
    seen.add(key);
  }

  for (const selection of Object.values(selections || {})) {
    if (!seen.has(selection.inventoryKey)) {
      ordered.push(selection);
    }
  }

  return ordered;
}

export function buildRoomComboAllocation({
  inventoryB2c,
  rooms,
  selections,
  primaryInventoryKey,
  mealPlan,
  requestedCount,
  nightDates,
}) {
  const count = Math.max(0, Number(requestedCount) || 0);
  if (!count) {
    return { allocations: [], remaining: 0, fulfilled: true, primaryTake: 0, comboRooms: 0 };
  }

  const primaryRoom = (rooms || []).find((r) => r.inventoryCategoryKey === primaryInventoryKey);
  const primaryData = inventoryB2c?.[primaryInventoryKey];
  if (!primaryRoom || !primaryData) {
    return { allocations: [], remaining: count, fulfilled: false, primaryTake: 0, comboRooms: 0 };
  }

  const primarySelection = selections?.[primaryInventoryKey];
  const primarySlots = getCategorySlotsForPlan(
    primarySelection,
    primaryData,
    nightDates,
    mealPlan
  );
  const primaryTake = Math.min(count, primarySlots);
  let remaining = count - primaryTake;
  const allocations = [];

  if (primaryTake > 0) {
    allocations.push({
      inventoryKey: primaryInventoryKey,
      roomId: primaryRoom.id,
      categoryLabel: primaryRoom.inventoryLabel || primaryRoom.name,
      roomCount: primaryTake,
      categoryData: primaryData,
      isPrimary: true,
    });
  }

  for (const room of rooms || []) {
    if (!room.inventoryCategoryKey || room.inventoryCategoryKey === primaryInventoryKey) continue;
    if (remaining <= 0) break;

    const categoryData = inventoryB2c[room.inventoryCategoryKey];
    if (!categoryData || !isMealPlanAvailableForStay(categoryData, mealPlan, nightDates)) {
      continue;
    }

    const selection = selections?.[room.inventoryCategoryKey];
    const slots = getCategorySlotsForPlan(selection, categoryData, nightDates, mealPlan);
    const take = Math.min(remaining, slots);
    if (take <= 0) continue;

    allocations.push({
      inventoryKey: room.inventoryCategoryKey,
      roomId: room.id,
      categoryLabel: room.inventoryLabel || room.name,
      roomCount: take,
      categoryData,
      isPrimary: false,
    });
    remaining -= take;
  }

  return {
    allocations,
    remaining,
    fulfilled: remaining === 0,
    primaryTake,
    comboRooms: count - primaryTake,
  };
}

export function getMaxSelectableWithCombo({
  inventoryB2c,
  rooms,
  selections,
  primaryInventoryKey,
  mealPlan,
  nightDates,
  guests,
}) {
  const primaryData = inventoryB2c?.[primaryInventoryKey];
  const primarySelection = selections?.[primaryInventoryKey];
  const primarySlots = primaryData
    ? getCategorySlotsForPlan(primarySelection, primaryData, nightDates, mealPlan)
    : 0;

  let comboSlots = 0;
  for (const room of rooms || []) {
    if (!room.inventoryCategoryKey || room.inventoryCategoryKey === primaryInventoryKey) continue;
    const categoryData = inventoryB2c?.[room.inventoryCategoryKey];
    if (!categoryData || !isMealPlanAvailableForStay(categoryData, mealPlan, nightDates)) {
      continue;
    }
    const selection = selections?.[room.inventoryCategoryKey];
    comboSlots += getCategorySlotsForPlan(selection, categoryData, nightDates, mealPlan);
  }

  const totalSlots = primarySlots + comboSlots;
  const searchCap = getRequiredRoomCount(guests);
  return Math.min(searchCap, totalSlots);
}

export function calculateComboPricingPreview(allocations, mealPlan, nightDates, guests) {
  let startOffset = 0;
  let subtotal = 0;
  let baseSubtotal = 0;
  let extraAdultSubtotal = 0;
  let gst = 0;
  const parts = [];

  for (const alloc of allocations || []) {
    const pricing = calculateRoomsStayPricing(
      alloc.categoryData,
      mealPlan,
      nightDates,
      guests,
      alloc.roomCount,
      startOffset
    );
    if (!pricing) continue;
    subtotal += pricing.subtotal;
    baseSubtotal += pricing.baseSubtotal;
    extraAdultSubtotal += pricing.extraAdultSubtotal;
    gst += pricing.gst;
    parts.push({
      categoryLabel: alloc.categoryLabel,
      roomCount: alloc.roomCount,
      subtotal: pricing.subtotal,
      baseSubtotal: pricing.baseSubtotal,
      extraAdultSubtotal: pricing.extraAdultSubtotal,
      isPrimary: alloc.isPrimary,
    });
    startOffset += alloc.roomCount;
  }

  return {
    subtotal,
    baseSubtotal,
    extraAdultSubtotal,
    gst,
    total: subtotal + gst,
    parts,
    nights: nightDates.length,
    roomCount: startOffset,
  };
}

export function getTotalRoomsForMealPlan(selections, mealPlan) {
  return Object.values(selections || {}).reduce(
    (sum, sel) => sum + Math.max(0, Number(sel.plans?.[mealPlan]) || 0),
    0
  );
}

export function isComboActiveForPrimary(selections, rooms, mealPlan, primaryInventoryKey) {
  const parts = [];
  for (const room of rooms || []) {
    const key = room.inventoryCategoryKey;
    const count = Math.max(0, Number(selections?.[key]?.plans?.[mealPlan]) || 0);
    if (count > 0) {
      parts.push({ inventoryKey: key, roomCount: count });
    }
  }
  if (parts.length <= 1) return false;

  // Combo primary is the category with the most rooms for this meal plan (not list order).
  const primaryPart = parts.reduce((best, part) =>
    !best || part.roomCount > best.roomCount ? part : best
  );
  return primaryPart.inventoryKey === primaryInventoryKey;
}

export function getComboOfferForCategory({
  inventoryB2c,
  rooms,
  selections,
  primaryRoom,
  mealPlan,
  nightDates,
  guests,
}) {
  const primaryKey = primaryRoom?.inventoryCategoryKey;
  const primaryData = primaryKey ? inventoryB2c?.[primaryKey] : null;
  if (!primaryData || !isMealPlanAvailableForStay(primaryData, mealPlan, nightDates)) {
    return null;
  }

  const searchRooms = getRequiredRoomCount(guests);
  const maxAvailable = getCategoryAvailability(primaryData, nightDates);

  // Combo only when physical inventory in this category is less than searched rooms.
  // Other meal plans in the same category reduce per-plan slots but do not trigger combo.
  if (searchRooms <= maxAvailable) {
    return null;
  }

  const primarySlots = getCategorySlotsForPlan(
    selections?.[primaryKey],
    primaryData,
    nightDates,
    mealPlan
  );
  const maxCombo = getMaxSelectableWithCombo({
    inventoryB2c,
    rooms,
    selections,
    primaryInventoryKey: primaryKey,
    mealPlan,
    nightDates,
    guests,
  });

  if (maxCombo <= maxAvailable || searchRooms <= primarySlots) {
    return null;
  }

  const targetCount = Math.min(searchRooms, maxCombo);
  const allocation = buildRoomComboAllocation({
    inventoryB2c,
    rooms,
    selections,
    primaryInventoryKey: primaryKey,
    mealPlan,
    requestedCount: targetCount,
    nightDates,
  });

  if (allocation.comboRooms <= 0) {
    return null;
  }

  const pricing = calculateComboPricingPreview(
    allocation.allocations,
    mealPlan,
    nightDates,
    guests
  );
  if (!pricing) return null;

  const def = MEAL_PLAN_DEFS[mealPlan];
  const comboLabel = allocation.allocations
    .map((a) => `${a.roomCount}× ${a.categoryLabel}`)
    .join(" + ");

  return {
    mealPlan,
    mmtLabel: def?.mmtLabel || mealPlan,
    inclusion: def?.inclusion || "",
    inclusionType: def?.inclusionType || "none",
    comboLabel,
    allocations: allocation.allocations,
    allocation,
    pricing,
    nightly: applyPropertyPriceMarkup(
      getAverageBaseRatePerNight(primaryData, mealPlan, nightDates)
    ),
    targetCount,
    maxSelectable: maxCombo,
    primarySlots,
    fulfilled: allocation.fulfilled,
  };
}

/** True when guest room count exceeds what one category can supply (combo rows would appear). */
export function hasRoomComboScenario({
  inventoryB2c,
  rooms,
  selections = {},
  nightDates,
  guests,
}) {
  if (!inventoryB2c || !nightDates?.length || !rooms?.length) return false;

  for (const room of rooms) {
    const categoryData = getInventoryCategoryData(inventoryB2c, room.inventoryCategoryKey);
    const mealPlans = categoryData
      ? getAvailableMealPlansForStay(categoryData, nightDates)
      : [];

    for (const mealPlan of mealPlans) {
      if (
        getComboOfferForCategory({
          inventoryB2c,
          rooms,
          selections,
          primaryRoom: room,
          mealPlan,
          nightDates,
          guests,
        })
      ) {
        return true;
      }
    }
  }

  return false;
}

export function buildSelectionLineItems(
  selections,
  inventoryB2c,
  nightDates,
  guests,
  rooms,
  customRoomSlots = null
) {
  if (customRoomSlots?.length) {
    const roomById = Object.fromEntries((rooms || []).map((room) => [room.id, room]));
    const grouped = new Map();

    for (const slot of customRoomSlots) {
      const key = `${slot.inventoryKey}::${slot.mealPlan}`;
      if (!grouped.has(key)) {
        grouped.set(key, { slot, occupancies: [] });
      }
      grouped.get(key).occupancies.push({
        effectiveAdults: slot.effectiveAdults,
        youngChildren: slot.youngChildren,
      });
    }

    const items = [];
    let globalIndex = 0;
    for (const { slot, occupancies } of grouped.values()) {
      const categoryData = inventoryB2c?.[slot.inventoryKey];
      if (!categoryData) continue;

      const room =
        roomById[slot.roomId] ||
        (rooms || []).find((entry) => entry.inventoryCategoryKey === slot.inventoryKey);

      const pricing = calculateRoomsStayPricingWithOccupancies(
        categoryData,
        slot.mealPlan,
        nightDates,
        occupancies
      );
      if (!pricing) continue;

      const def = MEAL_PLAN_DEFS[slot.mealPlan];
      items.push({
        roomId: slot.roomId,
        roomName: room?.name || slot.categoryLabel,
        categoryLabel: slot.categoryLabel,
        mealPlan: slot.mealPlan,
        mealPlanLabel: def?.mmtLabel || slot.mealPlan,
        inclusion: def?.inclusion || "",
        roomCount: occupancies.length,
        nights: nightDates.length,
        subtotal: pricing.subtotal,
        baseSubtotal: pricing.baseSubtotal,
        extraAdultSubtotal: pricing.extraAdultSubtotal,
        gst: pricing.gst,
        total: pricing.total,
        roomDetails: pricing.roomDetails,
        occupancyLabel: pricing.occupancyLabel,
        isComboPart: globalIndex > 0,
        isCustomCombo: true,
      });
      globalIndex += occupancies.length;
    }
    return items;
  }

  const roomById = Object.fromEntries((rooms || []).map((room) => [room.id, room]));
  const items = [];
  let startOffset = 0;
  const totalSelected = Object.values(selections || {}).reduce(
    (sum, sel) => sum + sumCategorySelectedRooms(sel),
    0
  );
  const distribution =
    totalSelected > 0
      ? distributeGuestsAcrossRoomCount(guests, totalSelected)
      : null;

  for (const selection of getOrderedSelections(selections, rooms)) {
    const categoryData = inventoryB2c?.[selection.inventoryKey];
    if (!categoryData) continue;

    const room =
      roomById[selection.roomId] ||
      (rooms || []).find((entry) => entry.inventoryCategoryKey === selection.inventoryKey);

    for (const [mealPlan, roomCount] of Object.entries(selection.plans || {})) {
      const count = Math.max(0, Number(roomCount) || 0);
      if (!count) continue;

      const pricing = calculateRoomsStayPricing(
        categoryData,
        mealPlan,
        nightDates,
        guests,
        count,
        startOffset,
        distribution
      );
      if (!pricing) continue;

      const def = MEAL_PLAN_DEFS[mealPlan];
      items.push({
        roomId: selection.roomId,
        roomName: room?.name || selection.categoryLabel,
        categoryLabel: selection.categoryLabel,
        mealPlan,
        mealPlanLabel: def?.mmtLabel || mealPlan,
        inclusion: def?.inclusion || "",
        roomCount: count,
        nights: nightDates.length,
        subtotal: pricing.subtotal,
        baseSubtotal: pricing.baseSubtotal,
        extraAdultSubtotal: pricing.extraAdultSubtotal,
        gst: pricing.gst,
        total: pricing.total,
        roomDetails: pricing.roomDetails,
        occupancyLabel: pricing.occupancyLabel,
        isComboPart: startOffset > 0,
      });
      startOffset += count;
    }
  }

  return items;
}

export function calculateSelectionGrandTotal(
  selections,
  inventoryB2c,
  nightDates,
  guests,
  rooms,
  customRoomSlots = null
) {
  const lineItems = buildSelectionLineItems(
    selections,
    inventoryB2c,
    nightDates,
    guests,
    rooms,
    customRoomSlots
  );
  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
  const gst = lineItems.reduce((sum, item) => sum + (Number(item.gst) || 0), 0);
  return {
    subtotal,
    gst,
    total: subtotal + gst,
    nights: nightDates.length,
    lineItems,
  };
}
