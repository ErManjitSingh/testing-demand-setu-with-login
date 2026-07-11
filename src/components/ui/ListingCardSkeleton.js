export function ListingRowCardSkeleton({ featured = false }) {
  return (
    <div
      className={`flex overflow-hidden rounded-2xl bg-white sm:rounded-3xl ${
        featured ? "ring-2 ring-stone-200" : "ring-1 ring-stone-200"
      }`}
      aria-hidden
    >
      <div className="h-[140px] w-[140px] shrink-0 animate-pulse bg-stone-200 sm:h-[160px] sm:w-[180px] md:w-[220px]" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 p-4 sm:p-5">
        <div className="h-3 w-20 animate-pulse rounded bg-stone-200" />
        <div className="h-5 w-3/4 max-w-xs animate-pulse rounded bg-stone-200" />
        <div className="h-3 w-1/2 max-w-[200px] animate-pulse rounded bg-stone-200" />
        <div className="mt-1 flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-stone-200" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200" aria-hidden>
      <div className="aspect-[4/3] animate-pulse bg-stone-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-stone-200" />
        <div className="h-5 w-4/5 animate-pulse rounded bg-stone-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-stone-200" />
      </div>
    </div>
  );
}
