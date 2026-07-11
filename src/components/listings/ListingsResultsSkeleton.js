import ListingsFilterSidebar from "@/components/listings/ListingsFilterSidebar";
import ListingsMobileFilters from "@/components/listings/ListingsMobileFilters";
import {
  ListingRowCardSkeleton,
  PropertyCardSkeleton,
} from "@/components/ui/ListingCardSkeleton";

export default function ListingsResultsSkeleton({ activeCategory = "all" }) {
  return (
    <div
      id="listings-results"
      className="mt-8 scroll-mt-28 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10"
    >
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <ListingsFilterSidebar activeCategory={activeCategory} />
        </div>
      </div>

      <div className="min-w-0 space-y-10 pb-16" aria-busy="true" aria-label="Loading stays">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="h-4 w-32 animate-pulse rounded bg-stone-200" />
          <div className="flex items-center gap-2">
            <ListingsMobileFilters activeCategory={activeCategory} />
            <div className="hidden h-9 w-56 animate-pulse rounded-xl bg-stone-200 sm:block" />
          </div>
        </div>

        <section>
          <div className="mb-5 h-4 w-28 animate-pulse rounded bg-stone-200" />
          <div className="hidden gap-5 lg:grid lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
          <div className="-mx-4 flex gap-4 overflow-hidden px-4 lg:hidden">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="w-[min(85vw,300px)] shrink-0">
                <PropertyCardSkeleton />
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="mb-2 space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-stone-200" />
            <div className="h-6 w-40 animate-pulse rounded bg-stone-200" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <ListingRowCardSkeleton key={i} featured={i === 0} />
          ))}
        </section>
      </div>
    </div>
  );
}
