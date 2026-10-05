export default function BookingLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading booking page">
      <div className="pk-skeleton h-4 w-56 rounded-full" />
      <div className="pk-skeleton mt-5 h-10 w-2/3 rounded-2xl" />
      <div className="pk-skeleton mt-6 h-16 w-full rounded-3xl" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="pk-skeleton h-[520px] rounded-[2rem]" />
        <div className="pk-skeleton hidden h-[480px] rounded-[2rem] lg:block" />
      </div>
    </div>
  );
}
