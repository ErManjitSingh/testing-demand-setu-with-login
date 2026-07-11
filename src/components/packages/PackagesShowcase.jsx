"use client";

import { useMemo, useState } from "react";
import PackageCard from "@/components/packages/PackageCard";
import PackageEnquiryForm from "@/components/booking/PackageEnquiryForm";
import { PACKAGE_DESTINATIONS } from "@/lib/tourPackages";

export default function PackagesShowcase({ packages }) {
  const [activeDestination, setActiveDestination] = useState("All");
  const [enquiryPackage, setEnquiryPackage] = useState(null);

  const filtered = useMemo(() => {
    if (activeDestination === "All") return packages;
    return packages.filter((p) => p.state === activeDestination);
  }, [packages, activeDestination]);

  const heroPackage = filtered[0];
  const gridPackages = filtered.slice(1);

  return (
    <>
      <div
        id="packages-list"
        className="sticky top-14 z-30 border-b border-stone-200/80 bg-[#f8f6f3]/90 backdrop-blur-md sm:top-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto py-1">
            {PACKAGE_DESTINATIONS.map((dest) => {
              const active = activeDestination === dest;
              return (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setActiveDestination(dest)}
                  className={`relative shrink-0 px-4 py-4 text-sm font-semibold transition ${
                    active ? "text-stone-900" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {dest}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-brand" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
              {activeDestination === "All" ? "All destinations" : activeDestination}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
              {filtered.length} curated {filtered.length === 1 ? "package" : "packages"}
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-stone-500">
            Fully planned itineraries with stays, transfers, and on-ground support included.
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold text-stone-800">No packages here yet</p>
            <p className="mt-2 text-sm text-stone-500">
              Try another destination or reach out for a custom itinerary.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-12 lg:space-y-16">
            {heroPackage && (
              <PackageCard
                tourPackage={heroPackage}
                variant="hero"
                onViewDetails={setEnquiryPackage}
              />
            )}

            {gridPackages.length > 0 && (
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {gridPackages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    tourPackage={pkg}
                    onViewDetails={setEnquiryPackage}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <PackageEnquiryForm
        open={Boolean(enquiryPackage)}
        onClose={() => setEnquiryPackage(null)}
        tourPackage={enquiryPackage}
      />
    </>
  );
}
