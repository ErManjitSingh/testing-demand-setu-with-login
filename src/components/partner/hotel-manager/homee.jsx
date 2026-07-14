"use client";

import React, { useState } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import ListedProperites from "./ListedPoperties";
import { useHotelManager } from "@/context/HotelManagerContext";

const PROPERTY_TYPE_TABS = [
  { label: "All", value: "all" },
  { label: "Hotel", value: "hotel" },
  { label: "BnBs", value: "BnBs" },
  { label: "HomeStay & Villa", value: "homeStays&Villas" },
];

const QUICK_TIPS = [
  {
    icon: BuildingOffice2Icon,
    title: "Keep property details fresh",
    text: "Update photos and amenities so guests find you faster.",
  },
  {
    icon: CalendarDaysIcon,
    title: "Sync inventory regularly",
    text: "Refresh room availability and rates to avoid booking gaps.",
  },
  {
    icon: SparklesIcon,
    title: "List another property",
    text: "Grow your portfolio — add hotels, villas or homestays anytime.",
  },
];

export function Homee() {
  const {
    propertiesbasicinfo,
    isLoadingbasicinfo,
    totalHotelsbasicinfo,
    refreshPropertiesBasicinfo,
  } = useHotelManager();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyType, setSelectedPropertyType] = useState(
    PROPERTY_TYPE_TABS[0].value
  );

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-stone-50">
      {/* Atmosphere — kills flat white blank look */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(234,88,12,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(251,146,60,0.08),_transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(120,113,108,0.12) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        {/* Back + breadcrumb */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Link
            href="/list-your-property"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 shadow-sm transition hover:border-brand/40 hover:text-brand-dark sm:text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2 text-xs font-medium text-stone-500 sm:text-sm">
            <Link
              href="/list-your-property"
              className="inline-flex items-center gap-1 text-brand hover:underline"
            >
              Partner home
            </Link>
            <span className="text-stone-300">›</span>
            <span className="font-semibold text-stone-700">My Properties</span>
          </div>
        </div>

        {/* Hero panel */}
        <div className="overflow-hidden rounded-2xl border border-orange-100/80 bg-gradient-to-br from-white via-orange-50/40 to-amber-50/30 p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand">
                Partner dashboard
              </p>
              {isLoadingbasicinfo ? (
                <div className="mt-2 h-9 w-48 animate-pulse rounded-lg bg-stone-200/80" />
              ) : (
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
                  {totalHotelsbasicinfo}{" "}
                  {totalHotelsbasicinfo === 1 ? "Property" : "Properties"}
                </h1>
              )}
              <p className="mt-1.5 max-w-xl text-sm font-medium text-stone-500">
                Manage listings, inventory and rates — all in one place.
              </p>
            </div>
            <Link
              href="/partner/hotels/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark"
            >
              <PlusIcon strokeWidth={2.5} className="h-4 w-4" />
              New Property
            </Link>
          </div>

          {/* Type tabs */}
          <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-0.5">
            {PROPERTY_TYPE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition sm:text-sm ${
                  selectedPropertyType === tab.value
                    ? "border-brand bg-brand text-white shadow-md shadow-brand/25"
                    : "border-stone-200/80 bg-white/90 text-stone-600 hover:border-brand/40 hover:text-brand-dark"
                }`}
                onClick={() => setSelectedPropertyType(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search toolbar */}
        <div className="mt-4 rounded-2xl border border-stone-200/90 bg-white/90 p-3 shadow-sm backdrop-blur sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                placeholder="Search property name or location"
                className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              disabled={isLoadingbasicinfo}
              onClick={refreshPropertiesBasicinfo}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 transition hover:border-brand/40 hover:text-brand-dark disabled:opacity-60"
            >
              <ArrowPathIcon
                className={`h-4 w-4 ${isLoadingbasicinfo ? "animate-spin" : ""}`}
              />
              {isLoadingbasicinfo ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* Properties */}
        <div className="mt-5">
          <ListedProperites
            properties={propertiesbasicinfo}
            isLoading={isLoadingbasicinfo}
            totalHotels={totalHotelsbasicinfo}
            searchQuery={searchQuery}
            propertyType={selectedPropertyType}
            onRefresh={refreshPropertiesBasicinfo}
          />
        </div>

        {/* Tips strip — fills blank bottom space with purpose */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {QUICK_TIPS.map((tip) => (
            <article
              key={tip.title}
              className="rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-sm backdrop-blur"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <tip.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-extrabold text-stone-900">
                {tip.title}
              </h3>
              <p className="mt-1 text-xs font-medium leading-relaxed text-stone-500">
                {tip.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Homee;
