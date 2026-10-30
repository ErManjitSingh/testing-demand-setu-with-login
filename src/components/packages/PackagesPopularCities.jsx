"use client";

import Image from "next/image";
import Link from "next/link";
import { buildListingHref } from "@/lib/packageBooking";
import { useMemo } from "react";
import ExploreSectionHeader from "@/components/packages/ExploreSectionHeader";
import { sliderRowClass, useSnapScroll } from "@/components/packages/useSnapScroll";
import {
  formatFromPrice,
  getCityImage,
  getCityMeta,
  getPopularCities,
} from "@/lib/tourDestinations";
import { limitItems } from "@/lib/limitItems";

export default function PackagesPopularCities({ cities = [], config = null }) {
  const { scrollerRef, scrollPrev, scrollNext } = useSnapScroll();

  // Admin-managed cities when available, otherwise the built-in popular list
  const displayCities = useMemo(
    () =>
      config?.items?.length
        ? limitItems(config.items, config.maxVisible)
        : getPopularCities(cities, 8).map((name) => ({ name })),
    [cities, config]
  );

  if (displayCities.length === 0) return null;

  return (
    <section className="bg-white py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ExploreSectionHeader
          scriptLabel="Explore India"
          title={config?.title || "Cities"}
          subtitle="From metros to hill stations — pick a city and we'll plan the rest"
          count={`${displayCities.length} cities`}
          onScrollPrev={scrollPrev}
          onScrollNext={scrollNext}
          scrollOnDesktop
        />

        <div ref={scrollerRef} className={sliderRowClass}>
          {displayCities.map((entry) => {
            const cityName = entry.name;
            const builtIn = getCityMeta(cityName);
            const meta = {
              tagline: entry.tagline || builtIn.tagline,
              fromPrice: entry.fromPrice ?? builtIn.fromPrice,
            };
            return (
              <Link
                key={cityName}
                data-snap-card
                href={buildListingHref({ q: cityName })}
                aria-label={`${cityName} tour packages`}
                className="group w-[196px] shrink-0 snap-start text-center"
              >
                <span className="relative mx-auto block aspect-square w-full overflow-hidden rounded-full shadow-md ring-4 ring-white transition duration-500 group-hover:-translate-y-1 group-hover:ring-brand group-hover:shadow-xl">
                  <Image
                    src={entry.image || getCityImage(cityName)}
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
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
