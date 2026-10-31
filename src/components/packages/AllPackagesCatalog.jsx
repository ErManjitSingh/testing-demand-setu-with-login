"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import HomeRail, { RailCard } from "@/components/packages/HomeRail";
import {
  filterPackages,
  formatPackagePrice,
  getAllPackages,
  getPackageCategories,
  getPackageImage,
} from "@/lib/tourPackages";

export default function AllPackagesCatalog() {
  const [category, setCategory] = useState("All");
  const allPackages = useMemo(() => getAllPackages(), []);
  const categories = useMemo(() => getPackageCategories(), []);

  const filtered = useMemo(
    () => filterPackages(allPackages, category).slice(0, 12),
    [allPackages, category]
  );

  return (
    <HomeRail
      id="all-packages"
      title="All tour packages"
      subtitle={`${allPackages.length} curated itineraries across India and international destinations — filter by type and open the one that fits.`}
      action={
        <Link href="/packages" className="hidden whitespace-nowrap text-sm font-extrabold text-brand hover:underline sm:inline">
          View all →
        </Link>
      }
      toolbar={
        <div role="tablist" aria-label="Package type" className="no-scrollbar -mx-1 mt-5 flex gap-1 overflow-x-auto border-b border-stone-200 px-1">
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(cat)}
                className={`relative shrink-0 px-4 py-3 text-sm font-bold transition ${
                  active ? "text-brand" : "text-stone-600 hover:text-stone-950"
                }`}
              >
                {cat}
                {active ? <span aria-hidden className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brand" /> : null}
              </button>
            );
          })}
        </div>
      }
      footer={
        <Link
          href="/packages"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand"
        >
          Browse all {allPackages.length} packages with filters →
        </Link>
      }
    >
      {filtered.map((pkg) => (
        <RailCard
          key={pkg.id}
          size="lg"
          href={`/packages/${pkg.slug}`}
          image={getPackageImage(pkg)}
          title={pkg.title}
          sub={`${pkg.duration} · ★ ${pkg.rating}`}
          price={formatPackagePrice(pkg.price)}
          badge={pkg.badge}
          ariaLabel={`${pkg.title}, ${pkg.duration}`}
        />
      ))}
    </HomeRail>
  );
}
