"use client";

import { Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/listings";
import { ALL_STAYS_CATEGORY, TOUR_PACKAGES_CATEGORY } from "@/lib/categoryExplore";
import { useCategoryExplore } from "@/hooks/useCategoryExplore";
import {
  buildListingsUrlPreservingFilters,
  fillMissingListingsTripDefaults,
  parseListingsUrl,
  resolveListingsTripFromPath,
} from "@/lib/bookingSearch";
import { startNavigationLoading } from "@/lib/navigationLoading";
import { isListingsSlugPath, parseListingsSlugPath } from "@/lib/listingsSlug";

function CategoryPillsClient({ activeCategory = "all" }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openExplore, modal } = useCategoryExplore();

  const hasLocation = (() => {
    if (isListingsSlugPath(pathname)) {
      const slug = parseListingsSlugPath(pathname);
      const trip = parseListingsUrl(pathname, searchParams);
      return Boolean(trip.city || trip.state || trip.locationSlug || slug?.locationSlug);
    }
    return (
      pathname === "/listings" &&
      (Boolean(searchParams.get("city")?.trim()) ||
        Boolean(searchParams.get("state")?.trim()))
    );
  })();

  const pillClass = (active) =>
    active
      ? "bg-gradient-to-r from-brand to-orange-500 text-white shadow-lg shadow-brand/30 ring-2 ring-brand/20"
      : "bg-white text-foreground shadow-md shadow-stone-200/60 ring-1 ring-stone-900/5 hover:ring-brand/30 hover:shadow-lg";

  const setCategory = (catId) => {
    const hasUrlDates =
      searchParams.has("checkIn") && searchParams.has("checkOut");
    const hasUrlGuests =
      searchParams.has("adults") && searchParams.has("rooms");
    const baseTrip = resolveListingsTripFromPath(pathname, searchParams);
    const nextTrip = fillMissingListingsTripDefaults({
      ...baseTrip,
      category: catId === "all" ? "all" : catId,
      checkIn: hasUrlDates ? baseTrip.checkIn : null,
      checkOut: hasUrlDates ? baseTrip.checkOut : null,
      guests: hasUrlGuests ? baseTrip.guests : undefined,
    });
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("propertyType");
    params.delete("city");
    params.delete("state");
    router.replace(buildListingsUrlPreservingFilters(params, nextTrip), { scroll: false });
  };

  const handleClick = (catId) => {
    if (catId === TOUR_PACKAGES_CATEGORY.id) {
      startNavigationLoading();
      router.push(TOUR_PACKAGES_CATEGORY.href);
      return;
    }
    if (hasLocation) {
      setCategory(catId);
      return;
    }
    openExplore(catId);
  };

  return (
    <>
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <button
          type="button"
          onClick={() => handleClick("all")}
          className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold transition ${pillClass(activeCategory === "all")}`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-lg">
            {ALL_STAYS_CATEGORY.icon}
          </span>
          {ALL_STAYS_CATEGORY.label}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleClick(cat.id)}
            className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold transition ${pillClass(activeCategory === cat.id)}`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-lg ${
                activeCategory === cat.id ? "bg-white/20" : "bg-brand-muted"
              }`}
            >
              {cat.icon}
            </span>
            {cat.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleClick(TOUR_PACKAGES_CATEGORY.id)}
          className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-bold transition ${pillClass(false)}`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-muted text-lg">
            {TOUR_PACKAGES_CATEGORY.icon}
          </span>
          {TOUR_PACKAGES_CATEGORY.label}
        </button>
      </div>
      {!hasLocation && modal}
    </>
  );
}

export default function CategoryPills(props) {
  return (
    <Suspense fallback={<div className="h-14 animate-pulse rounded-2xl bg-stone-200" />}>
      <CategoryPillsClient {...props} />
    </Suspense>
  );
}
