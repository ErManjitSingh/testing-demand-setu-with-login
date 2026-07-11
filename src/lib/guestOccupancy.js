export const MAX_GUESTS_PER_ROOM = 3;
/** Upper bound for room count in search / booking guest picker. */
export const MAX_BOOKING_ROOMS = 30;
/** Max rooms bookable online in search-stay; above this opens bulk enquiry. */
export const MAX_SELF_SERVICE_SEARCH_ROOMS = 9;
/** @deprecated Use MAX_GUESTS_PER_ROOM */
export const MAX_ADULTS = MAX_GUESTS_PER_ROOM;
/** Ages above this count as an adult for occupancy. */
export const CHILD_ADULT_AGE_THRESHOLD = 7;
export const MAX_YOUNG_CHILDREN_PER_ROOM = 1;
export const DEFAULT_CHILD_AGE = 5;

export const OCCUPANCY_ROOM_MESSAGE =
  "Please select more rooms. Maximum 3 guests can stay in each room.";

function getRooms(guests) {
  return Math.max(1, Number.parseInt(String(guests?.rooms ?? 1), 10) || 1);
}

function getMaxGuestCapacity(guests) {
  return getRooms(guests) * MAX_GUESTS_PER_ROOM;
}

function getMaxYoungChildren(guests) {
  return getRooms(guests) * MAX_YOUNG_CHILDREN_PER_ROOM;
}

export function countAdultEquivalentChildren(childAges = []) {
  return childAges.filter((age) => age > CHILD_ADULT_AGE_THRESHOLD).length;
}

export function countYoungChildren(childAges = []) {
  return childAges.filter((age) => age <= CHILD_ADULT_AGE_THRESHOLD).length;
}

export function getEffectiveAdults({ adults, childAges = [] }) {
  return adults + countAdultEquivalentChildren(childAges);
}

/** Max adults selectable in per-room guest popover (child always uses one guest slot). */
export function getMaxAdultsForRoomSlot(hasChild) {
  return hasChild ? MAX_GUESTS_PER_ROOM - 1 : MAX_GUESTS_PER_ROOM;
}

export function canAddChildToRoom(adults) {
  const adultCount = Math.max(1, Number(adults) || 1);
  return adultCount + 1 <= MAX_GUESTS_PER_ROOM;
}

export function isValidRoomSlotGuests(adults, hasChild, childAge = DEFAULT_CHILD_AGE) {
  const adultCount = Math.max(1, Number(adults) || 1);
  if (adultCount > getMaxAdultsForRoomSlot(hasChild)) return false;
  if (!hasChild) return adultCount <= MAX_GUESTS_PER_ROOM;
  return adultCount + 1 <= MAX_GUESTS_PER_ROOM;
}

/** Per-room guest pick (combo customize popover): map adults + optional child age to pricing occupancy. */
export function occupancyFromRoomGuests(adults, hasChild, childAge = DEFAULT_CHILD_AGE) {
  const adultCount = Math.max(1, Number(adults) || 1);
  if (!hasChild) {
    return {
      effectiveAdults: Math.min(MAX_GUESTS_PER_ROOM, adultCount),
      youngChildren: 0,
      childAge: null,
    };
  }

  const age = Math.max(0, Math.min(17, Number(childAge) ?? DEFAULT_CHILD_AGE));
  if (age > CHILD_ADULT_AGE_THRESHOLD) {
    return {
      effectiveAdults: adultCount + 1,
      youngChildren: 0,
      childAge: age,
    };
  }

  return { effectiveAdults: adultCount, youngChildren: 1, childAge: age };
}

/** Minimum rooms required so all guests fit (max 3 guests + 1 child ≤7 per room). */
export function getMinimumRoomsRequired(guests) {
  const childAges = normalizeChildAges(guests?.childAges, guests?.children ?? 0);
  const effectiveAdults = getEffectiveAdults({
    adults: guests?.adults ?? 1,
    childAges,
  });
  const youngChildren = countYoungChildren(childAges);

  const minForAdults = Math.ceil(effectiveAdults / MAX_GUESTS_PER_ROOM);
  const minForYoungChildren =
    youngChildren > 0
      ? Math.ceil(youngChildren / MAX_YOUNG_CHILDREN_PER_ROOM)
      : 0;

  return Math.max(1, minForAdults, minForYoungChildren);
}

