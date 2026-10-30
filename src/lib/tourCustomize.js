import { HOTEL_CATEGORIES } from "@/lib/tourPackageMeta";

/**
 * Trip customisation: meal plans, private vehicles and per-stop hotel grades.
 *
 * The package price already includes the *included* meal plan, the *recommended* vehicle for
 * the group size and the standard hotel grade. Everything here is expressed as a delta against
 * that baseline, so travellers can both upgrade and downgrade and see the exact price impact.
 */

const roundTo10 = (n) => Math.round(n / 10) * 10;

export function childFactor(age) {
  return age <= 5 ? 0.6 : 0.8;
}

/* -------------------------------- meals -------------------------------- */

export const MEAL_PLANS = [
  {
    id: "breakfast",
    label: "Breakfast only",
    short: "Breakfast",
    blurb: "Fresh breakfast at the hotel — lunches and dinners are yours to explore.",
    rate: 0, // ₹ per person per night
    meals: ["Breakfast"],
  },
  {
    id: "half",
    label: "Breakfast + Dinner",
    short: "B + D",
    blurb: "Breakfast and a relaxed dinner at the hotel. Lunch on the road is on you.",
    rate: 650,
    meals: ["Breakfast", "Dinner"],
  },
  {
    id: "full",
    label: "All meals",
    short: "All meals",
    blurb: "Breakfast, lunch and dinner every day — no bills, no hunting for a table.",
    rate: 1250,
    meals: ["Breakfast", "Lunch", "Dinner"],
  },
];

export const MEAL_BY_ID = Object.fromEntries(MEAL_PLANS.map((m) => [m.id, m]));

/** Maps the catalogue's free-text plan ("Breakfast & dinner") onto a plan id. */
export function baseMealId(text = "") {
  const t = String(text).toLowerCase();
  if (t.includes("all")) return "full";
  if (t.includes("dinner")) return "half";
  return "breakfast";
}

export function resolveMealId(meta, id) {
  if (id && id !== "auto" && MEAL_BY_ID[id]) return id;
  return baseMealId(meta?.mealPlan);
}

export function calculateMealDelta({ meta, mealId, adults = 2, childAges = [], stays = null }) {
  const baseId = baseMealId(meta?.mealPlan);
  const globalId = resolveMealId(meta, mealId);
  const base = MEAL_BY_ID[baseId];
  const nights = meta?.nights ?? 1;
  const intl = meta?.international ? 1.5 : 1;
  const heads = adults + childAges.reduce((sum, age) => sum + childFactor(age), 0);

  // Each overnight stop can carry its own plan; stop nights are scaled to the package's nights.
  const list = stays?.length ? stays : [{ nights, meal: undefined }];
  const stopNights = list.reduce((sum, x) => sum + x.nights, 0) || 1;
  const ids = new Set();
  let raw = 0;
  list.forEach((stay) => {
    const id = stay.meal && MEAL_BY_ID[stay.meal] ? stay.meal : globalId;
    ids.add(id);
    raw += (MEAL_BY_ID[id].rate - base.rate) * nights * (stay.nights / stopNights) * intl;
  });

  const mixed = ids.size > 1;
  const plan = mixed
    ? { id: "mixed", label: "Mixed plans", short: "Mixed", blurb: "Different meal plans at different hotels.", meals: [] }
    : MEAL_BY_ID[[...ids][0]];
  return {
    plan,
    base,
    mixed,
    isBase: [...ids].every((id) => id === baseId),
    nights,
    perPerson: roundTo10(raw),
    amount: roundTo10(raw * heads),
  };
}

/** Per-person price change of moving one stop from meal plan `fromId` to `toId`. */
export function stopMealDelta(meta, stopNights, totalNights, fromId, toId) {
  const intl = meta?.international ? 1.5 : 1;
  return roundTo10(
    (MEAL_BY_ID[toId].rate - MEAL_BY_ID[fromId].rate) * (meta?.nights ?? 1) * (stopNights / Math.max(1, totalNights)) * intl
  );
}

/** Per-person price impact of switching to `planId`, used on the option cards. */
export function mealOptionDelta(meta, planId) {
  const base = MEAL_BY_ID[baseMealId(meta?.mealPlan)];
  const intl = meta?.international ? 1.5 : 1;
  return roundTo10((MEAL_BY_ID[planId].rate - base.rate) * (meta?.nights ?? 1) * intl);
}

