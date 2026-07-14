"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const PROPERTY_TYPES = [
  {
    title: "Hotel",
    description:
      "A commercial establishment providing lodging with amenities like dining, room service, and conference facilities.",
    imageUrl: "https://promos.makemytrip.com/images/HOTEL.png",
    value: "hotel",
  },
  {
    title: "BnBs",
    description:
      "A self-contained property offering luxurious lodging with amenities such as pools, spas, dining, and recreation.",
    imageUrl: "https://promos.makemytrip.com/images/RESORT.png",
    value: "BnBs",
  },
  {
    title: "Home Stays & Villas",
    description:
      "A small, privately-owned accommodation offering personalized services and fewer amenities.",
    imageUrl: "https://promos.makemytrip.com/images/GUEST%20HOME.png",
    value: "homeStays&Villas",
  },
];

export function Property() {
  const [selectedProperty, setSelectedProperty] = useState("hotel");

  return (
    <div className="px-4 py-6 pb-28 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center gap-2 text-xs font-medium text-stone-500 sm:text-sm">
          <Link href="/partner/hotels" className="text-brand hover:underline">
            Dashboard
          </Link>
          <span>›</span>
          <span>New Property</span>
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
          Which property type would you like to list?
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Please select your property type from the options below.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROPERTY_TYPES.map((property) => {
            const isSelected = selectedProperty === property.value;
            return (
              <button
                type="button"
                key={property.value}
                onClick={() => setSelectedProperty(property.value)}
                className={`relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition ${
                  isSelected
                    ? "border-brand shadow-lg shadow-brand/15"
                    : "border-stone-200 hover:border-brand/40 hover:shadow-md"
                }`}
              >
                {isSelected && (
                  <CheckCircleIcon className="absolute right-3 top-3 z-10 h-7 w-7 rounded-full bg-white text-brand" />
                )}
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="h-44 w-full object-cover sm:h-52"
                />
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h2 className="text-lg font-extrabold text-stone-900">
                    {property.title}
                  </h2>
                  <p className="mt-1.5 line-clamp-3 text-sm text-stone-500">
                    {property.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/partner/hotels"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm font-bold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
          >
            Cancel
          </Link>
          <Link
            href={`/partner/hotels/onboarding/${selectedProperty}`}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark"
          >
            List Property
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Property;
