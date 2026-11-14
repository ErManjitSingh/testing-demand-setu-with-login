import {
  HOTEL_CATEGORIES,
  getPackageMeta,
  hashString,
} from "@/lib/tourPackageMeta";
import { TOUR_PACKAGES } from "@/lib/tourPackages";
import {
  calculateMealDelta,
  categoryStars,
  childFactor,
  cabPassengers,
  planCab,
  summariseStays,
} from "@/lib/tourCustomize";

/**
 * Static product-page content. Everything is derived from the catalogue entry so a
 * new package in tourPackages.js automatically gets a full page. Swap any section for
 * real CMS / API data later — the shape returned here is what the UI consumes.
 */

const HOTEL_AREAS = ["City Centre", "Old Town", "Riverside", "Beachfront", "Hill View", "Lakeside", "Garden District", "Market Quarter"];

const HOTEL_SUFFIXES = ["Residency", "Grand", "Retreat", "Heritage Inn", "Resort & Spa", "Boutique Stay"];

function pick(list, seed, offset = 0) {
  return list[(seed + offset) % list.length];
}

function uniq(list) {
  return Array.from(new Set(list.filter(Boolean)));
}

function addDaysUtc(date, days) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

/* ------------------------------ gallery ------------------------------ */

function buildGallery(pkg) {
  // Only photos attached to the package — never invent state/theme fillers.
  const gallery = uniq(
    [...(Array.isArray(pkg.images) ? pkg.images : []), pkg.image].filter(Boolean)
  );
  return gallery.slice(0, 8).map((src, i) => ({
    src,
    alt: `${pkg.title} — photo ${i + 1}`,
    caption: pkg.title,
  }));
}

/* ------------------------------ stays ------------------------------ */

function buildHotels(pkg, meta, stops, gallery) {
  const seed = hashString(pkg.id);
  const places = stops.slice(0, 4);
  const nightsEach = Math.max(1, Math.floor(meta.nights / Math.max(1, places.length)));
  const amenitiesFor = (stars) =>
    uniq([
      "Free Wi-Fi",
      meta.mealPlan.toLowerCase().includes("dinner") || meta.mealPlan === "All meals" ? "Restaurant" : "Breakfast",
      stars >= 4 ? "Room service" : "Hot water 24x7",
      stars >= 5 ? "Spa & pool" : "Power backup",
    ]);

  return places.map((place, i) => {
    const image = gallery[(i + 1) % gallery.length]?.src ?? gallery[0]?.src;
    // One property per grade so each stop can be upgraded (or downgraded) independently.
    const options = Object.fromEntries(
      HOTEL_CATEGORIES.map((cat, k) => {
        const stars = categoryStars(meta.stars, cat.id);
        return [
          cat.id,
          {
            id: cat.id,
            name: `${place} ${pick(HOTEL_SUFFIXES, seed, i + k * 2)}`,
            stars,
            // Pricier grades sit closer to the action.
            area: pick(HOTEL_AREAS, seed, i + k * 3),
            distance: `${((((seed + i * 3 + k * 7) % 9) + 1) / 10 + (2 - k) * 0.8).toFixed(1)} km from ${place} centre`,
            image: gallery[(i + 1 + k * 2) % gallery.length]?.src ?? image,
            // A small set of photos for the hotel slider (property, rooms, views, pool…).
            images: uniq(
              [0, 1, 2, 3, 4].map((j) => gallery[(i + 1 + k * 2 + j) % gallery.length]?.src).filter(Boolean)
            ),
            amenities: amenitiesFor(stars),
          },
        ];
      })
    );
    return {
      id: `${pkg.id}-stay-${i}`,
      place,
      name: options.standard.name,
      stars: meta.stars,
      nights: i === places.length - 1 ? Math.max(1, meta.nights - nightsEach * (places.length - 1)) : nightsEach,
      image,
      amenities: amenitiesFor(meta.stars),
      options,
      note: "Or similar property of the same category",
    };
  });
}

/* ----------------------------- itinerary ----------------------------- */

