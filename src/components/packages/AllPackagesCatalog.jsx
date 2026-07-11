"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import AnimateIn from "@/components/packages/AnimateIn";
import {
  filterPackages,
  formatPackagePrice,
  getAllPackages,
  getPackageCategories,
  getPackageImage,
} from "@/lib/tourPackages";

export default function AllPackagesCatalog({ onViewDetails }) {
  const [category, setCategory] = useState("All");
  const allPackages = getAllPackages();
  const categories = getPackageCategories();

  const filtered = useMemo(
    () => filterPackages(allPackages, category),
    [allPackages, category]
  );

  return (
    <section id="all-packages" className="bg-gradient-to-b from-white to-brand-muted/20 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-dark">
              Full catalogue
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
              All tour packages
            </h2>
            <p className="mt-2 max-w-xl text-sm text-stone-600 sm:text-base">
              {allPackages.length} curated itineraries across India and international destinations —
              filter by type and find your perfect trip.
            </p>
          </div>
          <p className="text-sm font-bold text-brand">
            {filtered.length} package{filtered.length !== 1 ? "s" : ""} shown
          </p>
        </AnimateIn>

        <AnimateIn delay={100} className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                category === cat
                  ? "bg-brand text-white shadow-lg shadow-brand/30"
                  : "bg-white text-stone-700 ring-1 ring-stone-200 hover:ring-brand/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </AnimateIn>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((pkg, i) => (
            <AnimateIn key={pkg.id} delay={(i % 6) * 70}>
              <article className="package-card-hover card-shine group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={getPackageImage(pkg)}
                    alt={pkg.title}
                    fill
                    loading="lazy"
                    className="object-cover transition duration-700 group-hover:scale-110"
                    sizes="(max-width:640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {pkg.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow">
                      {pkg.badge}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-lg bg-black/50 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                    {pkg.duration}
                  </span>
                  <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-xs font-bold text-amber-800">
                    ★ {pkg.rating}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand">
                    {pkg.subtitle}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-stone-900">{pkg.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
                    {pkg.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pkg.highlights.slice(0, 3).map((h) => (
                      <span
                        key={h}
                        className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600"
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-dashed border-stone-200 pt-4">
                    {pkg.inclusions.slice(0, 3).map((inc) => (
                      <span
                        key={inc}
                        className="text-[10px] font-semibold text-emerald-700"
                      >
                        ✓ {inc}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-stone-400">From</p>
                      <p className="text-xl font-extrabold text-brand">
                        {formatPackagePrice(pkg.price)}
                      </p>
                      <p className="text-[10px] text-stone-400">{pkg.groupSize}</p>
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
      </div>
    </section>
  );
}
