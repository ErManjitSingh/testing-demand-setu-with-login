"use client";

import Image from "next/image";
import { useMemo } from "react";
import ExploreSectionHeader from "@/components/packages/ExploreSectionHeader";
import { sliderRowClass, useSnapScroll } from "@/components/packages/useSnapScroll";
import {
  formatFromPrice,
  getCityImage,
  getCityMeta,
  getPopularCities,
} from "@/lib/tourDestinations";

export default function PackagesPopularCities({ cities = [], onEnquire }) {
  const { scrollerRef, scrollPrev, scrollNext } = useSnapScroll();
  const displayCities = useMemo(() => getPopularCities(cities, 8), [cities]);

  if (displayCities.length === 0) return null;

  return (
    <section className="bg-[#f3ece4] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ExploreSectionHeader
          scriptLabel="Explore India"
          title="Cities"
          subtitle="From metros to hill stations — pick a city and we'll plan the rest"
          count={`${displayCities.length} cities`}
          onScrollPrev={scrollPrev}
          onScrollNext={scrollNext}
          scrollOnDesktop
        />

        <div ref={scrollerRef} className={sliderRowClass}>
          {displayCities.map((cityName) => {
            const meta = getCityMeta(cityName);
            return (
              <button
                key={cityName}
                data-snap-card
                type="button"
                onClick={() =>
                  onEnquire?.({ city: cityName, country: "India", label: `${cityName} city tour` })
                }
                className="group w-[196px] shrink-0 snap-start text-center"
              >
                <span className="relative mx-auto block aspect-square w-full overflow-hidden rounded-full shadow-md ring-4 ring-white transition duration-500 group-hover:-translate-y-1 group-hover:ring-brand group-hover:shadow-xl">
                  <Image
                    src={getCityImage(cityName)}
                    alt={cityName}
                    fill
                    loading="lazy"
                    className="object-cover transition duration-700 group-hover:scale-110"
                    sizes="150px"
                  />
                </span>
                <span className="mt-4 block font-serif text-lg font-medium text-stone-950">{cityName}</span>
                <span className="mt-0.5 block line-clamp-1 text-[11px] text-stone-500">{meta.tagline}</span>
                <span className="mt-1 block text-xs font-semibold text-brand">
                  {formatFromPrice(meta.fromPrice)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
