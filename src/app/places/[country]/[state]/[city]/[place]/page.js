import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, Car, Clock, MapPin, MessageCircle, Route, Tag } from "lucide-react";
import { EnquiryButton } from "@/components/places/PlacesClient";
import {
  Band,
  CtaBand,
  FaqSection,
  JsonLd,
  PackagesStrip,
  PlaceCard,
  PlacesHero,
  SectionHeader,
  SideCard,
  placeImage,
} from "@/components/places/PlacesUi";
import { findPlace, getPlacesIndex, sortRecommended, toCardPlace } from "@/lib/places/placesData";
import { packagesForPlace } from "@/lib/places/placesPackages";
import {
  attractionJsonLd,
  breadcrumbItems,
  breadcrumbJsonLd,
  buildPlacesMetadata,
  faqJsonLd,
  placeFaqs,
} from "@/lib/places/placesSeo";
import {
  PLACES_COUNTRY,
  PLACE_TYPE_BY_ID,
  cabFares,
  cleanText,
  formatDuration,
  formatKm,
  formatRupees,
  isThinPlace,
  parseStateSegment,
  placeSummary,
  placesHref,
} from "@/lib/places/placesText";

export const revalidate = 21600;

// Render on first request, then cache (ISR).
export function generateStaticParams() {
  return [];
}

async function load(country, stateSegment, citySlug, placeSlug) {
  const { slug, canonical } = parseStateSegment(stateSegment);
  if (country !== PLACES_COUNTRY.slug) return null;
  const index = await getPlacesIndex(); // errors propagate: never cache a transient failure as 404
  const hit = findPlace(index, slug, citySlug, placeSlug);
  return hit ? { ...hit, canonical } : null;
}

/** First full sentence of the backend description (avoids a mid-sentence cut in the meta description). */
function firstSentence(text) {
  const t = cleanText(text);
  const m = t.match(/^.{20,}?[.!?](?=\s|$)/);
  return m ? m[0] : t;
}

export async function generateMetadata({ params }) {
  const { country, state: s, city: c, place: p } = await params;
  const hit = await load(country, s, c, p);
  if (!hit) return { title: "Place not found", robots: { index: false, follow: true } };

  const { state, city, place } = hit;
  return buildPlacesMetadata({
    title: `${place.name}, ${city.name} – Travel Guide`,
    description: `${placeSummary(place)} ${firstSentence(place.description)}`.trim(),
    path: placesHref.place(state.slug, city.slug, place.slug),
    image: placeImage(place),
    noindex: isThinPlace(place),
  });
}

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{label}</dt>
        <dd className="mt-0.5 text-sm font-extrabold text-stone-900">{value}</dd>
      </div>
    </div>
  );
}

