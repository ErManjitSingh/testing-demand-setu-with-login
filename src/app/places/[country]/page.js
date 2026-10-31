import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { EnquiryButton } from "@/components/places/PlacesClient";
import {
  Band,
  CtaBand,
  DestinationGrid,
  DestinationTile,
  FaqSection,
  FeaturedPlaceCard,
  JsonLd,
  PlaceCard,
  PlacesHero,
  SectionHeader,
} from "@/components/places/PlacesUi";
import { getStateImage } from "@/components/state/stateImageMap";
import { flattenPlaces, getPlacesIndex, sortRecommended, toCardPlace } from "@/lib/places/placesData";
import { breadcrumbItems, breadcrumbJsonLd, buildPlacesMetadata, faqJsonLd, itemListJsonLd, listNames } from "@/lib/places/placesSeo";
import { PLACES_COUNTRY, placesHref } from "@/lib/places/placesText";

export const revalidate = 21600;

// Render on first request, then cache (ISR).
export function generateStaticParams() {
  return [];
}

async function load(country) {
  if (country !== PLACES_COUNTRY.slug) return null;
  // Errors propagate on purpose: a transient API failure must not be cached as a 404.
  return getPlacesIndex();
}

export async function generateMetadata({ params }) {
  const { country } = await params;
  const index = await load(country);
  if (!index) return { title: "Places to visit", robots: { index: false, follow: true } };

  const total = index.states.reduce((n, s) => n + s.placeCount, 0);
  return buildPlacesMetadata({
    title: "Places to Visit in India – By State",
    description: `Explore ${total} tourist places across ${index.states.length} Indian states — ${listNames(index.states, 4)} and more. Distances, drive times and cab fares included.`,
    path: placesHref.country(),
    image: getStateImage(index.states[0]?.name),
  });
}

export default async function CountryPlacesPage({ params }) {
  const { country } = await params;
  const index = await load(country);
  if (!index) notFound();

  const all = flattenPlaces(index);
  const popular = [...all].sort(sortRecommended).slice(0, 9).map(toCardPlace);
  const crumbs = breadcrumbItems();
  const cityCount = index.states.reduce((n, s) => n + s.cities.filter((c) => c.places.length).length, 0);

  const faqs = [
    {
      q: "Which Indian states can I explore on Demand Setu?",
      a: `Our places guide covers ${listNames(index.states, 6)}${index.states.length > 6 ? " and more" : ""}. Each state page lists its destinations and every place worth visiting.`,
    },
    {
      q: "What does each place page include?",
      a: "Every place shows its location, distance from the nearest city, approximate drive time, indicative cab fares where available, nearby places and ready-made tour packages.",
    },
  ];

  const heroImage = getStateImage(index.states[0]?.name);
  const bento = index.states.length >= 5;
  const featured = popular.slice(0, 3);
  const rest = popular.slice(3);

  return (
    <div className="bg-stone-100">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          itemListJsonLd({ name: "States to visit in India", items: index.states.map((s) => ({ name: s.name, href: placesHref.state(s.slug) })) }),
          faqJsonLd(faqs),
        ]}
      />
      <PlacesHero
        breadcrumbs={crumbs}
        eyebrow="Explore India"
        title="Places to visit in India, state by state"
        subtitle={`${all.length} tourist places across ${cityCount} destinations — pick a state to start planning.`}
        image={heroImage}
        stats={[
          { value: all.length, label: "Places" },
          { value: cityCount, label: "Destinations" },
          { value: index.states.length, label: "States" },
        ]}
      >
        <EnquiryButton title="India trip" location="India" />
      </PlacesHero>

      <Band tone="white" labelledBy="states-heading">
        <SectionHeader eyebrow="Choose a state" title="States to explore" subtitle="Each state lists its destinations and every place worth visiting." id="states-heading" />
        <div className="mt-8">
          <DestinationGrid count={index.states.length}>
            {index.states.map((state, i) => (
              <DestinationTile
                key={state.slug}
                href={placesHref.state(state.slug)}
                title={state.name}
                subtitle={listNames(state.cities.filter((c) => c.places.length), 3)}
                image={getStateImage(state.name)}
                count={state.placeCount}
                featured={bento && i === 0}
                className={bento && i === 0 ? "col-span-2 lg:row-span-2" : ""}
              />
            ))}
          </DestinationGrid>
        </div>
      </Band>

      <Band tone="soft" labelledBy="popular-heading">
        <SectionHeader
          eyebrow="Popular right now"
          title="Top places to visit in India"
          id="popular-heading"
          action={
            <Link
              href={placesHref.all()}
              className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-extrabold text-stone-800 transition hover:border-brand hover:text-brand sm:self-auto"
            >
              See all places <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          }
        />
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {featured.map((place, i) => (
            <li key={place.id}>
              <FeaturedPlaceCard place={place} rank={i + 1} priority={i === 0} />
            </li>
          ))}
        </ul>
        {rest.length ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((place) => (
              <li key={place.id}>
                <PlaceCard place={place} />
              </li>
            ))}
          </ul>
        ) : null}
      </Band>

      <Band tone="white">
        <FaqSection faqs={faqs} />
      </Band>

      <CtaBand
        eyebrow="Ready when you are"
        title="Let us plan your India trip"
        text="Share your dates and group size and a Demand Setu specialist will build the plan."
        image={heroImage}
      >
        <EnquiryButton title="India trip" location="India" variant="light" label="Get a free quote" />
      </CtaBand>
    </div>
  );
}