export function canIncrementRooms(guests) {
  return getRooms(guests) < MAX_BOOKING_ROOMS;
}

/** Sync search-stay guests when the user confirms rooms on the property page. */
export function deriveGuestsFromPropertySelection(
  currentGuests,
  customRoomSlots,
  totalSelectedRooms
) {
  const children = Math.max(0, Number.parseInt(String(currentGuests?.children ?? 0), 10) || 0);
  const base = {
    adults: Math.max(1, Number.parseInt(String(currentGuests?.adults ?? 2), 10) || 2),
    children,
    rooms: Math.max(1, Number.parseInt(String(currentGuests?.rooms ?? 1), 10) || 1),
    childAges: normalizeChildAges(currentGuests?.childAges, children),
  };
  const selectedRooms = Math.max(0, Number(totalSelectedRooms) || 0);

  if (selectedRooms < 1) {
    return base;
  }

  if (customRoomSlots?.length) {
    let adults = 0;
    const childAges = [];

    for (const slot of customRoomSlots) {
      if (!slot) continue;
      const effectiveAdults = Math.max(1, Number(slot.effectiveAdults) || 1);
      const youngChildren = Math.max(0, Number(slot.youngChildren) || 0);

      adults += effectiveAdults;
      if (youngChildren > 0) {
        childAges.push(
          slot.childAge != null ? slot.childAge : DEFAULT_CHILD_AGE
        );
      }
    }

    return applyMinimumRooms({
      adults: Math.max(1, adults),
      children: childAges.length,
      childAges: normalizeChildAges(childAges, childAges.length),
      rooms: selectedRooms,
    });
  }

  return applyMinimumRooms({
    ...base,
    rooms: selectedRooms,
  });
}

export function canDecrementRooms(guests) {
  const rooms = getRooms(guests);
  return rooms > getMinimumRoomsRequired(guests);
}

export function getDecrementRoomsError(guests) {
  if (canDecrementRooms(guests)) return null;
  const minRooms = getMinimumRoomsRequired(guests);
  if (minRooms <= 1) {
    return OCCUPANCY_ROOM_MESSAGE;
  }
  return `Minimum ${minRooms} rooms required for your guests (max ${MAX_GUESTS_PER_ROOM} guests per room).`;
}

/** Ensures room count is never below what the guest list requires. */
export function applyMinimumRooms(guests) {
  const children = Math.max(0, guests?.children ?? 0);
  const childAges = normalizeChildAges(guests?.childAges, children);
  const rooms = Math.min(
    MAX_BOOKING_ROOMS,
    Math.max(1, Number.parseInt(String(guests?.rooms ?? 1), 10) || 1)
  );
  const normalized = {
    adults: Math.max(1, guests?.adults ?? 1),
    children,
    rooms,
    childAges,
  };
  const minRooms = getMinimumRoomsRequired(normalized);
  if (rooms < minRooms) {
    return { ...normalized, rooms: minRooms };
  }
  return normalized;
}

export function normalizeChildAges(childAges, childrenCount) {
  const count = Math.max(0, childrenCount);
  const source = Array.isArray(childAges) ? childAges : [];
  const ages = source.slice(0, count).map((age) => {
    const n = Number.parseInt(String(age), 10);
    if (!Number.isFinite(n) || n < 0) return DEFAULT_CHILD_AGE;
    return Math.min(17, n);
  });
  while (ages.length < count) ages.push(DEFAULT_CHILD_AGE);
  return ages;
}

export function parseChildAgesParam(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((part) => {
      const n = Number.parseInt(part.trim(), 10);
      return Number.isFinite(n) ? Math.min(17, Math.max(0, n)) : DEFAULT_CHILD_AGE;
    });
}

