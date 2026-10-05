"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import AnimateIn from "@/components/packages/AnimateIn";
import { snapRowClass, useSnapScroll } from "@/components/packages/useSnapScroll";
import {
  filterPackages,
  formatPackagePrice,
  getAllPackages,
  getPackageCategories,
  getPackageImage,
} from "@/lib/tourPackages";

export default function AllPackagesCatalog({ onViewDetails }) {
  const [category, setCategory] = useState("All");
  const { scrollerRef, scrollPrev, scrollNext } = useSnapScroll();
  const allPackages = getAllPackages();
  const categories = getPackageCategories();

  const filtered = useMemo(
    () => filterPackages(allPackages, category).slice(0, 8),
    [allPackages, category]
  );

  return (
    <section id="all-packages" className="bg-white py-14 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <AnimateIn className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-serif text-lg italic text-brand">Full catalogue</p>
            <h2 className="mt-1 font-serif text-4xl font-medium tracking-tight text-stone-950 sm:text-5xl">
              All tour packages
            </h2>
            <p className="mt-2 max-w-xl text-sm text-stone-600 sm:text-base">
              {allPackages.length} curated itineraries across India and international destinations —
              filter by type and open the one that fits.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-sm font-bold text-brand">
              {filtered.length} package{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="lg:hidden">
              <SliderArrows onPrev={scrollPrev} onNext={scrollNext} />
            </div>
          </div>
        </AnimateIn>

        <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto rounded-full bg-[#fff7ed] p-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                category === cat
                  ? "bg-brand text-white shadow-md shadow-brand/30"
                  : "text-stone-600 hover:bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div ref={scrollerRef} className={`${snapRowClass} lg:grid-cols-4`}>
          {filtered.map((pkg) => (
            <article
              key={pkg.id}
              data-snap-card
              className="group w-[calc(100vw-3.25rem)] shrink-0 snap-start sm:w-[420px] lg:w-auto"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-xl">
                <Image
                  src={getPackageImage(pkg)}
                  alt={pkg.title}
                  fill
                  loading="lazy"
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/15 to-transparent" />
                {pkg.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-950">
                    {pkg.badge}
                  </span>
                )}
                <span className="absolute right-4 top-4 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-950">
                  ★ {pkg.rating}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                    {pkg.duration}
                  </p>
                  <h3 className="mt-1 font-serif text-[1.65rem] font-medium leading-none">{pkg.title}</h3>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <p className="text-sm font-semibold text-orange-200">
                      {formatPackagePrice(pkg.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() => onViewDetails?.(pkg)}
                      className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-950"
                    >
                      View detail
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SliderArrows({ onPrev, onNext }) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous packages"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:border-brand hover:text-brand"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next packages"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-sm transition hover:border-brand hover:text-brand"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
