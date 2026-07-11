"use client";

import Image from "next/image";
import { useMemo, useRef } from "react";
import ExploreSectionHeader from "@/components/packages/ExploreSectionHeader";
import {
  formatFromPrice,
  getCityImage,
  getCityMeta,
  getPopularCities,
} from "@/lib/tourDestinations";

export default function PackagesPopularCities({ cities = [], onEnquire }) {
  const trackRef = useRef(null);
  const displayCities = useMemo(() => getPopularCities(cities, 32), [cities]);

  if (displayCities.length === 0) return null;

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const step = 120;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ExploreSectionHeader
          scriptLabel="Explore India"
          title="Cities"
          subtitle="From metros to hill stations — pick a city and we'll plan the rest"
          count={`${displayCities.length} cities`}
          onScrollPrev={() => scroll("left")}
          onScrollNext={() => scroll("right")}
        />

        <div
          ref={trackRef}
          className="no-scrollbar mt-8 flex gap-2 overflow-x-auto scroll-smooth pb-2 sm:gap-2.5"
        >
          {displayCities.map((cityName) => {
            const meta = getCityMeta(cityName);
            return (
              <button
                key={cityName}
                type="button"
                onClick={() =>
                  onEnquire?.({ city: cityName, country: "India", label: `${cityName} city tour` })
                }
                className="group w-[108px] shrink-0 text-center sm:w-[118px]"
              >
                <div className="mx-auto w-fit rounded-full p-0.5 ring-2 ring-stone-200/90 transition duration-300 group-hover:ring-brand">
                  <div className="relative h-[80px] w-[80px] overflow-hidden rounded-full sm:h-[88px] sm:w-[88px]">
                    <Image
                      src={getCityImage(cityName)}
                      alt={cityName}
                      fill
                      loading="lazy"
                      className="object-cover transition duration-500 group-hover:scale-110"
                      sizes="88px"
                    />
                  </div>
                </div>

                <p className="mt-2 text-[13px] font-bold leading-tight text-stone-900">{cityName}</p>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-stone-500">{meta.tagline}</p>
                <p className="mt-1 text-[11px] font-bold text-brand">
                  From {formatFromPrice(meta.fromPrice)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