function buildItinerary(pkg, meta, stops, hotels) {
  const { days } = meta;
  const highlights = pkg.highlights;
  const firstStop = stops[0] ?? pkg.location;
  const lastStop = stops[stops.length - 1] ?? firstStop;
  const middleDays = Math.max(0, days - 2);

  const mealsFor = (isArrival, isDeparture) => {
    if (meta.mealPlan === "All meals") return isArrival ? ["Dinner"] : isDeparture ? ["Breakfast"] : ["Breakfast", "Lunch", "Dinner"];
    if (meta.mealPlan.includes("dinner")) return isArrival ? ["Dinner"] : isDeparture ? ["Breakfast"] : ["Breakfast", "Dinner"];
    return isDeparture || !isArrival ? ["Breakfast"] : [];
  };

  const hotelForStop = (stop) => hotels.find((h) => h.place === stop) ?? hotels[hotels.length - 1];
  const stayIndexFor = (stop) => {
    const i = hotels.findIndex((h) => h.place === stop);
    return i >= 0 ? i : Math.max(0, hotels.length - 1);
  };

  const itinerary = [];

  itinerary.push({
    day: 1,
    title: `Arrive in ${firstStop}`,
    place: firstStop,
    summary: `Welcome to ${pkg.location}. Our representative meets you at ${meta.pickup} and transfers you to your hotel for check-in.`,
    activities: [
      `Meet & greet at ${meta.pickup}`,
      "Private transfer to the hotel and check-in",
      "Trip briefing with your coordinator, then rest and acclimatise",
      `Evening at leisure around ${firstStop}`,
    ],
    meals: mealsFor(true, false),
    stay: hotelForStop(firstStop)?.name,
    stayIndex: stayIndexFor(firstStop),
    transfer: "Airport / station pickup",
  });

  let previousStop = firstStop;
  for (let i = 0; i < middleDays; i += 1) {
    const stop = stops[Math.min(stops.length - 1, Math.floor((i * stops.length) / Math.max(1, middleDays)))] ?? firstStop;
    const highlight = highlights[i % highlights.length];
    const moved = stop !== previousStop;
    const secondary = highlights[(i + 1) % highlights.length];
    itinerary.push({
      day: i + 2,
      title: moved ? `${previousStop} to ${stop}` : `Explore ${stop}`,
      place: stop,
      summary: moved
        ? `After breakfast, a scenic drive takes you to ${stop}. Check in, then head out for ${highlight.toLowerCase()}.`
        : `A full day devoted to ${highlight.toLowerCase()} and the best of ${stop}, paced so you never feel rushed.`,
      activities: uniq([
        moved ? `Scenic drive from ${previousStop} to ${stop} with photo stops` : `Morning start for ${highlight}`,
        moved ? `Hotel check-in and freshen up` : `Guided visit and free time at ${stop}`,
        `${highlight} — the highlight of the day`,
        secondary !== highlight ? `Optional time for ${secondary.toLowerCase()}` : "Local market stroll and café stop",
      ]),
      meals: mealsFor(false, false),
      stay: hotelForStop(stop)?.name,
      stayIndex: stayIndexFor(stop),
      transfer: "Private AC vehicle",
    });
    previousStop = stop;
  }

  if (days > 1) {
    itinerary.push({
      day: days,
      title: "Farewell & departure",
      place: lastStop,
      summary: "Enjoy a relaxed breakfast, pick up last-minute souvenirs, then transfer to the airport or station with memories to keep.",
      activities: ["Breakfast and hotel check-out", "Souvenir shopping if time permits", "Private drop to airport / station"],
      meals: ["Breakfast"],
      stay: null,
      transfer: "Airport / station drop",
    });
  }

  return itinerary;
}

/* ----------------------- inclusions / content ----------------------- */

function buildInclusions(pkg, meta) {
  const core = [
    `${meta.nights} night${meta.nights === 1 ? "" : "s"} stay on twin sharing in ${meta.stars}★ hotels`,
    `Meals: ${meta.mealPlan.toLowerCase()} as per itinerary`,
    "Private AC vehicle for transfers and sightseeing",
    "All toll, parking, fuel and driver allowances",
    "Experienced trip coordinator on call 24x7",
    "All applicable hotel and transport taxes",
  ];
  const fromCatalogue = pkg.inclusions.map((item) => item);
  const extra = [];
  if (meta.international) extra.push("Visa guidance and documentation checklist");
  if (meta.flightsIncluded) extra.push("Flight ticketing assistance at best fares");
  if (meta.themes.includes("adventure")) extra.push("Permits and entry fees where mandatory");
  return uniq([...core, ...fromCatalogue, ...extra]);
}

