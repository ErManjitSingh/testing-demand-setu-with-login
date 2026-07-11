"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CategoryExploreQuickLinks from "@/components/CategoryExploreQuickLinks";
import ListingsBookingAlert from "@/components/listings/ListingsBookingAlert";
import ListingsFilterSidebar from "@/components/listings/ListingsFilterSidebar";
import ListingsMobileFilters from "@/components/listings/ListingsMobileFilters";
import ListingsSortBar, { sortListings } from "@/components/listings/ListingsSortBar";
import RecommendedSlider from "@/components/listings/RecommendedSlider";
import AllPropertiesList from "@/components/listings/AllPropertiesList";
import {
  applyListingFilters,
  countListingsByCategory,
  parseCsvParam,
} from "@/lib/listingFilters";
import {
  buildListingsUrlPreservingFilters,
  parseListingsUrl,
  parseTripFromSearchParams,
  resolveListingsTripFromPath,
} from "@/lib/bookingSearch";
import { isListingsSlugPath } from "@/lib/listingsSlug";

function ListingsFilteredCatalogClient({
  listings: allListings,
  activeCat: initialCategory,
  label,
  selectedCity = "",
  selectedState = "",
  locationFilterMode = false,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingAlert, setBookingAlert] = useState("");

  const pathTrip = isListingsSlugPath(pathname)
    ? parseListingsUrl(pathname, searchParams)
    : parseTripFromSearchParams(searchParams);
  const category = searchParams.get("category") || pathTrip.category || initialCategory || "all";

  const handleBookingBlocked = useCallback((message) => {
    setBookingAlert(message);
    document.getElementById("listings-search")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  const prices = parseCsvParam(searchParams.get("price"));
  const stars = parseCsvParam(searchParams.get("stars"));
  const amenities = parseCsvParam(searchParams.get("amenities"));
  const sort = searchParams.get("sort") || "stays";

  const filterState = useMemo(
    () => ({ category, prices, stars, amenities }),
    [category, prices, stars, amenities]
  );

  const filteredListings = useMemo(() => {
    const filtered = applyListingFilters(allListings, filterState);
    return sortListings(filtered, sort);
  }, [allListings, filterState, sort]);

  const categoryCounts = useMemo(
    () =>
      countListingsByCategory(allListings, {
        prices,
        stars,
        amenities,
      }),
    [allListings, prices, stars, amenities]
  );

  const updateParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else {
          params.set(key, value);
        }
      }
      if (updates.category === "all") {
        params.delete("propertyType");
      }
      if (updates.sort === "stays") {
        params.delete("sort");
      }
      params.delete("category");
      params.delete("propertyType");
      params.delete("city");
      params.delete("state");

      const nextTrip = resolveListingsTripFromPath(pathname, searchParams, {
        ...pathTrip,
        category:
          updates.category === null || updates.category === "all"
            ? "all"
            : updates.category ?? pathTrip.category,
      });

      router.replace(buildListingsUrlPreservingFilters(params, nextTrip), { scroll: false });
    },
    [pathTrip, router, searchParams]
  );

  const onCategoryChange = useCallback(
    (catId) => updateParams({ category: catId === "all" ? null : catId }),
    [updateParams]
  );

  const onPriceToggle = useCallback(
    (priceId) => {
      const next = prices.includes(priceId)
        ? prices.filter((id) => id !== priceId)
        : [...prices, priceId];
      updateParams({ price: next });
    },
    [prices, updateParams]
  );

  const onStarToggle = useCallback(
    (starId) => {
      const next = stars.includes(starId)
        ? stars.filter((id) => id !== starId)
        : [...stars, starId];
      updateParams({ stars: next });
    },
    [stars, updateParams]
  );

  const onAmenityToggle = useCallback(
    (amenityId) => {
      const next = amenities.includes(amenityId)
        ? amenities.filter((id) => id !== amenityId)
        : [...amenities, amenityId];
      updateParams({ amenities: next });
    },
    [amenities, updateParams]
  );

  const onSortChange = useCallback(
    (sortKey) => updateParams({ sort: sortKey === "stays" ? null : sortKey }),
    [updateParams]
  );

  const onClearStars = useCallback(() => updateParams({ stars: [] }), [updateParams]);

  const onClearFilters = useCallback(() => {
    updateParams({
      category: null,
      price: [],
      stars: [],
      amenities: [],
      sort: null,
    });
  }, [updateParams]);

  const recommended = filteredListings.slice(0, 3);
  const hasActiveFilters =
    category !== "all" ||
    prices.length > 0 ||
    stars.length > 0 ||
    amenities.length > 0 ||
    sort !== "stays";

  const sidebarProps = {
    activeCategory: category,
    locationFilterMode,
    categoryCounts: allListings.length > 0 ? categoryCounts : null,
    selectedPrices: prices,
    selectedStars: stars,
    selectedAmenities: amenities,
    onCategoryChange,
    onPriceToggle,
    onStarToggle,
    onAmenityToggle,
    onClearFilters,
    hasActiveFilters,
  };

  return (
    <div
      id="listings-results"
      className="mt-8 scroll-mt-28 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10"
    >
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <ListingsFilterSidebar {...sidebarProps} />
        </div>
      </div>

      <div className="min-w-0 min-h-[320px] space-y-10 pb-16">
        <ListingsBookingAlert
          message={bookingAlert}
          onDismiss={() => setBookingAlert("")}
        />

        <div className="flex items-center gap-2 sm:justify-between">
          <p className="min-w-0 flex-1 truncate text-xs text-muted sm:flex-none sm:text-sm">
            <span className="font-extrabold text-foreground">{filteredListings.length}</span>
            {allListings.length !== filteredListings.length && (
              <span className="text-muted"> of {allListings.length}</span>
            )}{" "}
            stays
            {selectedCity ? (
              <>
                {" "}
                in <span className="font-extrabold text-brand">{selectedCity}</span>
              </>
            ) : selectedState ? (
              <>
                {" "}
                in <span className="font-extrabold text-brand">{selectedState}</span>
              </>
            ) : (
              category !== "all" && (
                <>
                  {" "}
                  in <span className="font-extrabold text-brand">{label}</span>
                </>
              )
            )}
          </p>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ListingsMobileFilters {...sidebarProps} />
            <div className="w-[9.5rem] shrink-0 sm:min-w-0 sm:flex-1 lg:w-auto lg:flex-none">
              <ListingsSortBar
                sort={sort}
                selectedStars={stars}
                onSortChange={onSortChange}
                onStarToggle={onStarToggle}
                onClearStars={onClearStars}
              />
            </div>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-brand/20 bg-white p-10 text-center sm:p-14">
            <span className="text-5xl">🏝️</span>
            <h2 className="mt-4 text-2xl font-extrabold">No stays found</h2>
            <p className="mt-2 text-muted">
              {hasActiveFilters
                ? "Try adjusting your filters or search another destination."
                : selectedCity || selectedState
                  ? "No properties in this destination yet. Try another location."
                  : "Try another collection or view all stays."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-6 rounded-full border-2 border-brand px-6 py-2.5 text-sm font-bold text-brand transition hover:bg-brand-muted"
              >
                Clear all filters
              </button>
            )}
            {/* <div className="mt-8 flex flex-wrap justify-center gap-2">
              <CategoryExploreQuickLinks />
            </div> */}
          </div>
        ) : (
          <>
            {recommended.length > 0 && (
              <RecommendedSlider
                listings={recommended}
                requireBooking
                onBookingBlocked={handleBookingBlocked}
              />
            )}

            <AllPropertiesList
              listings={filteredListings}
              requireBooking
              onBookingBlocked={handleBookingBlocked}
            />

            <div className="grid gap-4 rounded-3xl bg-stone-900 p-6 text-white sm:grid-cols-3">
              {[
                { icon: "🛡️", title: "Verified stays", text: "Every listing checked by our team" },
                { icon: "💳", title: "Secure payments", text: "UPI · Visa · Mastercard" },
                { icon: "📞", title: "24/7 support", text: "+91 8353056000" },
              ].map((item) => (
                <div key={item.title} className="text-center sm:py-2">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="mt-2 text-sm font-bold">{item.title}</p>
                  <p className="mt-0.5 text-xs text-stone-400">{item.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ListingsFilteredCatalogFallback() {
  return (
    <div
      id="listings-results"
      className="mt-8 scroll-mt-28 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10"
    >
      <div className="hidden h-[420px] animate-pulse rounded-3xl bg-stone-200 lg:block" />
      <div className="min-h-[320px] space-y-6">
        <div className="h-10 animate-pulse rounded-xl bg-stone-200" />
        <div className="h-64 animate-pulse rounded-3xl bg-stone-200" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-3xl bg-stone-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ListingsFilteredCatalog(props) {
  return (
    <Suspense fallback={<ListingsFilteredCatalogFallback />}>
      <ListingsFilteredCatalogClient {...props} />
    </Suspense>
  );
}
