"use client";

import Image from "next/image";
import { useRef } from "react";
import AnimateIn from "@/components/packages/AnimateIn";
import { formatPackagePrice, getAllPackages, getPackageImage } from "@/lib/tourPackages";

export default function FamousPackagesSection({ packages = [], onViewDetails }) {
  const trackRef = useRef(null);

  if (packages.length === 0) return null;

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  const totalCount = getAllPackages().length;

  return (
    <section id="famous-packages" className="relative overflow-hidden border-t border-stone-100 bg-white py-16 sm:py-20">
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-muted px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-dark">
              Most booked
            </span>
            <h2 className="mt-3 text-3xl font-extrabold text-stone-900 sm:text-4xl">Famous Packages</h2>
            <p className="mt-2 max-w-lg text-sm text-stone-600 sm:text-base">
              Our top-selling all-inclusive itineraries — trusted by thousands of travellers every
              season.
            </p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition hover:border-brand hover:text-brand"
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm transition hover:border-brand hover:text-brand"
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </AnimateIn>

        <div ref={trackRef} className="no-scrollbar mt-10 flex gap-5 overflow-x-auto pb-4">
          {packages.map((pkg, i) => (
            <AnimateIn
              key={pkg.id}
              delay={i * 80}
              className="w-[280px] shrink-0 sm:w-[300px]"
            >
              <article className="package-card-hover card-shine group h-full overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={getPackageImage(pkg)}
                    alt={pkg.title}
                    fill
                    loading="lazy"
                    className="object-cover transition duration-700 group-hover:scale-110"
                    sizes="300px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  {pkg.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-lg">
                      {pkg.badge}
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-orange-200">
                      {pkg.duration} · {pkg.location}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-white">{pkg.title}</h3>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold text-brand">{pkg.subtitle}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-600">
                    {pkg.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pkg.highlights.slice(0, 2).map((h) => (
                      <span
                        key={h}
                        className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        From
                      </p>
                      <p className="text-xl font-extrabold text-brand">
                        {formatPackagePrice(pkg.price)}
                      </p>
                      <p className="text-[10px] text-stone-400">★ {pkg.rating} · {pkg.reviews} reviews</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onViewDetails?.(pkg)}
                      className="rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-white transition hover:brightness-105"
                    >
                      View detail
                    </button>
                  </div>
                </div>
              </article>
            </AnimateIn>
          ))}
        </div>

        <AnimateIn delay={200} className="mt-6 text-center">
          <a
            href="#all-packages"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand transition hover:gap-3"
          >
            Browse all {totalCount} packages
            <span aria-hidden>→</span>
          </a>
        </AnimateIn>
      </div>
    </section>
  );
}