function buildExclusions(pkg, meta) {
  const list = [
    meta.flightsIncluded ? "International airfare (we can book it for you)" : "Flight / train tickets to and from the destination",
    "Lunch and dinner unless mentioned in the itinerary",
    "Personal expenses — laundry, phone calls, tips, porterage",
    "Monument and activity entry tickets not listed in inclusions",
    "Travel insurance (strongly recommended)",
    "Any cost arising from weather, landslides, strikes or other force majeure",
    "Anything not explicitly mentioned under inclusions",
  ];
  if (meta.international) list.splice(1, 0, "Visa fees, tourism levies and city taxes payable locally");
  if (meta.difficulty === "Challenging") list.push("Oxygen cylinders, medical evacuation and trek-gear rentals");
  return list;
}

function buildThingsToCarry(meta) {
  const base = ["Government photo ID for every traveller", "Printed or digital booking vouchers", "Power bank and universal adapter", "Reusable water bottle", "Basic first-aid kit and personal medication"];
  if (meta.themes.includes("mountains") || meta.themes.includes("adventure")) {
    base.push("Layered warm clothing and thermals", "Sturdy shoes with good grip", "Sunscreen, lip balm and UV sunglasses");
  }
  if (meta.themes.includes("beaches")) base.push("Swimwear and quick-dry clothing", "Reef-safe sunscreen", "Flip-flops and a light cover-up");
  if (meta.themes.includes("spiritual")) base.push("Modest clothing that covers shoulders and knees", "Head covering for gurdwaras / temples", "Slip-on footwear for temple visits");
  if (meta.themes.includes("wildlife")) base.push("Neutral-coloured clothing", "Binoculars and insect repellent");
  if (meta.international) base.push("Passport valid 6+ months with blank pages", "Forex card or local currency");
  return base;
}

function buildFaqs(pkg, meta) {
  return [
    {
      q: `What is the best time to take the ${pkg.title} trip?`,
      a: `${meta.bestTime} is the sweet spot for ${pkg.location}. Prices are lowest in shoulder months and highest during peak holidays, so book early for long weekends.`,
    },
    {
      q: "Can I change hotels, dates or the itinerary?",
      a: "Yes. Every itinerary is a starting point. Tell us your travel date, hotel grade and must-do experiences and the desk will share a revised quote within a few hours.",
    },
    {
      q: `Is ${pkg.title} suitable for children and senior citizens?`,
      a: `The trip is rated "${meta.difficulty}". Children from 2 to 11 years are charged at a reduced rate and infants under 2 travel free of cost on existing bedding. We can slow the pace for senior travellers on request.`,
    },
    {
      q: "How do I pay and what is the cancellation policy?",
      a: "Pay 25% to confirm and the balance 15 days before departure via UPI, card or bank transfer. Cancellation slabs are listed on this page and repeated in your quote before you pay.",
    },
    {
      q: "Are flights or trains included in the price?",
      a: meta.flightsIncluded
        ? "International flights are priced separately so you can choose the airline and timing. Share your departure city and our team will add the best-value fares to the quote."
        : "Package prices cover everything from arrival at the pickup point to your drop. Tell us your departure city and we can add flights or train tickets to the quote.",
    },
  ];
}

function buildPolicies() {
  return {
    cancellation: [
      { window: "30+ days before departure", refund: "90% refund", tone: "good" },
      { window: "15 – 29 days before", refund: "60% refund", tone: "ok" },
      { window: "7 – 14 days before", refund: "30% refund", tone: "warn" },
      { window: "Under 7 days", refund: "No refund", tone: "bad" },
    ],
    payment: [
      "25% of the package cost confirms your booking",
      "Balance is due 15 days before departure",
      "UPI, credit / debit cards and bank transfer accepted",
      "GST invoice shared with your final confirmation",
    ],
    notes: [
      "Check-in is usually 12:00 and check-out 11:00. Early check-in is subject to availability.",
      "Itinerary order may change based on weather, road conditions and local permits without affecting inclusions.",
      "Children aged 2 – 11 are charged as per the child rate. Infants under 2 are free without a separate bed.",
    ],
  };
}

