export default function PropertyPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#faf9f7] animate-pulse">
      <div className="hidden sm:block">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="grid h-[min(52vh,480px)] grid-cols-3 grid-rows-2 gap-2">
            <div className="col-span-2 row-span-2 rounded-2xl bg-stone-200" />
            <div className="rounded-2xl bg-stone-200" />
            <div className="rounded-2xl bg-stone-200" />
          </div>
        </div>
      </div>
      <div className="aspect-[4/3] bg-stone-200 sm:hidden" />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-x-10">
          <div className="min-w-0 space-y-6">
            <div className="h-6 w-24 rounded-full bg-stone-200" />
            <div className="h-10 w-3/4 max-w-lg rounded-xl bg-stone-200" />
            <div className="h-5 w-1/2 rounded-lg bg-stone-200" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 w-28 rounded-full bg-stone-200" />
              ))}
            </div>
            <div className="h-64 rounded-3xl bg-stone-200" />
            <div className="h-48 rounded-3xl bg-stone-200" />
            <div className="h-56 rounded-3xl bg-stone-200" />
          </div>
          <div className="hidden lg:block">
            <div className="h-[520px] rounded-3xl bg-stone-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