/* --------------------------------- cabs --------------------------------- */

export const CAB_OPTIONS = [
  {
    id: "hatchback",
    label: "Hatchback",
    models: "Swift / WagonR or similar",
    capacity: 3,
    bags: 1,
    perDay: 2200,
    tag: "Budget",
    blurb: "Compact and economical for couples travelling light.",
  },
  {
    id: "sedan",
    label: "Sedan",
    models: "Dzire / Etios or similar",
    capacity: 4,
    bags: 2,
    perDay: 2800,
    tag: "Popular",
    blurb: "The comfortable all-rounder for couples and small families.",
  },
  {
    id: "suv",
    label: "SUV / MPV",
    models: "Ertiga / Marazzo or similar",
    capacity: 6,
    bags: 4,
    perDay: 4200,
    tag: "Family",
    blurb: "Extra legroom and boot space for families and hill roads.",
  },
  {
    id: "innova",
    label: "Innova Crysta",
    models: "Toyota Innova Crysta",
    capacity: 6,
    bags: 4,
    perDay: 5400,
    tag: "Premium",
    blurb: "Captain-seat comfort with the best ride on long drives.",
  },
  {
    id: "tempo",
    label: "Tempo Traveller",
    models: "12-seater AC pushback",
    capacity: 12,
    bags: 10,
    perDay: 6400,
    tag: "Groups",
    blurb: "Everyone together — friends, families and small groups.",
  },
  {
    id: "coach",
    label: "Mini coach",
    models: "25-seater AC coach",
    capacity: 25,
    bags: 25,
    perDay: 10800,
    tag: "Large group",
    blurb: "Built for big groups, corporate trips and weddings.",
  },
];

export const CAB_BY_ID = Object.fromEntries(CAB_OPTIONS.map((c) => [c.id, c]));

/** Seats needed: adults + children (infants travel on a lap). */
export function cabPassengers({ adults = 2, childAges = [] } = {}) {
  return adults + childAges.length;
}

export function recommendedCabId(pax) {
  if (pax <= 4) return "sedan";
  if (pax <= 6) return "suv";
  if (pax <= 12) return "tempo";
  return "coach";
}

export function planCab({ meta, cabId, pax }) {
  const recommendedId = recommendedCabId(pax);
  const selectedId = cabId && cabId !== "auto" && CAB_BY_ID[cabId] ? cabId : recommendedId;
  const days = Math.max(1, meta?.days ?? 1);
  const intl = meta?.international ? 1.4 : 1;

  const cost = (option) => {
    const vehicles = Math.max(1, Math.ceil(pax / option.capacity));
    return {
      option,
      vehicles,
      total: roundTo10(vehicles * option.perDay * intl * days),
      fits: pax <= option.capacity,
    };
  };

  const selected = cost(CAB_BY_ID[selectedId]);
  const recommended = cost(CAB_BY_ID[recommendedId]);
  return {
    ...selected,
    days,
    isRecommended: selectedId === recommendedId,
    recommended,
    delta: selected.total - recommended.total,
  };
}

/** Total price impact (whole group) of choosing each vehicle, for the option cards. */
export function cabOptionDelta(meta, pax, optionId) {
  return planCab({ meta, cabId: optionId, pax }).delta;
}

/* -------------------------------- hotels -------------------------------- */

export function categoryStars(baseStars, categoryId) {
  const base = baseStars ?? 3;
  if (categoryId === "premium") return 5;
  if (categoryId === "deluxe") return Math.min(5, base + 1);
  return base;
}

export function categoryBlurb(baseStars, categoryId) {
  const stars = categoryStars(baseStars, categoryId);
  if (categoryId === "premium") return "Signature suites, best views and top service";
  if (categoryId === "deluxe") return stars === baseStars ? "Upgraded rooms with better views" : `${stars}★ stays with better views`;
  return `Comfortable ${stars}★ stays, as listed`;
}

