export default function PackageDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading package">
      <div className="pk-skeleton h-4 w-64 rounded-full" />
      <div className="pk-skeleton mt-5 h-12 w-3/4 rounded-2xl" />
      <div className="pk-skeleton mt-6 h-[320px] w-full rounded-[2rem] sm:h-[460px]" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="pk-skeleton h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
