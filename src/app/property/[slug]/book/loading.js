export default function BookingLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-stone-100">
      <div className="border-b border-stone-200 bg-white px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="h-4 w-48 rounded bg-stone-200" />
          <div className="mt-4 h-8 w-64 rounded bg-stone-200" />
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[360px_1fr]">
        <div className="h-[520px] rounded-xl bg-stone-200" />
        <div className="h-[640px] rounded-xl bg-stone-200" />
      </div>
    </div>
  );
}
