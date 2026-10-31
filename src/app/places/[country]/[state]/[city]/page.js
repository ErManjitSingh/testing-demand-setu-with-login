import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, Compass, MapPin, MessageCircle } from "lucide-react";
import { CityPlacesGrid, EnquiryButton } from "@/components/places/PlacesClient";
import {
  Band,
  CtaBand,
  FaqSection,
  JsonLd,
  PackagesStrip,
  PlacesHero,
  SectionHeader,
  SideCard,
  TypeBreakdown,
} from "@/components/places/PlacesUi";
import { getStateImage } from "@/components/state/stateImageMap";
import { findCity, getPlacesIndex, sortRecommended, toCardPlace } from "@/lib/places/placesData";
import { packagesForPlace } from "@/lib/places/placesPackages";
import {
  breadcrumbItems,
  breadcrumbJsonLd,
  buildPlacesMetadata,
  cityFaqs,
  cityIntro,
  destinationJsonLd,
  faqJsonLd,
  itemListJsonLd,
  listNames,
} from "@/lib/places/placesSeo";
import { PLACES_COUNTRY, parseStateSegment, placesHref } from "@/lib/places/placesText";

export const revalidate = 21600;

async function load(country, stateSegment, citySlug) {
  const { slug, canonical } = parseStateSegment(stateSegment);
  if (country !== PLACES_COUNTRY.slug) return null;
  const index = await getPlacesIndex(); // errors propagate: never cache a transient failure as 404
  const hit = findCity(index, slug, citySlug);
  return hit ? { ...hit, canonical } : null;
}

export async function generateMetadata({ params }) {
  const { country, state: segment, city: citySlug } = await params;
  const hit = await load(country, segment, citySlug);
  if (!hit) return { title: "Places to visit", robots: { index: false, follow: true } };

  const { state, city } = hit;
  const places = [...city.places].sort(sortRecommended);
  return buildPlacesMetadata({
    title: `Places to Visit in ${city.name} – ${places.length} Tourist Places & Sightseeing`,
    description: `Best places to visit in ${city.name}, ${state.name}: ${listNames(places, 5)} and more. Distances, drive times and cab fares for every spot.`,
    path: placesHref.city(state.slug, city.slug),
    image: places.find((p) => p.image)?.image ?? getStateImage(state.name),
  });
}

export default async function CityPlacesPage({ params }) {
  const { country, state: segment, city: citySlug } = await params;
  const hit = await load(country, segment, citySlug);
  if (!hit) notFound();

  const { state, city, canonical } = hit;
  if (!canonical) permanentRedirect(placesHref.city(state.slug, city.slug));

  const places = [...city.places].sort(sortRecommended);
  const cards = places.map(toCardPlace);
  const crumbs = breadcrumbItems({ state, city });
  const faqs = cityFaqs(city, places);
  const packages = packagesForPlace({ stateSlug: state.slug, cityName: city.name });
  const heroImage = places.find((p) => p.image)?.image ?? getStateImage(state.name);
  const nearCount = places.filter((p) => p.distanceKm && p.distanceKm <= 15).length;
  const typeCount = new Set(places.map((p) => p.type)).size;
  const otherCities = state.cities.filter((c) => c.slug !== city.slug && c.places.length).slice(0, 8);
  const intro = cityIntro(city, places);

  const stats = [
    { value: places.length, label: "Places to visit" },
    { value: typeCount, label: "Place types" },
    ...(nearCount ? [{ value: nearCount, label: "Within 15 km" }] : []),
  ];

  const enquiryProps = { title: `${city.name} trip`, location: `${city.name}, ${state.name}`, state: state.name, city: city.name, image: heroImage };

  return (
    <div className="bg-white">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          destinationJsonLd({
            name: city.name,
            description: intro,
            path: placesHref.city(state.slug, city.slug),
            image: heroImage,
            containedIn: state.name,
          }),
          itemListJsonLd({
            name: `Places to visit in ${city.name}`,
            items: places.map((p) => ({ name: p.name, href: placesHref.place(state.slug, city.slug, p.slug) })),
          }),
          faqJsonLd(faqs),
        ]}
      />

      <PlacesHero
        breadcrumbs={crumbs}
        eyebrow={`${state.name}, India`}
        title={`Places to visit in ${city.name}`}
        subtitle={`${places.length} sightseeing spots in ${city.name}, including ${listNames(places, 3)} — with distances, drive times and cab fares.`}
        image={heroImage}
        stats={stats}
      >
        <EnquiryButton {...enquiryProps} />
      </PlacesHero>

      <Band tone="white" labelledBy="list-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="min-w-0">
            <SectionHeader eyebrow="Sightseeing" title={`${places.length} places to visit in ${city.name}`} id="list-heading" />
            <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-stone-600">{intro}</p>
            <div className="mt-8">
              <CityPlacesGrid places={cards} cityName={city.name} gridClassName="sm:grid-cols-2" />
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            <div className="relative isolate overflow-hidden rounded-3xl bg-stone-950 p-6 text-white">
              <div aria-hidden className="absolute -right-10 -top-12 -z-10 h-44 w-44 rounded-full bg-brand/45 blur-3xl" />
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-orange-200">
                <MessageCircle aria-hidden className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-xl font-extrabold leading-snug">Plan your {city.name} trip</h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">
                Tell us your dates and group size. We arrange the stay, cab and sightseeing — you get a clear price.
              </p>
              <EnquiryButton {...enquiryProps} label="Get a free quote" className="mt-5 w-full" />
            </div>

            <SideCard title="What you can see" icon={Compass}>
              <TypeBreakdown places={places} />
            </SideCard>

            {otherCities.length ? (
              <SideCard title={`More in ${state.name}`} icon={MapPin}>
                <ul className="-my-1 divide-y divide-stone-100">
                  {otherCities.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={placesHref.city(state.slug, c.slug)}
                        className="group flex items-center justify-between gap-3 py-3 text-sm font-bold text-stone-800 transition hover:text-brand"
                      >
                        <span className="truncate">Places to visit in {c.name}</span>
                        <span className="flex shrink-0 items-center gap-2 text-xs text-stone-500">
                          {c.places.length}
                          <ArrowRight aria-hidden className="h-4 w-4 text-stone-400 transition group-hover:translate-x-0.5 group-hover:text-brand" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={placesHref.state(state.slug)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-brand hover:text-brand-dark"
                >
                  All of {state.name} <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </SideCard>
            ) : null}
          </aside>
        </div>
      </Band>

      {packages.length ? (
        <Band tone="soft" labelledBy="places-packages">
          <PackagesStrip packages={packages} title={`${city.name} tour packages`} subtitle="Hotels, cabs and sightseeing in one plan — customise it your way." />
        </Band>
      ) : null}

      <Band tone={packages.length ? "white" : "soft"}>
        <FaqSection faqs={faqs} title={`${city.name} travel questions`} />
      </Band>

      <CtaBand
        eyebrow="Ready when you are"
        title={`Let us plan your ${city.name} trip`}
        text="Share your dates and group size and a Demand Setu specialist will build the stay, cab and sightseeing plan."
        image={heroImage}
      >
        <EnquiryButton {...enquiryProps} variant="light" label="Get a free quote" />
      </CtaBand>
    </div>
  );
}
