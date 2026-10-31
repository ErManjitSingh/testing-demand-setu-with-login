import { Map as MapIcon } from "lucide-react";
import { EnquiryButton, PlacesFilterBar } from "@/components/places/PlacesClient";
import {
  Band,
  CtaBand,
  DestinationGrid,
  DestinationTile,
  FaqSection,
  JsonLd,
  PlaceCard,
  PlacesHero,
  Pagination,
  SectionHeader,
} from "@/components/places/PlacesUi";
import { getStateImage } from "@/components/state/stateImageMap";
import { PAGE_SIZE, buildPlacesQuery, filterPlaces, hasActiveFilters, parsePlacesParams, SORT_OPTIONS } from "@/lib/places/placesFilter";
import { flattenPlaces, getPlacesIndexSafe, sortNearest, sortRecommended, toCardPlace } from "@/lib/places/placesData";
import { breadcrumbItems, breadcrumbJsonLd, buildPlacesMetadata, faqJsonLd, itemListJsonLd, listNames } from "@/lib/places/placesSeo";
import { PLACE_TYPES, PLACE_TYPE_BY_ID, DEFAULT_PLACE_TYPE, placesHref } from "@/lib/places/placesText";

const TITLE = "Places to Visit in India – Tourist Places, Attractions & Sightseeing";
const DESCRIPTION =
  "Discover places to visit across India — temples, lakes, passes, waterfalls, treks and sightseeing spots by state and city, with distances, drive times and cab fares.";

export async function generateMetadata({ searchParams }) {
  const filters = parsePlacesParams(await searchParams);
  const filtered = hasActiveFilters(filters);

  if (filtered) {
    return buildPlacesMetadata({ title: "Search tourist places in India", description: DESCRIPTION, path: placesHref.all(), noindex: true });
  }
  if (filters.page > 1) {
    return buildPlacesMetadata({
      title: `Places to Visit in India – Page ${filters.page}`,
      description: DESCRIPTION,
      path: `${placesHref.all()}${buildPlacesQuery(filters)}`,
    });
  }
  return buildPlacesMetadata({ title: TITLE, description: DESCRIPTION, path: placesHref.all() });
}

