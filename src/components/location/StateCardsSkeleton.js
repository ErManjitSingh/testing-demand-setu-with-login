export default function StateCardsSkeleton({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-[140px] shrink-0 overflow-hidden rounded-2xl ring-1 ring-stone-200 sm:w-[160px]"
          aria-hidden
        >
          <div className="aspect-[3/4] animate-pulse bg-stone-200" />
        </div>
      ))}
    </>
  );
}
