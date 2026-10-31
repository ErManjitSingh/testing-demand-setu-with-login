import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Compass } from "lucide-react";
import { ComingSoonCities, EnquiryButton } from "@/components/places/PlacesClient";
import {
  Band,
  CtaBand,
  DestinationGrid,
  DestinationTile,
  FaqSection,
  FeaturedPlaceCard,
  JsonLd,
  PackagesStrip,
  PlaceCard,
  PlacesHero,
  SectionHeader,
  SideCard,
  TypeBreakdown,
} from "@/components/places/PlacesUi";
import { getStateImage } from "@/components/state/stateImageMap";
import { findState, getPlacesIndex, sortRecommended, toCardPlace } from "@/lib/places/placesData";
import { packagesForPlace } from "@/lib/places/placesPackages";
import {
  breadcrumbItems,
  breadcrumbJsonLd,
  buildPlacesMetadata,
  destinationJsonLd,
  faqJsonLd,
  itemListJsonLd,
  listNames,
  stateFaqs,
  stateIntro,
  typeSummary,
} from "@/lib/places/placesSeo";
import { PLACES_COUNTRY, parseStateSegment, placesHref } from "@/lib/places/placesText";

export const revalidate = 21600;

async function load(country, stateSegment) {
  const { slug, canonical } = parseStateSegment(stateSegment);
  if (country !== PLACES_COUNTRY.slug) return null;
  const index = await getPlacesIndex(); // errors propagate: never cache a transient failure as 404
  const state = findState(index, slug);
  return state ? { state, canonical } : null;
}

export async function generateMetadata({ params }) {
  const { country, state: segment } = await params;
  const hit = await load(country, segment);
  if (!hit) return { title: "Places to visit", robots: { index: false, follow: true } };

  const { state } = hit;
  const cities = state.cities.filter((c) => c.places.length);
  return buildPlacesMetadata({
    title: `Places to Visit in ${state.name} – ${state.placeCount} Tourist Places & Attractions`,
    description: `Top places to visit in ${state.name}: ${listNames(cities, 4)} and more. ${state.placeCount} tourist places with distances, drive times and cab fares.`,
    path: placesHref.state(state.slug),
    image: getStateImage(state.name),
  });
}

