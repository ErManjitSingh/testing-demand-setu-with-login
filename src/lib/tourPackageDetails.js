import { getStateImage } from "@/components/state/stateImageMap";
import { COUNTRIES, getCityImage } from "@/lib/tourDestinations";
import {
  HOTEL_CATEGORIES,
  getPackageMeta,
  hashString,
} from "@/lib/tourPackageMeta";
import { TOUR_PACKAGES, getPackageImage } from "@/lib/tourPackages";

/**
 * Static product-page content. Everything is derived from the catalogue entry so a
 * new package in tourPackages.js automatically gets a full page. Swap any section for
 * real CMS / API data later — the shape returned here is what the UI consumes.
 */

const THEME_IMAGE_POOL = {
  mountains: ["Ladakh", "Himachal Pradesh", "Sikkim", "Uttarakhand", "Jammu & Kashmir"],
  beaches: ["Goa", "Kerala", "Pondicherry", "Thailand", "Sri Lanka"],
  heritage: ["Rajasthan", "Karnataka", "Delhi", "Gujarat", "Telangana", "Uttar Pradesh"],
  spiritual: ["Uttarakhand", "Punjab", "Uttar Pradesh", "Tirupati"],
  wildlife: ["Assam", "Meghalaya", "Karnataka", "Madhya Pradesh", "Kerala"],
  honeymoon: ["Kerala", "Himachal Pradesh", "Jammu & Kashmir", "Goa"],
  adventure: ["Ladakh", "Himachal Pradesh", "Uttarakhand", "Sikkim"],
  city: ["Maharashtra", "Delhi", "Telangana", "Karnataka"],
  family: ["Goa", "Rajasthan", "Kerala", "Tamil Nadu"],
};

const FILLER_STATES = ["Himachal Pradesh", "Kerala", "Rajasthan", "Goa", "Sikkim", "Uttarakhand", "Karnataka", "Gujarat"];

const HOTEL_SUFFIXES = ["Residency", "Grand", "Retreat", "Heritage Inn", "Resort & Spa", "Boutique Stay"];

const REVIEWERS = [
  { name: "Priya Sharma", from: "Mumbai", trip: "Couple" },
  { name: "Rahul Verma", from: "Delhi", trip: "Friends" },
  { name: "Ananya Iyer", from: "Bengaluru", trip: "Family" },
  { name: "Vikram Mehta", from: "Ahmedabad", trip: "Couple" },
  { name: "Sneha Reddy", from: "Hyderabad", trip: "Family" },
  { name: "Arjun Kapoor", from: "Pune", trip: "Friends" },
  { name: "Meera Nair", from: "Chennai", trip: "Solo" },
  { name: "Kabir Singh", from: "Chandigarh", trip: "Couple" },
];

const REVIEW_BODIES = [
  (t) => `Everything on the ${t} trip ran like clockwork. Hotels, cabs and sightseeing were exactly as promised and the coordinator answered every call.`,
  (t) => `We were nervous about planning ${t} ourselves, so booking a package was the best decision. Great pacing, never rushed, and the stays were spotless.`,
  (t) => `The itinerary for ${t} balanced big sights with free time. Our driver knew the best viewpoints and local food stops. Would book again.`,
  (t) => `Took the kids along and the team adjusted the plan without any fuss. Early check-ins and child-friendly meals made ${t} stress-free.`,
  (t) => `Value for money is excellent. Compared with three other quotes, Demand Setu gave the most complete ${t} plan with no hidden extras.`,
  (t) => `Loved how personal it felt. They changed two hotels for us on request and still kept the price fair. ${t} is going on our yearly list.`,
];

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

const UNKNOWN_PLACE_IMAGE = getStateImage("__unknown__");

function buildGallery(pkg, meta, stops) {
  const images = [getPackageImage(pkg)];
  images.push(getStateImage(pkg.state));
  const country = COUNTRIES.find((c) => c.name === pkg.country);
  if (country?.image) images.push(country.image);
  stops.forEach((stop) => images.push(getCityImage(stop)));

  // Fill with themed imagery so the gallery always feels full.
  const seed = hashString(pkg.id);
  meta.themes.forEach((theme, i) => {
    const pool = THEME_IMAGE_POOL[theme] ?? [];
    if (pool.length) images.push(getStateImage(pick(pool, seed, i)));
  });
  meta.themes.forEach((theme, i) => {
    const pool = THEME_IMAGE_POOL[theme] ?? [];
    if (pool.length) images.push(getStateImage(pick(pool, seed, i + 2)));
  });

  // Last-resort filler so the bento gallery never has empty tiles.
  FILLER_STATES.forEach((_, i) => images.push(getStateImage(pick(FILLER_STATES, seed, i))));

  // Places without a dedicated photo resolve to a generic placeholder — drop those.
  const gallery = uniq(images).filter((src, i) => i === 0 || src !== UNKNOWN_PLACE_IMAGE);
  const captions = [
    pkg.title,
    ...stops,
    ...pkg.highlights,
    "Local life",
    "Where you will stay",
    "Golden hour",
  ];
  return gallery.slice(0, 8).map((src, i) => ({
    src,
    alt: `${pkg.title} — ${captions[i] ?? "photo"}`,
    caption: captions[i] ?? pkg.title,
  }));
}