/** Room types: `extra` is added to the hotel grade's price factor for that stop's nights. */
export const ROOM_TYPES = [
  {
    id: "standard",
    label: "Standard room",
    blurb: "Comfortable twin or double room with all the essentials.",
    bed: "Twin / double bed",
    extra: 0,
  },
  {
    id: "deluxe",
    label: "Deluxe room",
    blurb: "A larger room with a better view and a seating corner.",
    bed: "King bed · better view",
    extra: 0.1,
  },
  {
    id: "suite",
    label: "Suite / villa",
    blurb: "Separate living space, the best view and extra privacy.",
    bed: "King bed · lounge area",
    extra: 0.25,
  },
];

export const ROOM_BY_ID = Object.fromEntries(ROOM_TYPES.map((r) => [r.id, r]));

/** Price factor of one stop: grade factor plus any room upgrade. */
export function stayFactor(categoryId, roomId) {
  const cat = HOTEL_CATEGORIES.find((c) => c.id === categoryId) ?? HOTEL_CATEGORIES[0];
  return cat.factor + (ROOM_BY_ID[roomId]?.extra ?? 0);
}

/** Per-person price change of moving one stop between (grade, room) combinations. */
export function stopStayDelta(price, stopNights, totalNights, from, to) {
  return roundTo10(price * (stayFactor(to.category, to.room) - stayFactor(from.category, from.room)) * (stopNights / Math.max(1, totalNights)));
}

/**
 * One entry per night of the trip (night N = itinerary day N), each with its own hotel grade
 * (override → default grade), room type and meal plan. `overrides`, `extra.rooms` and
 * `extra.meals` are `{ [nightIndex]: id }` maps. `stop` is the index of the hotel in `hotels`.
 */
export function resolveStays(hotels = [], defaultCategory = "standard", overrides = {}, extra = {}) {
  const nights = [];
  hotels.forEach((hotel, stop) => {
    for (let n = 0; n < hotel.nights; n += 1) {
      const index = nights.length;
      nights.push({
        index,
        stop,
        place: hotel.place,
        nights: 1,
        category: overrides?.[index] ?? defaultCategory,
        room: extra?.rooms?.[index] ?? "standard",
        meal: extra?.meals?.[index],
      });
    }
  });
  return nights;
}

export function summariseStays(stays, baseStars, fallbackCategory = "standard") {
  const list = stays?.length ? stays : [{ nights: 1, category: fallbackCategory }];
  const totalNights = list.reduce((s, x) => s + x.nights, 0) || 1;
  const factor =
    list.reduce((sum, x) => {
      return sum + stayFactor(x.category, x.room) * x.nights;
    }, 0) / totalNights;
  const ids = Array.from(new Set(list.map((x) => x.category)));

  if (ids.length === 1) {
    const cat = HOTEL_CATEGORIES.find((c) => c.id === ids[0]) ?? HOTEL_CATEGORIES[0];
    return { ...cat, stars: categoryStars(baseStars, cat.id), factor, mixed: false };
  }
  const avgStars = Math.round(
    list.reduce((s, x) => s + categoryStars(baseStars, x.category) * x.nights, 0) / totalNights
  );
  return { id: "mixed", label: "Mixed grades", stars: avgStars, factor, mixed: true };
}

/* ------------------------- query-string (de)serialise ------------------------- */

function serialiseOverrides(overrides = {}, isValid) {
  return Object.entries(overrides)
    .filter(([, id]) => isValid(id))
    .map(([i, id]) => `${i}:${id}`)
    .join(",");
}

function parseOverrides(value, isValid) {
  const out = {};
  String(value ?? "")
    .split(",")
    .forEach((pair) => {
      const [i, id] = pair.split(":");
      const index = Number.parseInt(i, 10);
      if (Number.isInteger(index) && index >= 0 && index < 40 && isValid(id)) out[index] = id;
    });
  return out;
}

const isGrade = (id) => HOTEL_CATEGORIES.some((c) => c.id === id);
const isRoom = (id) => Boolean(ROOM_BY_ID[id]);
const isMeal = (id) => Boolean(MEAL_BY_ID[id]);

export const serialiseStays = (o) => serialiseOverrides(o, isGrade);
export const parseStays = (v) => parseOverrides(v, isGrade);
export const serialiseRooms = (o) => serialiseOverrides(o, isRoom);
export const parseRooms = (v) => parseOverrides(v, isRoom);
export const serialiseStopMeals = (o) => serialiseOverrides(o, isMeal);
export const parseStopMeals = (v) => parseOverrides(v, isMeal);
