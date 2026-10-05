export default function PackagesLoading() {
  return (
    <div aria-busy="true" aria-label="Loading packages">
      <div className="h-[420px] bg-stone-900 sm:h-[520px]" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-[1.75rem] bg-white ring-1 ring-stone-200">
            <div className="pk-skeleton aspect-[4/3]" />
            <div className="space-y-3 p-5">
              <div className="pk-skeleton h-3 w-24 rounded-full" />
              <div className="pk-skeleton h-6 w-3/4 rounded-lg" />
              <div className="pk-skeleton h-3 w-full rounded-full" />
              <div className="pk-skeleton h-3 w-2/3 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