/* ----------------------------- departures ----------------------------- */

export function buildDepartures(pkg, fromDate = new Date(), count = 10) {
  const seed = hashString(pkg.id);
  const start = addDaysUtc(fromDate, 9);
  // Snap to the next Friday so departures cluster around weekends.
  const toFriday = (5 - start.getUTCDay() + 7) % 7;
  const first = addDaysUtc(start, toFriday);
  const factors = [0.95, 1, 1.08, 1, 0.97, 1.12, 1, 0.95, 1.05, 1];

  return Array.from({ length: count }, (_, i) => {
    const date = addDaysUtc(first, i * 7);
    const factor = factors[(seed + i) % factors.length];
    const seatsLeft = 2 + ((seed + i * 5) % 11);
    return {
      date: isoDate(date),
      factor,
      seatsLeft,
      label: factor < 1 ? "Best price" : factor > 1.05 ? "Peak" : seatsLeft <= 4 ? "Filling fast" : "Available",
      price: Math.round((pkg.price * factor) / 10) * 10,
    };
  });
}

/**
 * Each itinerary day (except departure) is one night, and every night has its own hotel choice.
 * Make the hotels' night counts match the days that actually sleep at them, and drop stops the
 * route never overnights at, so night N of the trip lines up with day N of the itinerary.
 */
function alignStaysToItinerary(hotels, itinerary) {
  if (itinerary.length < 2) return { hotels, itinerary };
  const counts = hotels.map(() => 0);
  itinerary.forEach((day) => {
    if (Number.isInteger(day.stayIndex) && counts[day.stayIndex] !== undefined) counts[day.stayIndex] += 1;
  });
  const remap = new Map();
  const kept = [];
  hotels.forEach((hotel, i) => {
    if (counts[i] > 0) {
      remap.set(i, kept.length);
      kept.push({ ...hotel, nights: counts[i] });
    }
  });
  if (!kept.length) return { hotels, itinerary };
  return {
    hotels: kept,
    itinerary: itinerary.map((day) =>
      Number.isInteger(day.stayIndex) ? { ...day, stayIndex: remap.get(day.stayIndex) } : day
    ),
  };
}

/* ----------------------------- main builder ----------------------------- */

export function buildPackageDetail(pkg, fromDate = new Date()) {
  const meta = getPackageMeta(pkg);
  const stops = pkg.subtitle
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  const gallery = buildGallery(pkg);
  const hotels = buildHotels(pkg, meta, stops, gallery);
  const rawItinerary = buildItinerary(pkg, meta, stops, hotels);
  const { hotels: stayHotels, itinerary } = alignStaysToItinerary(hotels, rawItinerary);

  return {
    meta,
    stops,
    gallery,
    hotels: stayHotels,
    itinerary,
    inclusions: buildInclusions(pkg, meta),
    exclusions: buildExclusions(pkg, meta),
    thingsToCarry: buildThingsToCarry(meta),
    faqs: buildFaqs(pkg, meta),
    policies: buildPolicies(),
    departures: buildDepartures(pkg, fromDate),
    quickFacts: [
      { key: "duration", label: "Duration", value: pkg.duration },
      { key: "group", label: "Group size", value: pkg.groupSize },
      { key: "best", label: "Best time", value: meta.bestTime },
      { key: "pickup", label: "Pickup", value: meta.pickup },
      { key: "difficulty", label: "Difficulty", value: meta.difficulty },
      { key: "meals", label: "Meals", value: meta.mealPlan },
    ],
  };
}