export default async function PlacesIndexPage({ searchParams }) {
  const filters = parsePlacesParams(await searchParams);
  const index = await getPlacesIndexSafe();
  const crumbs = breadcrumbItems().slice(0, 2);

  if (!index) {
    return (
      <div className="bg-white">
        <PlacesHero
          breadcrumbs={crumbs}
          eyebrow="Explore India"
          title="Places to visit in India"
          subtitle="Our places guide is taking a short break. Tell us where you want to go and a specialist will plan it for you."
          image={getStateImage("Himachal Pradesh")}
        >
          <EnquiryButton title="India trip" location="India" label="Plan my trip" />
        </PlacesHero>
      </div>
    );
  }

  const all = flattenPlaces(index).sort(sortRecommended).map(toCardPlace);
  const filtered = hasActiveFilters(filters);
  const matched = filterPlaces(all, filters);
  if (filters.sort === "nearest") matched.sort(sortNearest);
  else if (filters.sort === "az") matched.sort((a, b) => a.name.localeCompare(b.name));

  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const visible = matched.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const cityCount = index.states.reduce((n, s) => n + s.cities.filter((c) => c.places.length).length, 0);

  const filterStates = index.states.map((s) => ({
    slug: s.slug,
    name: s.name,
    count: s.placeCount,
    cities: s.cities.filter((c) => c.places.length).map((c) => ({ slug: c.slug, name: c.name, count: c.places.length })),
  }));

  const typeCounts = new Map();
  for (const p of all) typeCounts.set(p.type, (typeCounts.get(p.type) ?? 0) + 1);
  const types = [...PLACE_TYPES, DEFAULT_PLACE_TYPE]
    .filter((t) => typeCounts.has(t.id))
    .map((t) => ({ id: t.id, label: PLACE_TYPE_BY_ID[t.id].label }));

  const topStates = index.states.slice(0, 4).map((s) => s.name);
  const faqs = [
    {
      q: "Which are the best places to visit in India?",
      a: `Our guide covers ${all.length} tourist places across ${index.states.length} Indian states, including ${listNames(all, 5)}. Pick a state to see destinations, then open a city for the full list with distances and drive times.`,
    },
    {
      q: "Which states have the most places listed?",
      a: `${topStates.join(", ")} currently have the most places in our guide. New destinations are added regularly.`,
    },
    {
      q: "Can you plan my trip for me?",
      a: "Yes. Use the Plan this trip button and share your dates, group size and budget. A Demand Setu travel specialist will build the stay, cab and sightseeing plan and call you back.",
    },
  ];

  const hrefFor = (p) => `${placesHref.all()}${buildPlacesQuery(filters, { page: p })}`;
  const showTiles = !filtered && page === 1;
  const sortLabel = SORT_OPTIONS.find((s) => s.id === filters.sort)?.label;

  const heroImage = getStateImage("Himachal Pradesh");
  const bento = index.states.length >= 5;

  return (
    <div className="bg-white">
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          !filtered
            ? itemListJsonLd({
                name: "Places to visit in India",
                items: visible.map((p) => ({ name: p.name, href: placesHref.place(p.stateSlug, p.citySlug, p.slug) })),
              })
            : null,
          !filtered && page === 1 ? faqJsonLd(faqs) : null,
        ]}
      />

      <PlacesHero
        breadcrumbs={crumbs}
        eyebrow="Explore India"
        title="Places to visit in India"
        subtitle={`Browse ${all.length} tourist places across ${cityCount} destinations in ${index.states.length} states — with distances, drive times and cab fares to plan every day.`}
        image={heroImage}
        stats={[
          { value: all.length, label: "Places" },
          { value: cityCount, label: "Destinations" },
          { value: index.states.length, label: "States" },
        ]}
      >
        <EnquiryButton title="India trip" location="India" label="Plan this trip" />
      </PlacesHero>

      {showTiles ? (
        <Band tone="white" labelledBy="by-state">
          <SectionHeader
            eyebrow="Start here"
            title="Browse places by state"
            subtitle="Pick a state to see its destinations, then open a city for every place worth visiting."
            id="by-state"
          />
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
      ) : null}

      <Band tone={showTiles ? "soft" : "white"} labelledBy="all-places-heading" id="all-places">
        <SectionHeader
          eyebrow="Every place"
          title={filtered ? "Search results" : "All places to visit"}
          subtitle={filtered ? undefined : "Search by name, or narrow down by state, city and type."}
          id="all-places-heading"
        />
        <div className="mt-6">
          <PlacesFilterBar filters={filters} states={filterStates} types={types} resultCount={matched.length} />
        </div>

        {visible.length ? (
          <>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label={`Places to visit, sorted ${sortLabel?.toLowerCase()}`}>
              {visible.map((place, i) => (
                <li key={place.id}>
                  <PlaceCard place={place} priority={i < 3 && page === 1} />
                </li>
              ))}
            </ul>
            <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
          </>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
            <MapIcon aria-hidden className="mx-auto h-10 w-10 text-stone-300" />
            <h3 className="mt-3 text-lg font-extrabold text-stone-900">No places match your search</h3>
            <p className="mx-auto mt-1 max-w-md text-sm font-medium text-stone-600">
              Try a different word, or tell us where you want to go and we will plan it for you.
            </p>
            <div className="mt-5 flex justify-center">
              <EnquiryButton title="Custom trip" location={filters.q || "India"} label="Ask our experts" />
            </div>
          </div>
        )}
      </Band>

      {!filtered && page === 1 ? (
        <>
          <Band tone="white">
            <FaqSection faqs={faqs} />
          </Band>
          <CtaBand
            eyebrow="Can't find your place?"
            title="Tell us where you want to go"
            text="We plan trips well beyond this list. Share your dates and group size and get a tailored plan and price."
            image={heroImage}
          >
            <EnquiryButton title="Custom trip" location="India" variant="light" label="Plan this trip" />
          </CtaBand>
        </>
      ) : null}
    </div>
  );
}