/* ------------------------------ stays ------------------------------ */

function buildHotels(pkg, meta, stops, gallery) {
  const seed = hashString(pkg.id);
  const places = stops.slice(0, 4);
  const nightsEach = Math.max(1, Math.floor(meta.nights / Math.max(1, places.length)));
  return places.map((place, i) => ({
    id: `${pkg.id}-stay-${i}`,
    place,
    name: `${place} ${pick(HOTEL_SUFFIXES, seed, i)}`,
    stars: meta.stars,
    nights: i === places.length - 1 ? Math.max(1, meta.nights - nightsEach * (places.length - 1)) : nightsEach,
    image: gallery[(i + 1) % gallery.length]?.src ?? gallery[0]?.src,
    amenities: uniq([
      "Free Wi-Fi",
      meta.mealPlan.toLowerCase().includes("dinner") || meta.mealPlan === "All meals" ? "Restaurant" : "Breakfast",
      meta.stars >= 4 ? "Room service" : "Hot water 24x7",
      meta.stars >= 5 ? "Spa & pool" : "Power backup",
    ]),
    note: "Or similar property of the same category",
  }));
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

/* ------------------------------ reviews ------------------------------ */

function buildReviews(pkg) {
  const seed = hashString(pkg.id);
  const total = pkg.reviews;
  const avg = pkg.rating;
  const five = Math.round(total * Math.min(0.9, 0.35 + (avg - 4) * 0.55));
  const four = Math.round(total * (1 - Math.min(0.9, 0.35 + (avg - 4) * 0.55)) * 0.78);
  const three = Math.round((total - five - four) * 0.7);
  const two = Math.max(0, Math.round((total - five - four - three) * 0.6));
  const one = Math.max(0, total - five - four - three - two);
  const distribution = [
    { stars: 5, count: five },
    { stars: 4, count: four },
    { stars: 3, count: three },
    { stars: 2, count: two },
    { stars: 1, count: one },
  ];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const items = Array.from({ length: 4 }, (_, i) => {
    const who = pick(REVIEWERS, seed, i * 2);
    return {
      id: `${pkg.id}-review-${i}`,
      name: who.name,
      from: who.from,
      tripType: who.trip,
      rating: i === 3 ? 4 : 5,
      month: `${pick(months, seed, i * 3)} ${2025 + (i % 2)}`,
      text: pick(REVIEW_BODIES, seed, i)(pkg.title),
      helpful: 4 + ((seed + i * 7) % 29),
    };
  });

  const categories = [
    { label: "Itinerary", score: Math.min(5, avg + 0.0) },
    { label: "Hotels", score: Math.max(4.2, avg - 0.1) },
    { label: "Transport", score: Math.min(5, avg + 0.05) },
    { label: "Value for money", score: Math.max(4.1, avg - 0.2) },
    { label: "Support", score: Math.min(5, avg + 0.1) },
  ].map((c) => ({ ...c, score: Math.round(c.score * 10) / 10 }));

  return { average: avg, total, distribution, items, categories };
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

/* ----------------------------- main builder ----------------------------- */

export function buildPackageDetail(pkg, fromDate = new Date()) {
  const meta = getPackageMeta(pkg);
  const stops = pkg.subtitle
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  const gallery = buildGallery(pkg, meta, stops);
  const hotels = buildHotels(pkg, meta, stops, gallery);
  const itinerary = buildItinerary(pkg, meta, stops, hotels);

  return {
    meta,
    stops,
    gallery,
    hotels,
    itinerary,
    inclusions: buildInclusions(pkg, meta),
    exclusions: buildExclusions(pkg, meta),
    thingsToCarry: buildThingsToCarry(meta),
    faqs: buildFaqs(pkg, meta),
    policies: buildPolicies(),
    reviews: buildReviews(pkg),
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

export function childFactor(age) {
  return age <= 5 ? 0.6 : 0.8;
}

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
}) {
  const hotel = HOTEL_CATEGORIES.find((h) => h.id === hotelCategory) ?? HOTEL_CATEGORIES[0];
  const adultFare = roundTo10(price * hotel.factor * dateFactor);
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

  const payingTravellers = adults + childAges.length;
  const groupRate = payingTravellers >= 10 ? 0.08 : payingTravellers >= 6 ? 0.05 : 0;
  const groupDiscount = groupRate ? roundTo10(subtotal * groupRate) : 0;
  const taxable = subtotal - groupDiscount;
  const gst = Math.round(taxable * 0.05);
  const total = taxable + gst;

  const listFactor = originalPrice && originalPrice > price ? originalPrice / price : 1;
  const originalTotal = roundTo10((subtotal) * listFactor);

  return {
    lines,
    subtotal,
    groupDiscount,
    groupRate,
    gst,
    total,
    perPerson: Math.round(total / Math.max(1, payingTravellers)),
    originalTotal,
    savings: Math.max(0, originalTotal - subtotal + groupDiscount),
    hotel,
  };
}
