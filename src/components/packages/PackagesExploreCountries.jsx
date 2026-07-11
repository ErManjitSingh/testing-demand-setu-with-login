"use client";

import Image from "next/image";
import { useRef } from "react";
import ExploreSectionHeader, { PinIcon } from "@/components/packages/ExploreSectionHeader";
import {
  formatFromPrice,
  getInternationalCountries,
  STATIC_SEARCH_COUNTRIES,
} from "@/lib/tourDestinations";

const TRUST_ITEMS = [
  { icon: "🌍", label: `${STATIC_SEARCH_COUNTRIES.length}+ Countries` },
  { icon: "💰", label: "Best Price Guarantee" },
  { icon: "📋", label: "Visa Assistance" },
  { icon: "🕐", label: "24/7 Support" },
  { icon: "💳", label: "Easy EMI Options" },
];

/** Structure A — tall portrait cards in a horizontal filmstrip */
export default function PackagesExploreCountries({ onEnquire }) {
  const trackRef = useRef(null);
  const countries = getInternationalCountries();

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ExploreSectionHeader
          scriptLabel="Explore"
          title="Countries"
          subtitle="International destinations beyond India"
          icon="✈️"
          count={`${countries.length} tours`}
          onScrollPrev={() => scroll("left")}
          onScrollNext={() => scroll("right")}
        />

        <div
          ref={trackRef}
          className="no-scrollbar mt-8 flex gap-5 overflow-x-auto scroll-smooth pb-2 pt-1"
        >
            {countries.map((country) => (
              <article key={country.name} className="group w-[210px] shrink-0 sm:w-[240px]">
                <button
                  type="button"
                  onClick={() =>
                    onEnquire?.({
                      country: country.name,
                      label: `${country.name} international tour`,
                    })
                  }
                  className="block w-full text-left"
                >
                  <div className="relative aspect-[3/5] overflow-hidden rounded-[1.85rem] shadow-lg ring-1 ring-stone-900/5 transition group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-brand/25">
                    <Image
                      src={country.image}
                      alt={country.name}
                      fill
                      loading="lazy"
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="240px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                    {country.featured && (
                      <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                        Popular
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <PinIcon className="mb-2 h-5 w-5 text-brand" />
                      <h3 className="text-lg font-bold leading-tight">{country.name}</h3>
                      <p className="mt-1 text-xs leading-snug text-white/80">{country.tagline}</p>
                      <p className="mt-2 text-sm font-bold text-brand">
                        From {formatFromPrice(country.fromPrice)}
                      </p>
                    </div>
                  </div>
                </button>
              </article>
            ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-xl border border-stone-100 bg-stone-50 px-3 py-3 text-[11px] font-semibold text-stone-600 sm:text-xs"
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