export function getSimilarPackages(pkg, limit = 4) {
  const meta = getPackageMeta(pkg);
  return TOUR_PACKAGES.filter((p) => p.id !== pkg.id)
    .map((p) => {
      const other = getPackageMeta(p);
      const shared = other.themes.filter((t) => meta.themes.includes(t)).length;
      const score =
        shared * 3 +
        (p.country === pkg.country ? 2 : 0) +
        (p.state === pkg.state ? 2 : 0) -
        Math.abs(p.price - pkg.price) / 30000;
      return { pkg: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.pkg);
}

/* ------------------------------- pricing ------------------------------- */

const roundTo10 = (n) => Math.round(n / 10) * 10;

export { childFactor };

/**
 * Transparent, per-line price estimate. The final quote is always confirmed by the desk;
 * this exists so travellers see what drives the total.
 */
export function calculateTripPrice({
  price,
  originalPrice,
  adults = 2,
  childAges = [],
  infants = 0,
  hotelCategory = "standard",
  dateFactor = 1,
  // Optional customisation (all deltas are against what the package price already includes).
  stays = null, // [{ nights, category }] from resolveStays()
  meta = null,
  baseStars,
  mealId = "auto",
  cabId = "auto",
}) {
  const stayInfo = summariseStays(stays, baseStars ?? meta?.stars, hotelCategory);
  const hotel = stayInfo;
  const adultFare = roundTo10(price * stayInfo.factor * dateFactor);
  const lines = [];

  lines.push({
    key: "adults",
    label: `${adults} Adult${adults === 1 ? "" : "s"}`,
    detail: `${adultFare.toLocaleString("en-IN")} × ${adults}`,
    amount: adultFare * adults,
  });

  let subtotal = adultFare * adults;

  if (adults === 1) {
    const supplement = roundTo10(adultFare * 0.35);
    lines.push({ key: "single", label: "Single occupancy supplement", detail: "Solo traveller", amount: supplement });
    subtotal += supplement;
  }

  if (childAges.length) {
    const childTotal = childAges.reduce((sum, age) => sum + roundTo10(adultFare * childFactor(age)), 0);
    lines.push({
      key: "children",
      label: `${childAges.length} Child${childAges.length === 1 ? "" : "ren"}`,
      detail: `Ages ${childAges.join(", ")}`,
      amount: childTotal,
    });
    subtotal += childTotal;
  }

  if (infants > 0) {
    lines.push({ key: "infants", label: `${infants} Infant${infants === 1 ? "" : "s"}`, detail: "Under 2 years", amount: 0, free: true });
  }

  const baseSubtotal = subtotal;

  let meal = null;
  let cab = null;
  if (meta) {
    meal = calculateMealDelta({ meta, mealId, adults, childAges, stays });
    if (meal.amount !== 0) {
      lines.push({
        key: "meals",
        label: `Meals · ${meal.plan.label}`,
        detail: meal.amount > 0 ? "Upgrade from included plan" : "Lower than included plan",
        amount: meal.amount,
        adjustment: true,
      });
      subtotal += meal.amount;
    }

    cab = planCab({ meta, cabId, pax: cabPassengers({ adults, childAges }) });
    if (cab.delta !== 0) {
      lines.push({
        key: "cab",
        label: `Vehicle · ${cab.vehicles > 1 ? `${cab.vehicles} × ` : ""}${cab.option.label}`,
        detail: cab.delta > 0 ? "Upgrade from recommended" : "Lower than recommended",
        amount: cab.delta,
        adjustment: true,
      });
      subtotal += cab.delta;
    }
  }

  const payingTravellers = adults + childAges.length;
  const groupRate = payingTravellers >= 10 ? 0.08 : payingTravellers >= 6 ? 0.05 : 0;
  const groupDiscount = groupRate ? roundTo10(subtotal * groupRate) : 0;
  const taxable = subtotal - groupDiscount;
  const gst = Math.round(taxable * 0.05);
  const total = taxable + gst;

  const listFactor = originalPrice && originalPrice > price ? originalPrice / price : 1;
  const originalTotal = roundTo10(baseSubtotal * listFactor);

  return {
    lines,
    subtotal,
    groupDiscount,
    groupRate,
    gst,
    total,
    perPerson: Math.round(total / Math.max(1, payingTravellers)),
    originalTotal,
    savings: Math.max(0, originalTotal - baseSubtotal + groupDiscount),
    hotel,
    hotelDelta: roundTo10(baseSubtotal * (1 - 1 / (stayInfo.factor || 1))),
    meal,
    cab,
  };
}
