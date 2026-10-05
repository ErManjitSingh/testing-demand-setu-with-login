"use client";

import Image from "next/image";
import ExploreSectionHeader from "@/components/packages/ExploreSectionHeader";
import { snapRowClass, useSnapScroll } from "@/components/packages/useSnapScroll";
import { formatPackagePrice, getAllPackages, getPackageImage } from "@/lib/tourPackages";

export default function FamousPackagesSection({ packages = [], onViewDetails }) {
  const { scrollerRef, scrollPrev, scrollNext } = useSnapScroll();
  if (packages.length === 0) return null;

  const totalCount = getAllPackages().length;
  const shown = packages.slice(0, 8);

  return (
    <section id="famous-packages" className="bg-[#f6f3ee] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ExploreSectionHeader
          scriptLabel="Most booked"
          title="Famous Packages"
          subtitle="Our top-selling all-inclusive itineraries — the trips travellers book first."
          count={`${shown.length} trips`}
          onScrollPrev={scrollPrev}
          onScrollNext={scrollNext}
        />

        <div ref={scrollerRef} className={`${snapRowClass} lg:auto-rows-[248px] lg:grid-cols-4 lg:gap-3`}>
          {shown.map((pkg, index) => {
            const lead = index === 0;
            const wide = index === 5;
            return (
            <article
              key={pkg.id}
              data-snap-card
              className={`w-[78vw] shrink-0 snap-start sm:w-[300px] lg:h-full lg:w-auto ${
                lead ? "lg:col-span-2 lg:row-span-2" : wide ? "lg:col-span-2" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => onViewDetails?.(pkg)}
                className="group relative block h-full w-full overflow-hidden rounded-[2rem] text-left shadow-md transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative h-[340px] w-full sm:h-[380px] lg:h-full">
                  <Image
                    src={getPackageImage(pkg)}
                    alt={pkg.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="340px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent" />
                  {pkg.badge && (
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-stone-950">
                      {pkg.badge}
                    </span>
                  )}
                  <div className={`absolute inset-x-0 bottom-0 text-white ${lead ? "p-6" : "p-4"}`}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
                      {pkg.duration}
                      {lead ? ` · ${pkg.location}` : ""}
                    </p>
                    <h3 className={`mt-1 font-serif font-medium leading-tight ${lead ? "text-4xl" : "text-xl"}`}>
                      {pkg.title}
                    </h3>
                    {lead && <p className="mt-2 max-w-md text-sm text-white/80">{pkg.subtitle}</p>}
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-orange-200">
                        From {formatPackagePrice(pkg.price)}
                      </p>
                      {lead && (
                        <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-stone-950">
                          View detail
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </article>
            );
          })}
        </div>

        <a href="#all-packages" className="mt-6 inline-block text-sm font-semibold text-brand">
          Browse all {totalCount} packages →
        </a>
      </div>
    </section>
  );
}