export default async function PlaceDetailPage({ params }) {
  const { country, state: s, city: c, place: p } = await params;
  const hit = await load(country, s, c, p);
  if (!hit) notFound();

  const { state, city, place, canonical } = hit;
  const path = placesHref.place(state.slug, city.slug, place.slug);
  if (!canonical) permanentRedirect(path);

  const crumbs = breadcrumbItems({ state, city, place });
  const nearby = city.places
    .filter((x) => x.id !== place.id)
    .sort(sortRecommended)
    .slice(0, 6);
  const faqs = placeFaqs(place, nearby);
  const fares = cabFares(place.cost);
  const km = formatKm(place.distanceKm);
  const dur = formatDuration(place.minutes);
  const typeLabel = PLACE_TYPE_BY_ID[place.type]?.label;
  const packages = packagesForPlace({ stateSlug: state.slug, cityName: city.name, limit: 4 });
  const heroImage = placeImage(place);
  const about = place.description || placeSummary(place);
  const extraImages = place.images.slice(1, 5);

  const stats = [
    km ? { value: km, label: `From ${city.name}` } : null,
    dur ? { value: dur, label: "Drive time" } : null,
    typeLabel ? { value: typeLabel, label: "Category" } : null,
    fares.length ? { value: formatRupees(Math.min(...fares.map((f) => f.amount))), label: "Cab from" } : null,
  ].filter(Boolean);

  const enquiryProps = {
    title: `${place.name} trip`,
    location: `${place.name}, ${city.name}`,
    state: state.name,
    city: city.name,
    image: heroImage,
  };

  return (
    <div className="bg-stone-100">
      <JsonLd data={[breadcrumbJsonLd(crumbs), attractionJsonLd({ place, path, image: heroImage }), faqJsonLd(faqs)]} />

      <PlacesHero
        breadcrumbs={crumbs}
        eyebrow={`${city.name}, ${state.name}`}
        title={place.name}
        subtitle={placeSummary(place)}
        image={heroImage}
        stats={stats}
      >
        <EnquiryButton {...enquiryProps} label="Plan a trip here" />
      </PlacesHero>

      <Band tone="white" labelledBy="about-heading">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="min-w-0 space-y-12">
            <div>
              <SectionHeader eyebrow="About" title={`About ${place.name}`} id="about-heading" />
              <p className="mt-5 whitespace-pre-line text-base font-medium leading-relaxed text-stone-600 sm:text-lg sm:leading-relaxed">{about}</p>

              {km ? (
                <div className="mt-6 flex gap-4 rounded-2xl bg-brand-muted/70 p-4 ring-1 ring-brand/15 sm:p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">
                    <Route aria-hidden className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-stone-700 sm:text-base">
                    <strong className="font-extrabold text-stone-900">How to reach:</strong> {place.name} is about {km} from {city.name}
                    {dur ? `, roughly ${dur} by road` : ""}. Most visitors hire a private cab from {city.name}, which lets you stop at viewpoints on the way.
                  </p>
                </div>
              ) : null}
            </div>

            {extraImages.length ? (
              <section aria-label={`${place.name} photos`}>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {extraImages.map((src, i) => (
                    <li key={src} className="relative aspect-square overflow-hidden rounded-2xl bg-stone-200">
                      <Image src={src} alt={`${place.name} photo ${i + 2}`} fill sizes="(min-width:640px) 200px, 45vw" className="object-cover" />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {fares.length ? (
              <section aria-labelledby="fares-heading">
                <h2 id="fares-heading" className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-muted text-brand">
                    <Car aria-hidden className="h-5 w-5" />
                  </span>
                  Cab fare from {city.name}
                </h2>
                <p className="mt-2 text-sm font-medium text-stone-600">Indicative private cab rates to {place.name}. Final price is confirmed when you book.</p>
                <div className="mt-5 overflow-hidden rounded-2xl ring-1 ring-stone-200">
                  <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                      Cab fares from {city.name} to {place.name}
                    </caption>
                    <thead className="bg-stone-900 text-xs font-bold uppercase tracking-wider text-white">
                      <tr>
                        <th scope="col" className="px-4 py-3 sm:px-6">
                          Vehicle
                        </th>
                        <th scope="col" className="px-4 py-3 text-right sm:px-6">
                          Approx. fare
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {fares.map((f) => (
                        <tr key={f.key}>
                          <th scope="row" className="px-4 py-3.5 font-bold text-stone-800 sm:px-6">
                            {f.label}
                          </th>
                          <td className="px-4 py-3.5 text-right text-base font-extrabold text-brand sm:px-6">{formatRupees(f.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            <SideCard title="Quick facts" icon={Tag}>
              <dl className="space-y-4">
                <Fact icon={MapPin} label="Location" value={`${city.name}, ${state.name}`} />
                {km ? <Fact icon={Route} label={`Distance from ${city.name}`} value={km} /> : null}
                {dur ? <Fact icon={Clock} label="Approx. drive time" value={dur} /> : null}
                {typeLabel ? <Fact icon={Tag} label="Category" value={typeLabel} /> : null}
              </dl>
            </SideCard>

            <div className="relative isolate overflow-hidden rounded-2xl bg-stone-950 p-6 text-white">
              <div aria-hidden className="absolute -right-10 -top-12 -z-10 h-44 w-44 rounded-full bg-brand/45 blur-3xl" />
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-orange-200">
                <MessageCircle aria-hidden className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-xl font-extrabold leading-snug">Visit {place.name}</h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">Get a free quote with cab, stay and sightseeing sorted for you.</p>
              <EnquiryButton {...enquiryProps} label="Get a free quote" className="mt-5 w-full" />
              <p className="mt-3 text-center text-xs font-medium text-white/50">Free itinerary changes · 24/7 trip support</p>
            </div>
          </aside>
        </div>
      </Band>

      {nearby.length ? (
        <Band tone="soft" labelledBy="nearby-heading">
          <SectionHeader
            eyebrow="Nearby"
            title={`More places to visit in ${city.name}`}
            id="nearby-heading"
            action={
              <Link
                href={placesHref.city(state.slug, city.slug)}
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-extrabold text-stone-800 transition hover:border-brand hover:text-brand sm:self-auto"
              >
                All {city.places.length} places <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            }
          />
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {nearby.map((x) => (
              <li key={x.id}>
                <PlaceCard place={toCardPlace(x)} showCity={false} />
              </li>
            ))}
          </ul>
        </Band>
      ) : null}

      {packages.length ? (
        <Band tone="white" labelledBy="places-packages">
          <PackagesStrip packages={packages} title={`${city.name} tour packages`} subtitle="Stays, cabs and sightseeing — all in one plan." />
        </Band>
      ) : null}

      <Band tone={packages.length ? "soft" : "white"}>
        <FaqSection faqs={faqs} title={`${place.name} — FAQs`} />
      </Band>

      <CtaBand
        eyebrow="Ready when you are"
        title={`Plan your visit to ${place.name}`}
        text="Share your dates and group size and a Demand Setu specialist will arrange everything."
        image={heroImage}
      >
        <EnquiryButton {...enquiryProps} variant="light" label="Get a free quote" />
      </CtaBand>
    </div>
  );
}
