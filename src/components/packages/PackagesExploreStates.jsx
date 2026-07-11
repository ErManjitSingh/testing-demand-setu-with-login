"use client";

import Image from "next/image";
import { useRef } from "react";
import ExploreSectionHeader from "@/components/packages/ExploreSectionHeader";
import { getStateImage } from "@/components/state/stateImageMap";
import {
  formatFromPrice,
  getStartingPrice,
  getStateCities,
  getStateTagline,
} from "@/lib/tourDestinations";

/** ~3 full cards + half of 4th visible in the track viewport */
const STATE_CARD_CLASS =
  "w-[78vw] shrink-0 sm:w-[calc((100%-2.25rem)/3.5)]";

export default function PackagesExploreStates({ states = [], onEnquire }) {
  const trackRef = useRef(null);

  if (states.length === 0) return null;

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const step = el.clientWidth / 3.5;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <section className="border-t border-stone-100 bg-stone-50/60 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ExploreSectionHeader
          scriptLabel="Explore India"
          title="States"
          subtitle="Discover the diversity of India, state by state"
          count={`${states.length} regions`}
          onScrollPrev={() => scroll("left")}
          onScrollNext={() => scroll("right")}
        />

        <div
          ref={trackRef}
          className="no-scrollbar mt-8 flex gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-3"
        >
          {states.map((stateName) => {
            const fromPrice = getStartingPrice(stateName, 4999);
            const cities = getStateCities(stateName);

            return (
              <article key={stateName} className={`group relative ${STATE_CARD_CLASS}`}>
                <button
                  type="button"
                  onClick={() =>
                    onEnquire?.({ state: stateName, country: "India", label: `${stateName} tour` })
                  }
                  className="relative block w-full overflow-hidden
                   rounded-2xl text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={getStateImage(stateName)}
                      alt={stateName}
                      fill
                      loading="lazy"
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width:640px) 78vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/20" />
                    <div className="absolute bottom-0 left-0 top-0 w-1 bg-brand" />

                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                      <span className="mb-1.5 w-fit rounded-full border border-white/25 bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                        India
                      </span>
                      <h3 className="text-lg font-extrabold leading-tight text-white sm:text-xl">
                        {stateName}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-white/85 sm:text-sm">
                        {getStateTagline(stateName)}
                      </p>
                      {cities.length > 0 && (
                        <p className="mt-1.5 hidden text-[10px] text-white/55 sm:block">
                          {cities.slice(0, 3).join(" · ")}
                        </p>
                      )}
                      <p className="mt-2 text-sm font-bold text-brand sm:text-base">
                        From {formatFromPrice(fromPrice)}
                      </p>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
