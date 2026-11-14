import { PACKAGE_THEMES } from "@/lib/tourPackageMeta";
import { buildListingHref } from "@/lib/packageBooking";
import { placesHref } from "@/lib/places/placesText";

/**
 * Footer link groups. Everything points at the tour-packages side of the site
 * (package listing filters and the /places guide) — nothing here depends on an API,
 * so the footer never slows a page down.
 */

export const FOOTER_TRIP_TYPES = PACKAGE_THEMES.map((theme) => ({
  label: theme.label,
  href: buildListingHref({ themes: [theme.id] }),
}));

export const FOOTER_INDIA_DESTINATIONS = [
  "Himachal Pradesh",
  "Ladakh",
  "Rajasthan",
  "Kerala",
  "Goa",
  "Jammu & Kashmir",
  "Uttarakhand",
  "Sikkim",
].map((name) => ({ label: name, href: buildListingHref({ q: name }) }));

export const FOOTER_INTERNATIONAL = ["Dubai", "Thailand", "Bali", "Maldives", "Nepal", "Bhutan"].map((name) => ({
  label: name,
  href: buildListingHref({ q: name }),
}));

// slug = internal state slug used by the /places guide
const PLACE_STATES = [
  { label: "Himachal Pradesh", slug: "himachal-pradesh" },
  { label: "Meghalaya", slug: "meghalaya" },
  { label: "Sikkim", slug: "sikkim" },
  { label: "Rajasthan", slug: "rajasthan" },
  { label: "Gujarat", slug: "gujarat" },
  { label: "Uttarakhand", slug: "uttarakhand" },
  { label: "Tamil Nadu", slug: "tamil-nadu" },
];

export const FOOTER_PLACE_STATES = [
  { label: "All places to visit", href: placesHref.all() },
  ...PLACE_STATES.map((state) => ({ label: `Places in ${state.label}`, href: placesHref.state(state.slug) })),
];

const PLACE_CITIES = [
  { label: "Manali", state: "himachal-pradesh", slug: "manali" },
  { label: "Shimla", state: "himachal-pradesh", slug: "shimla" },
  { label: "Dharamshala", state: "himachal-pradesh", slug: "dharamshala" },
  { label: "Kasol", state: "himachal-pradesh", slug: "kasol" },
  { label: "Shillong", state: "meghalaya", slug: "shillong" },
  { label: "Cherrapunji", state: "meghalaya", slug: "cherrapunji" },
  { label: "Gangtok", state: "sikkim", slug: "gangtok" },
  { label: "Darjeeling", state: "sikkim", slug: "darjeeling" },
  { label: "Udaipur", state: "rajasthan", slug: "udaipur" },
  { label: "Mount Abu", state: "rajasthan", slug: "mount-abu" },
  { label: "Amritsar", state: "punjab", slug: "amritsar" },
  { label: "Dwarka", state: "gujarat", slug: "dwarka" },
];

export const FOOTER_PLACE_CITIES = PLACE_CITIES.map((city) => ({
  label: `Places to visit in ${city.label}`,
  short: city.label,
  href: placesHref.city(city.state, city.slug),
}));

export const FOOTER_COMPANY = [
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Travel Blog", href: "/travel-blog" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "FAQ", href: "/faq" },
];

export const FOOTER_LEGAL = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
  { label: "Cancellation Policy", href: "/cancellation-policy" },
];
