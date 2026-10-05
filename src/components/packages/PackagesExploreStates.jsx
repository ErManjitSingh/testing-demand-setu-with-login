"use client";

import Image from "next/image";
import Link from "next/link";
import { buildListingHref } from "@/lib/packageBooking";
import ExploreSectionHeader from "@/components/packages/ExploreSectionHeader";
import { snapRowClass, useSnapScroll } from "@/components/packages/useSnapScroll";
import { getStateImage } from "@/components/state/stateImageMap";
import {
  formatFromPrice,
  getStartingPrice,
  getStateCities,
  getStateTagline,
} from "@/lib/tourDestinations";

const STATE_ORDER = [
  "Rajasthan",
  "Kerala",
  "Himachal Pradesh",
  "Ladakh",
  "Goa",
  "Jammu & Kashmir",
  "Uttarakhand",
  "Sikkim",
  "Delhi",
  "Karnataka",
  "Maharashtra",
  "Gujarat",
  "Tamil Nadu",
  "West Bengal",
  "Uttar Pradesh",
  "Assam",
];

function pickStates(states, limit = 5) {
  const byKey = new Map(states.map((name) => [name.toLowerCase(), name]));
  const picked = [];
  for (const name of STATE_ORDER) {
    const hit = byKey.get(name.toLowerCase());
    if (hit) picked.push(hit);
  }
  for (const name of states) {
    if (picked.length >= limit) break;
    if (!picked.includes(name)) picked.push(name);
  }
  return picked.slice(0, limit);
}

export default function PackagesExploreStates({ states = [] }) {
  const { scrollerRef, scrollPrev, scrollNext } = useSnapScroll();
  const shown = pickStates(states, 8);
  if (shown.length === 0) return null;

  return (
    <section className="bg-white py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ExploreSectionHeader
          scriptLabel="Explore India"
          title="States"
          subtitle="Discover the diversity of India, state by state"
          count={`${shown.length} states`}
          onScrollPrev={scrollPrev}
          onScrollNext={scrollNext}
        />

        <div ref={scrollerRef} className={`${snapRowClass} lg:auto-rows-[188px] lg:grid-cols-12 lg:gap-3`}>
          {shown.map((stateName, index) => {
            const fromPrice = getStartingPrice(stateName, 4999);
            const cities = getStateCities(stateName);
            const feature = index === 0;
            const place = [
              "lg:col-span-8 lg:row-span-2",
              "lg:col-span-4",
              "lg:col-span-4",
              "lg:col-span-3",
              "lg:col-span-3",
              "lg:col-span-6",
              "lg:col-span-6",
              "lg:col-span-6",
            ][index];

            return (
              <Link
                key={stateName}
                data-snap-card
                href={buildListingHref({ q: stateName })}
                aria-label={`${stateName} tour packages`}
                className={`group relative w-[calc(100vw-3.25rem)] shrink-0 snap-start overflow-hidden rounded-2xl text-left shadow-sm ring-1 ring-black/5 transition duration-500 hover:-translate-y-1 hover:shadow-xl sm:w-[280px] lg:h-full lg:w-auto ${place || ""}`}
              >
                <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full">
                  <Image
                    src={getStateImage(stateName)}
                    alt={stateName}
                    fill
                    loading="lazy"
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="320px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className={`font-serif font-medium leading-none ${feature ? "text-4xl sm:text-5xl" : "text-2xl"}`}>
                      {stateName}
                    </h3>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <p className="line-clamp-2 text-xs leading-snug text-white/80">
                        {cities.length > 0 ? cities.slice(0, 2).join(" · ") : getStateTagline(stateName)}
                      </p>
                      <p className="shrink-0 text-sm font-semibold text-orange-200">
                        {formatFromPrice(fromPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
