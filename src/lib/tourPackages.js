/**
 * Catalogue is dynamic now — this array stays empty on purpose.
 * Helpers below still power UI (pricing format, FAQ, etc.).
 * Package photos come only from the package payload — never invent fallbacks.
 */
export const TOUR_PACKAGES = [];

/** Returns the package's own image URL, or "" if none. */
export function getPackageImage(pkg) {
  return (pkg?.image && String(pkg.image).trim()) || "";
}

export const PACKAGE_FAQ = [
  {
    q: "What is included in a Demand Setu tour package?",
    a: "Most packages include accommodation, daily breakfast (or all meals where specified), private or shared transfers, sightseeing, and on-ground support. International packages may include visa assistance. Exact inclusions are listed on each package card — our team confirms everything before you book.",
  },
  {
    q: "Can I customise dates, hotels, or the itinerary?",
    a: "Yes. Every package can be tailored to your travel dates, group size, hotel preferences, and special requests. Click View detail on any package or use the search form — our specialists will share a revised quote within a few hours.",
  },
  {
    q: "Do you operate tours outside India?",
    a: "Absolutely. We curate packages across Nepal, Bhutan, Thailand, Dubai, Sri Lanka, and more. Select a country in the search widget or browse Explore Countries to start planning your international trip.",
  },
  {
    q: "How do I book and pay for a tour package?",
    a: "Submit an enquiry through any package card or the search form. Our team shares a detailed itinerary and quote. Once confirmed, you can pay securely online or via bank transfer. We provide booking confirmation and a dedicated trip coordinator.",
  },
  {
    q: "What is your cancellation and refund policy?",
    a: "Cancellation terms vary by package and season. Generally, free cancellation is available up to 15–30 days before departure; closer dates may incur partial charges. Your quote will include clear cancellation terms before payment.",
  },
  {
    q: "Are group discounts available?",
    a: "Yes — groups of 6 or more travellers receive special rates on most domestic and international packages. Corporate outings, school trips, and wedding groups are welcome. Mention your group size in the enquiry form.",
  },
  {
    q: "Is travel insurance included?",
    a: "Basic travel insurance can be added to any package on request. We strongly recommend insurance for adventure routes (Ladakh, Spiti, treks) and all international trips. Ask our team when you enquire.",
  },
  {
    q: "Who do I contact during the trip?",
    a: "You get 24/7 orange-line support from booking through return. A dedicated trip coordinator shares driver and hotel contacts before departure, and our helpline (+91 8353056000) is always available.",
  },
];

export const PACKAGE_TESTIMONIALS = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    package: "Ladakh Escape",
    rating: 5,
    text: "Flawless from enquiry to return. Pangong stay, permits, cab — everything handled. Best trip we've ever taken.",
    avatar: "PS",
  },
  {
    name: "Rahul & Ananya",
    location: "Bangalore",
    package: "Himachal Honeymoon",
    rating: 5,
    text: "They customised our Manali itinerary with a surprise candlelight dinner. Felt truly personal and premium.",
    avatar: "RA",
  },
  {
    name: "Vikram Mehta",
    location: "Delhi",
    package: "Dubai Luxury Escape",
    rating: 5,
    text: "International trip made easy — visa help, airport pickup, desert safari all pre-booked. Zero stress.",
    avatar: "VM",
  },
  {
    name: "Sneha Reddy",
    location: "Hyderabad",
    package: "Kerala Backwaters",
    rating: 5,
    text: "Houseboat experience was magical. Demand Setu team checked in daily. Already booked Rajasthan for December.",
    avatar: "SR",
  },
];

export const PACKAGE_DESTINATIONS = ["All"];

export function getPackageBySlug(slug) {
  return TOUR_PACKAGES.find((p) => p.slug === slug) ?? null;
}

export function getFamousPackages() {
  return TOUR_PACKAGES.filter((p) => p.famous);
}

export function getAllPackages() {
  return TOUR_PACKAGES;
}

export function getPackageCategories() {
  return ["All", "India", "International", "Adventure", "Spiritual", "Beach"];
}

export function filterPackages(packages, category) {
  if (!category || category === "All") return packages;
  if (category === "India") return packages.filter((p) => p.country === "India");
  if (category === "International") return packages.filter((p) => p.country !== "India");
  if (category === "Adventure")
    return packages.filter((p) => ["Adventure", "Offbeat", "Island Life"].includes(p.badge));
  if (category === "Spiritual")
    return packages.filter((p) => ["Spiritual", "Cultural", "Heritage Pick"].includes(p.badge));
  if (category === "Beach")
    return packages.filter((p) => ["Weekend Special", "Island Life", "Serene Escape"].includes(p.badge));
  return packages;
}

export function formatPackagePrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
