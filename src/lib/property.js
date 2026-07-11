const ROOM_IMAGES = {
  deluxe:
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80",
  suite:
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&q=80",
  family:
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=900&q=80",
  studio:
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80",
  loft:
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80",
  villa:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80",
  garden:
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80",
  beach:
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&q=80",
};

/** Standard hotel meal plans (MMT-style labels for room rate rows) */
export const MEAL_PLAN_DEFS = {
  EP: {
    name: "European Plan",
    short: "EP",
    desc: "Room only",
    mmtLabel: "Room Only",
    inclusion: "No meals included",
    inclusionType: "none",
  },
  CP: {
    name: "Continental Plan",
    short: "CP",
    desc: "Room + breakfast",
    mmtLabel: "Room with Breakfast",
    inclusion: "Free Breakfast",
    inclusionType: "breakfast",
  },
  MAP: {
    name: "Modified American Plan",
    short: "MAP",
    desc: "Breakfast + dinner",
    mmtLabel: "Room with Breakfast + Lunch/Dinner",
    inclusion: "Breakfast & Lunch/Dinner included",
    inclusionType: "meals",
  },
  AP: {
    name: "American Plan",
    short: "AP",
    desc: "All meals included",
    mmtLabel: "Room with All Meals",
    inclusion: "Breakfast, Lunch & Dinner",
    inclusionType: "meals",
  },
};

export function buildMealPlans(basePrice) {
  return [
    { code: "EP", ...MEAL_PLAN_DEFS.EP, addOn: 0, total: basePrice },
    { code: "CP", ...MEAL_PLAN_DEFS.CP, addOn: Math.round(basePrice * 0.12), total: basePrice + Math.round(basePrice * 0.12) },
    { code: "MAP", ...MEAL_PLAN_DEFS.MAP, addOn: Math.round(basePrice * 0.22), total: basePrice + Math.round(basePrice * 0.22) },
    { code: "AP", ...MEAL_PLAN_DEFS.AP, addOn: Math.round(basePrice * 0.32), total: basePrice + Math.round(basePrice * 0.32) },
  ];
}

export const AMENITY_ICON_MAP = {
  "Free WiFi": "wifi",
  Pool: "pool",
  Breakfast: "breakfast",
  Parking: "parking",
  AC: "ac",
  Kitchen: "kitchen",
  "Pet friendly": "pet",
  Spa: "spa",
  "Sea view": "view",
  Minibar: "minibar",
  TV: "tv",
  Balcony: "balcony",
  "Room service": "service",
  Gym: "gym",
  Restaurant: "restaurant",
};

export const PROPERTY_POLICIES = [
  { label: "Check-in", value: "2:00 PM – 11:00 PM" },
  { label: "Check-out", value: "Before 11:00 AM" },
  { label: "Cancellation", value: "Free cancellation up to 48 hours before check-in" },
  { label: "Children", value: "Welcome · Cots available on request" },
];

export const BOOKING_POLICIES = [
  {
    icon: "💳",
    title: "Payment",
    text: "Pay 30% advance to confirm booking. Balance due at check-in. UPI, cards & net banking accepted.",
  },
  {
    icon: "↩️",
    title: "Cancellation",
    text: "Free cancellation up to 48 hours before check-in. 50% refund within 24–48 hours. No refund within 24 hours.",
  },
  {
    icon: "📋",
    title: "Modification",
    text: "Date changes allowed once, subject to availability. Meal plan upgrades can be done until 24 hrs before arrival.",
  },
  {
    icon: "🪪",
    title: "ID & check-in",
    text: "Valid government photo ID required for all guests. Early check-in / late check-out on request (charges may apply).",
  },
  {
    icon: "👶",
    title: "Children & extra beds",
    text: "Children under 5 stay free on existing bedding. Extra bed charges apply as per room category.",
  },
  {
    icon: "🐾",
    title: "Pets",
    text: "Pet-friendly rooms available on select categories only. Prior intimation required.",
  },
];