export function serializeChildAgesParam(childAges = []) {
  return childAges.map((age) => String(age)).join(",");
}

export function getGuestOccupancyError(guests) {
  const adults = Math.max(1, guests?.adults ?? 1);
  const children = Math.max(0, guests?.children ?? 0);
  const childAges = normalizeChildAges(guests?.childAges, children);
  const maxCapacity = getMaxGuestCapacity(guests);

  if (adults > maxCapacity) {
    return OCCUPANCY_ROOM_MESSAGE;
  }

  const effectiveAdults = getEffectiveAdults({ adults, childAges });
  if (effectiveAdults > maxCapacity) {
    return `${OCCUPANCY_ROOM_MESSAGE} Children above ${CHILD_ADULT_AGE_THRESHOLD} years count as adults.`;
  }

  const youngChildren = countYoungChildren(childAges);
  const maxYoung = getMaxYoungChildren(guests);
  if (youngChildren > maxYoung) {
    return `${OCCUPANCY_ROOM_MESSAGE} Only ${MAX_YOUNG_CHILDREN_PER_ROOM} child aged ${CHILD_ADULT_AGE_THRESHOLD} years or below is allowed per room.`;
  }

  if (youngChildren > 0 && adults > maxCapacity) {
    return OCCUPANCY_ROOM_MESSAGE;
  }

  return null;
}

export function canIncrementAdults(guests) {
  const adults = guests?.adults ?? 1;
  const childAges = normalizeChildAges(guests?.childAges, guests?.children ?? 0);
  const maxCapacity = getMaxGuestCapacity(guests);
  if (adults >= maxCapacity) return false;
  return adults + 1 + countAdultEquivalentChildren(childAges) <= maxCapacity;
}

export function canIncrementChildren(guests) {
  const adults = guests?.adults ?? 1;
  const children = guests?.children ?? 0;
  const childAges = normalizeChildAges(guests?.childAges, children);
  const maxCapacity = getMaxGuestCapacity(guests);

  if (countYoungChildren(childAges) >= getMaxYoungChildren(guests)) return false;

  const adultEquivalent = countAdultEquivalentChildren(childAges);
  if (adultEquivalent > 0 && adults + adultEquivalent >= maxCapacity) return false;

  return adults + adultEquivalent <= maxCapacity;
}

export function getIncrementAdultsError(guests) {
  if (canIncrementAdults(guests)) return null;
  const childAges = normalizeChildAges(guests?.childAges, guests?.children ?? 0);
  if (countAdultEquivalentChildren(childAges) > 0) {
    return `${OCCUPANCY_ROOM_MESSAGE} Children above ${CHILD_ADULT_AGE_THRESHOLD} years count as adults.`;
  }
  return OCCUPANCY_ROOM_MESSAGE;
}

export function getIncrementChildrenError(guests) {
  if (canIncrementChildren(guests)) return null;
  const childAges = normalizeChildAges(guests?.childAges, guests?.children ?? 0);
  if (countYoungChildren(childAges) >= getMaxYoungChildren(guests)) {
    return `${OCCUPANCY_ROOM_MESSAGE} Only ${MAX_YOUNG_CHILDREN_PER_ROOM} child aged ${CHILD_ADULT_AGE_THRESHOLD} years or below is allowed per room.`;
  }
  return `${OCCUPANCY_ROOM_MESSAGE} Children above ${CHILD_ADULT_AGE_THRESHOLD} years count as adults.`;
}

export function getChildAgeChangeError(guests, childIndex, nextAge) {
  const children = guests?.children ?? 0;
  const childAges = normalizeChildAges(guests?.childAges, children);
  const nextAges = [...childAges];
  nextAges[childIndex] = nextAge;
  return getGuestOccupancyError({
    adults: guests?.adults ?? 1,
    children,
    rooms: guests?.rooms ?? 1,
    childAges: nextAges,
  });
}