export default async function StatePlacesPage({ params }) {
  const { country, state: segment } = await params;
  const hit = await load(country, segment);
  if (!hit) notFound();

  const { state, canonical } = hit;
  if (!canonical) permanentRedirect(placesHref.state(state.slug));

  const cities = state.cities.filter((c) => c.places.length);
  const comingSoon = state.cities.filter((c) => !c.places.length).map((c) => c.name);
  const ranked = cities.flatMap((c) => c.places).sort(sortRecommended);
  const featured = ranked.slice(0, 3).map(toCardPlace);
  const more = ranked.slice(3, 12).map(toCardPlace);
  const crumbs = breadcrumbItems({ state });
  const faqs = stateFaqs(state);
  const packages = packagesForPlace({ stateSlug: state.slug });
  const heroImage = getStateImage(state.name);
  const cityImage = (city) => city.places.find((p) => p.image)?.image ?? heroImage;
  const types = typeSummary(ranked, 3);
  const typeCount = new Set(ranked.map((p) => p.type)).size;

  const enquiry = (
    <EnquiryButton title={`${state.name} trip`} location={state.name} state={state.name} image={heroImage} label="Plan my trip" className="w-full" />
  );

  return (
    <div className="bg-white">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          destinationJsonLd({
            name: state.name,
            description: stateIntro(state),
            path: placesHref.state(state.slug),
            image: heroImage,
            containedIn: "India",
          }),
          itemListJsonLd({
            name: `Destinations in ${state.name}`,
            items: cities.map((c) => ({ name: c.name, href: placesHref.city(state.slug, c.slug) })),
          }),
          faqJsonLd(faqs),
        ]}
      />

      <PlacesHero
        breadcrumbs={crumbs}
        eyebrow="State guide"
        title={`Places to visit in ${state.name}`}
        subtitle={`Explore ${state.placeCount} tourist places across ${cities.length} ${cities.length === 1 ? "destination" : "destinations"} — sightseeing spots, day trips and ready-made tour packages.`}
        image={heroImage}
        stats={[
          { value: state.placeCount, label: "Places to visit" },
          { value: cities.length, label: cities.length === 1 ? "Destination" : "Destinations" },
          { value: typeCount, label: "Place types" },
        ]}
      >
        <EnquiryButton title={`${state.name} trip`} location={state.name} state={state.name} image={heroImage} />
      </PlacesHero>

      <Band tone="white" labelledBy="overview-heading">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <div>
            <SectionHeader eyebrow="Overview" title={`${state.name} travel guide`} id="overview-heading" />
            <div className="mt-5 space-y-4 text-base font-medium leading-relaxed text-stone-600">
              <p>{stateIntro(state)}</p>
              {types.length ? (
                <p>
                  Across {state.name} you will find {types.join(", ")} and more — each place page lists the distance from its city, the approximate drive
                  time and indicative cab fares so you can plan every day.
                </p>
              ) : null}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {cities.slice(0, 8).map((city) => (
                <Link
                  key={city.slug}
                  href={placesHref.city(state.slug, city.slug)}
                  className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-extrabold text-stone-800 transition hover:border-brand hover:bg-brand-muted hover:text-brand"
                >
                  Places to visit in {city.name}
                </Link>
              ))}
            </div>
          </div>

          <SideCard title="What you can see" icon={Compass}>
            <TypeBreakdown places={ranked} />
          </SideCard>
        </div>
      </Band>

      <Band tone="soft" labelledBy="destinations-heading">
        <SectionHeader
          eyebrow="Pick a destination"
          title={`Top destinations in ${state.name}`}
          subtitle="Open a destination to see every place to visit there."
          id="destinations-heading"
        />
        <div className="mt-8">
          <DestinationGrid count={cities.length}>
            {cities.map((city, i) => (
              <DestinationTile
                key={city.slug}
                href={placesHref.city(state.slug, city.slug)}
                title={city.name}
                subtitle={listNames(city.places, 3)}
                image={cityImage(city)}
                fallback={heroImage}
                count={city.places.length}
                featured={cities.length >= 5 && i === 0}
                className={cities.length >= 5 && i === 0 ? "col-span-2 lg:row-span-2" : ""}
              />
            ))}
          </DestinationGrid>
        </div>
      </Band>

      <Band tone="white" labelledBy="popular-heading">
        <SectionHeader
          eyebrow="Most loved"
          title={`Must-visit places in ${state.name}`}
          subtitle="Top-rated spots travellers add to their itinerary first."
          id="popular-heading"
        />
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {featured.map((place, i) => (
            <li key={place.id}>
              <FeaturedPlaceCard place={place} rank={i + 1} priority={i === 0} />
            </li>
          ))}
        </ul>
        {more.length ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((place) => (
              <li key={place.id}>
                <PlaceCard place={place} />
              </li>
            ))}
          </ul>
        ) : null}
      </Band>

      {packages.length ? (
        <Band tone="soft" labelledBy="places-packages">
          <PackagesStrip packages={packages} title={`${state.name} tour packages`} subtitle="Stays, cabs and sightseeing bundled into one easy plan." />
        </Band>
      ) : null}

      {comingSoon.length ? (
        <Band tone="white" labelledBy="more-heading">
          <div className="rounded-[2rem] bg-stone-50 p-6 ring-1 ring-stone-200 sm:p-10">
            <SectionHeader
              eyebrow="Beyond the guide"
              title={`More destinations in ${state.name}`}
              subtitle="Our place guide for these is on the way. Tap one and our team will plan it for you."
              id="more-heading"
            />
            <ComingSoonCities cities={comingSoon.slice(0, 40)} stateName={state.name} />
          </div>
        </Band>
      ) : null}

      <Band tone="soft">
        <FaqSection faqs={faqs} aside={enquiry} />
        <div className="mt-6 lg:hidden">{enquiry}</div>
      </Band>

      <CtaBand
        eyebrow="Ready when you are"
        title={`Let us plan your ${state.name} trip`}
        text="Share your dates and group size and a Demand Setu specialist will build the stay, cab and sightseeing plan — with a clear price."
        image={heroImage}
      >
        <EnquiryButton title={`${state.name} trip`} location={state.name} state={state.name} image={heroImage} variant="light" label="Get a free quote" />
      </CtaBand>
    </div>
  );
}
