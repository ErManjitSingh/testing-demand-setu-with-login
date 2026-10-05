"use client";

import Image from "next/image";
import Link from "next/link";
import { buildListingHref } from "@/lib/packageBooking";
import ExploreSectionHeader from "@/components/packages/ExploreSectionHeader";
import { snapRowClass, useSnapScroll } from "@/components/packages/useSnapScroll";
import {
  formatFromPrice,
  getInternationalCountries,
  STATIC_SEARCH_COUNTRIES,
} from "@/lib/tourDestinations";

const TRUST_ITEMS = [
  `${STATIC_SEARCH_COUNTRIES.length}+ Countries`,
  "Best Price Guarantee",
  "Visa Assistance",
  "24/7 Support",
  "Easy EMI Options",
];

export default function PackagesExploreCountries() {
  const { scrollerRef, scrollPrev, scrollNext } = useSnapScroll();
  const all = getInternationalCountries();
  const countries = [...all.filter((c) => c.featured), ...all.filter((c) => !c.featured)].slice(0, 8);

  return (
    <section className="bg-white py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ExploreSectionHeader
          scriptLabel="Explore"
          title="Countries"
          subtitle="International destinations beyond India"
          count={`${countries.length} countries`}
          onScrollPrev={scrollPrev}
          onScrollNext={scrollNext}
        />

        <div ref={scrollerRef} className={`${snapRowClass} lg:grid-cols-4`}>
          {countries.map((country) => (
            <div key={country.name} data-snap-card className="w-[calc(100vw-3.25rem)] shrink-0 snap-start sm:w-[250px] lg:w-auto">
              <CountryCard country={country} />
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST_ITEMS.map((label) => (
            <div
              key={label}
              className="rounded-2xl border border-orange-100 bg-white px-4 py-4 text-sm font-semibold text-stone-800 shadow-sm"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountryCard({ country }) {
  return (
    <article>
      <Link
        href={buildListingHref({ q: country.name })}
        aria-label={`${country.name} tour packages`}
        className="group relative block h-full w-full overflow-hidden rounded-2xl text-left shadow-sm ring-1 ring-black/5 transition duration-500 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="relative aspect-[4/5]">
          <Image
            src={country.image}
            alt={country.name}
            fill
            loading="lazy"
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width:640px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />
          {country.featured && (
            <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-950">
              Popular
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <h3 className="font-serif text-[1.65rem] font-medium leading-none">{country.name}</h3>
            <div className="mt-3 flex items-end justify-between gap-2">
              <p className="line-clamp-2 text-xs leading-snug text-white/80">{country.tagline}</p>
              <p className="shrink-0 text-sm font-semibold text-orange-200">
                {formatFromPrice(country.fromPrice)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
