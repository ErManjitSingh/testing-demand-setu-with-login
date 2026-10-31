import { getSiteUrl } from "@/lib/siteConfig";
import {
  PLACE_TYPE_BY_ID,
  PLACES_COUNTRY,
  cabFares,
  formatDuration,
  formatKm,
  formatRupees,
  placeSummary,
  placesHref,
  truncate,
} from "@/lib/places/placesText";

const abs = (path) => `${getSiteUrl()}${path}`;

/** Next.js metadata object shared by every /places page. */
export function buildPlacesMetadata({ title, description, path, image, noindex = false }) {
  const desc = truncate(description, 300);
  return {
    title,
    description: truncate(description, 158),
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      title: `${title} | Demand Setu Tours`,
      description: truncate(desc, 200),
      url: path,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${title} | Demand Setu Tours`,
      description: truncate(desc, 200),
      images: image ? [image] : undefined,
    },
  };
}

export function breadcrumbItems({ state, city, place } = {}) {
  const items = [
    { name: "Home", href: "/" },
    { name: "Places to visit", href: placesHref.all() },
    { name: PLACES_COUNTRY.name, href: placesHref.country() },
  ];
  if (state) items.push({ name: state.name, href: placesHref.state(state.slug) });
  if (city) items.push({ name: city.name, href: placesHref.city(state.slug, city.slug) });
  if (place) items.push({ name: place.name, href: placesHref.place(state.slug, city.slug, place.slug) });
  return items;
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.href),
    })),
  };
}

export function itemListJsonLd({ name, items }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: abs(item.href),
    })),
  };
}

export function destinationJsonLd({ name, description, path, image, containedIn }) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name,
    description: truncate(description, 300),
    url: abs(path),
    image: image || undefined,
    containedInPlace: containedIn ? { "@type": "Place", name: containedIn } : undefined,
  };
}

export function attractionJsonLd({ place, path, image }) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: place.name,
    description: truncate(place.description || placeSummary(place), 500),
    url: abs(path),
    image: place.images?.length ? place.images : image || undefined,
    touristType: PLACE_TYPE_BY_ID[place.type]?.label,
    address: {
      "@type": "PostalAddress",
      addressLocality: place.city,
      addressRegion: place.stateName,
      addressCountry: "IN",
    },
    isPartOf: { "@type": "TouristDestination", name: place.city },
  };
}

export function faqJsonLd(faqs) {
  return {
    "@context": "https://schema.org",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
    "@type": "FAQPage",
  };
}

/* ----------------------- FAQs built only from real data ----------------------- */

export function listNames(places, max = 5) {
  const names = places.slice(0, max).map((p) => p.name);
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

export function cityFaqs(city, places) {
  const faqs = [
    {
      q: `What are the best places to visit in ${city.name}?`,
      a: `Popular places to visit in ${city.name}, ${city.stateName} include ${listNames(places, 6)}. We list ${places.length} places in total, with distance from ${city.name} and approximate drive time where available.`,
    },
  ];

  const near = places.filter((p) => p.distanceKm && p.distanceKm <= 15);
  if (near.length >= 2) {
    faqs.push({
      q: `Which places in ${city.name} can I visit without a long drive?`,
      a: `${listNames(near, 5)} ${near.length === 1 ? "is" : "are"} within about 15 km of ${city.name}, so they fit easily into a half-day plan.`,
    });
  }

  const far = places.filter((p) => p.distanceKm && p.distanceKm > 40).sort((a, b) => a.distanceKm - b.distanceKm);
  if (far.length) {
    faqs.push({
      q: `Which are the day-trip destinations from ${city.name}?`,
      a: `Further out, ${listNames(far, 4)} ${far.length === 1 ? "is" : "are"} usually done as full-day trips by cab. Distances range from ${formatKm(far[0].distanceKm)} to ${formatKm(far.at(-1).distanceKm)} from ${city.name}.`,
    });
  }

  faqs.push({
    q: `How can I plan a trip to ${city.name} with Demand Setu?`,
    a: `Share your dates and group size and a travel specialist will build the stay, cab and sightseeing plan for ${city.name}, or you can browse our ready-made tour packages for ${city.stateName}.`,
  });
  return faqs;
}

export function placeFaqs(place, nearby = []) {
  const faqs = [];
  const km = formatKm(place.distanceKm);
  const dur = formatDuration(place.minutes);

  if (km) {
    faqs.push({
      q: `How far is ${place.name} from ${place.city}?`,
      a: `${place.name} is about ${km} from ${place.city}${dur ? `, which takes roughly ${dur} by road` : ""}. Travel time can vary with traffic and weather, especially on mountain roads.`,
    });
  }

  const fares = cabFares(place.cost);
  if (fares.length) {
    faqs.push({
      q: `What is the cab fare to ${place.name} from ${place.city}?`,
      a: `Indicative private cab fares to ${place.name} from ${place.city}: ${fares.map((f) => `${f.label} ${formatRupees(f.amount)}`).join(", ")}. Final rates are confirmed when you book.`,
    });
  }

  faqs.push({
    q: `Where is ${place.name} located?`,
    a: `${place.name} is in ${place.city}, ${place.stateName}, ${place.country}.`,
  });

  if (nearby.length) {
    faqs.push({
      q: `What else can I visit near ${place.name}?`,
      a: `Other places to visit in ${place.city} include ${listNames(nearby, 5)}.`,
    });
  }
  return faqs;
}

export function stateFaqs(state) {
  const topCities = state.cities.filter((c) => c.places.length);
  return [
    {
      q: `Which are the best places to visit in ${state.name}?`,
      a: `Our guide covers ${state.placeCount} places across ${topCities.length} ${topCities.length === 1 ? "destination" : "destinations"} in ${state.name}, including ${listNames(
        topCities.flatMap((c) => c.places.slice(0, 2)),
        6
      )}.`,
    },
    {
      q: `Which cities should I cover on a ${state.name} trip?`,
      a: `The most place-rich destinations in ${state.name} are ${listNames(topCities, 5)}.`,
    },
    {
      q: `Can Demand Setu plan my ${state.name} trip?`,
      a: `Yes. Tell us your dates, group size and budget and a travel specialist will plan hotels, cabs and sightseeing in ${state.name}, or you can pick one of our ready tour packages.`,
    },
  ];
}

/* ------------------------------- intro copy ------------------------------- */

export function typeSummary(places, max = 4) {
  const counts = new Map();
  for (const p of places) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([id, n]) => `${n} ${(PLACE_TYPE_BY_ID[id]?.label ?? "sightseeing spots").toLowerCase()}`);
}

function joinList(items) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

export function cityIntro(city, places) {
  const far = places.filter((p) => p.distanceKm).sort((a, b) => b.distanceKm - a.distanceKm)[0];
  const types = typeSummary(places);
  const parts = [
    `Planning a trip to ${city.name}, ${city.stateName}? We have listed ${places.length} places to visit in ${city.name}, from ${listNames(places, 3)} to day-trip destinations further out.`,
  ];
  if (types.length) parts.push(`The list includes ${joinList(types)}.`);
  if (far?.distanceKm > 40 && far.distanceKm <= 200) {
    parts.push(`The farthest spot, ${far.name}, is about ${formatKm(far.distanceKm)} from ${city.name}, so plan it as a full-day excursion.`);
  }
  parts.push("Each place shows its distance from the city and, where available, approximate drive time and cab fares.");
  return parts.join(" ");
}

export function stateIntro(state) {
  const cities = state.cities.filter((c) => c.places.length);
  return `Explore ${state.placeCount} tourist places across ${cities.length} ${cities.length === 1 ? "destination" : "destinations"} in ${state.name}. Start with ${listNames(cities, 4)}, then browse sightseeing spots, day trips and ready-made ${state.name} tour packages.`;
}