export function getPropertyRooms(listing) {
  const base = listing.price;
  const g0 = listing.gallery?.[0] ?? listing.image;
  const g1 = listing.gallery?.[1] ?? g0;

  const withPlans = (room) => ({
    ...room,
    mealPlans: buildMealPlans(room.price),
  });

  const templates = {
    hotel: [
      withPlans({
        id: "deluxe",
        category: "Deluxe",
        name: "Deluxe King Room",
        image: ROOM_IMAGES.deluxe,
        gallery: [ROOM_IMAGES.deluxe, g0, g1],
        size: "32 m²",
        bed: "1 King bed",
        guests: 2,
        price: base,
        originalPrice: listing.originalPrice,
        badge: "Most popular",
        amenities: ["Sea view", "AC", "Free WiFi", "Minibar", "TV"],
        available: 4,
      }),
      withPlans({
        id: "suite",
        category: "Suite",
        name: "Executive Suite",
        image: ROOM_IMAGES.suite,
        gallery: [ROOM_IMAGES.suite, g1, ROOM_IMAGES.deluxe],
        size: "52 m²",
        bed: "1 King + living area",
        guests: 3,
        price: Math.round(base * 1.45),
        originalPrice: listing.originalPrice
          ? Math.round(listing.originalPrice * 1.4)
          : null,
        badge: "Premium",
        amenities: ["Sea view", "AC", "Free WiFi", "Minibar", "Balcony", "Room service"],
        available: 2,
      }),
      withPlans({
        id: "family",
        category: "Family",
        name: "Family Connecting Room",
        image: ROOM_IMAGES.family,
        gallery: [ROOM_IMAGES.family, g0],
        size: "48 m²",
        bed: "2 Queen beds",
        guests: 4,
        price: Math.round(base * 1.28),
        amenities: ["AC", "Free WiFi", "TV", "Breakfast"],
        available: 3,
      }),
    ],
    airbnb: [
      withPlans({
        id: "studio",
        category: "Studio",
        name: "Open Studio Space",
        image: ROOM_IMAGES.studio,
        gallery: [ROOM_IMAGES.studio, g0],
        size: "45 m²",
        bed: "1 Queen + sofa bed",
        guests: 2,
        price: base,
        badge: "Entire unit",
        amenities: ["Kitchen", "AC", "Free WiFi", "Balcony"],
        available: 1,
      }),
      withPlans({
        id: "loft",
        category: "Loft",
        name: "Penthouse Loft",
        image: ROOM_IMAGES.loft,
        gallery: [ROOM_IMAGES.loft, g1],
        size: "68 m²",
        bed: "1 King + lounge",
        guests: 4,
        price: Math.round(base * 1.35),
        badge: "Top floor",
        amenities: ["Sea view", "Kitchen", "AC", "Free WiFi", "Balcony"],
        available: 1,
      }),
    ],
    homestay: [
      withPlans({
        id: "master",
        category: "Master Wing",
        name: "Master Suite with Pool Access",
        image: ROOM_IMAGES.villa,
        gallery: [ROOM_IMAGES.villa, g0, g1],
        size: "65 m²",
        bed: "1 King bed",
        guests: 2,
        price: base,
        originalPrice: listing.originalPrice,
        badge: "Best seller",
        amenities: ["Pool", "AC", "Free WiFi", "Breakfast", "Balcony"],
        available: 1,
      }),
      withPlans({
        id: "garden",
        category: "Garden Wing",
        name: "Garden View Double Room",
        image: ROOM_IMAGES.garden,
        gallery: [ROOM_IMAGES.garden, g0],
        size: "38 m²",
        bed: "1 Queen bed",
        guests: 2,
        price: Math.round(base * 0.72),
        amenities: ["AC", "Free WiFi", "Breakfast", "Parking"],
        available: 2,
      }),
      withPlans({
        id: "entire",
        category: "Entire Villa",
        name: "Full Property · All Bedrooms",
        image: g0,
        gallery: listing.gallery?.length ? listing.gallery : [g0, ROOM_IMAGES.villa],
        size: `${listing.beds * 28}+ m²`,
        bed: `${listing.beds} bedrooms · ${listing.baths} baths`,
        guests: listing.guests,
        price: Math.round(base * 1.85),
        badge: "Exclusive",
        amenities: ["Pool", "Kitchen", "Parking", "Pet friendly", "Free WiFi"],
        available: 1,
      }),
    ],
  };

  return templates[listing.category] ?? templates.hotel;
}

export function getRoomCategories(rooms) {
  const cats = [...new Set(rooms.map((r) => r.category))];
  return ["All", ...cats];
}

export function getPropertyAmenityGroups(listing) {
  const all = listing.amenities ?? [];
  const roomExtras = ["AC", "Minibar", "TV", "Balcony", "Sea view"];

  return [
    {
      title: "Popular amenities",
      items: all.filter((a) => !roomExtras.includes(a)),
    },
    {
      title: "Room features",
      items: [
        ...all.filter((a) => roomExtras.includes(a)),
        "Daily housekeeping",
        "Premium linens",
      ].filter((v, i, arr) => arr.indexOf(v) === i),
    },
  ];
}

export function getPropertyHighlights(listing) {
  return [
    { icon: "★", label: `${listing.rating} guest rating` },
    { icon: "📍", label: listing.location },
    { icon: "✓", label: "Instant confirmation" },
  ];
}

export function getPropertyGallery(listing) {
  const base = listing.gallery?.length ? [...listing.gallery] : [listing.image];
  const extras = [ROOM_IMAGES.deluxe, ROOM_IMAGES.suite, ROOM_IMAGES.villa, ROOM_IMAGES.beach].filter(
    (src) => !base.includes(src)
  );
  return [...base, ...extras].slice(0, 3);
}
