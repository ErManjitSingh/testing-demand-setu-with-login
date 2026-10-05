import { parseFilters } from "@/lib/packageFilters";
import { DEPARTURE_CITIES, HOTEL_CATEGORIES } from "@/lib/tourPackageMeta";
import { TOUR_ENQUIRY_TYPES } from "@/lib/tourEnquiryTypes";

/** Shared helpers for the product page -> booking page hand-off. */

export const PAYMENT_PLANS = [
  { id: "part", label: "Pay 25% to confirm", blurb: "Balance due 15 days before departure", share: 0.25 },
  { id: "full", label: "Pay in full", blurb: "One payment, nothing to remember later", share: 1 },
  { id: "emi", label: "Easy EMI", blurb: "Split across 3, 6 or 9 months on cards", share: 0.25 },
];

export const PAYMENT_METHODS = [
  { id: "upi", label: "UPI" },
  { id: "card", label: "Credit / debit card" },
  { id: "netbanking", label: "Net banking" },
  { id: "bank", label: "Bank transfer" },
];

export const SPECIAL_REQUESTS = [
  "Honeymoon / anniversary setup",
  "Vegetarian / Jain meals",
  "Ground-floor or accessible rooms",
  "Early check-in / late check-out",
  "Airport pick-up on arrival",
  "Birthday cake or surprise",
];

/** Query string that carries the booking card state onto the booking page. */
export function buildBookingHref(slug, booking = {}) {
  const p = new URLSearchParams();
  if (booking.date) p.set("date", booking.date);
  const t = booking.travellers;
  if (t) {
    if (t.adults !== 2) p.set("adults", String(t.adults));
    if (t.children) {
      p.set("children", String(t.children));
      p.set("ages", t.childAges.join(","));
    }
    if (t.infants) p.set("infants", String(t.infants));
  }
  if (booking.hotel && booking.hotel !== "standard") p.set("hotel", booking.hotel);
  if (booking.departureCity && booking.departureCity !== "Delhi") p.set("from", booking.departureCity);
  if (booking.tourType && booking.tourType !== "private") p.set("type", booking.tourType);
  if (booking.ticketBooked === "yes") p.set("tickets", "yes");
  const qs = p.toString();
  return `/packages/${slug}/book${qs ? `?${qs}` : ""}`;
}

const first = (value) => (Array.isArray(value) ? value[0] : value);

/** Inverse of `buildBookingHref`, safe for untrusted query input. */
export function parseBookingQuery(query = {}, today = "") {
  const parsed = parseFilters(query);
  const hotel = first(query.hotel);
  const from = first(query.from);
  const type = first(query.type);

  return {
    date: parsed.date && (!today || parsed.date >= today) ? parsed.date : "",
    travellers: parsed.travellers,
    hotel: HOTEL_CATEGORIES.some((h) => h.id === hotel) ? hotel : "standard",
    departureCity: DEPARTURE_CITIES.includes(from) ? from : "Delhi",
    tourType: TOUR_ENQUIRY_TYPES.some((t) => t.value === type)
      ? type
      : parsed.travellers.children > 0
        ? "family"
        : "private",
    ticketBooked: first(query.tickets) === "yes" ? "yes" : "no",
  };
}

/** Human-friendly booking reference, e.g. DS-4K9X2M. Avoids look-alike characters. */
export function createBookingRef() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes =
    typeof crypto !== "undefined" && crypto.getRandomValues
      ? crypto.getRandomValues(new Uint8Array(6))
      : Array.from({ length: 6 }, () => Math.floor(Math.random() * 256));
  bytes.forEach((b) => {
    out += alphabet[b % alphabet.length];
  });
  return `DS-${out}`;
}

/** Link to the listing page for a free-text place / package search. */
export function buildListingHref({ q = "", themes = [], region = "", sort = "" } = {}) {
  const p = new URLSearchParams();
  if (q) p.set("q", q);
  if (themes.length) p.set("themes", themes.join(","));
  if (region) p.set("region", region);
  if (sort) p.set("sort", sort);
  const qs = p.toString();
  return `/packages${qs ? `?${qs}` : ""}`;
}
