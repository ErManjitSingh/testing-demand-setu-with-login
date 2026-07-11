import Image from "next/image";

export default function PackagesPromoBanner({ onEnquire }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 shadow-xl">
        <Image
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80"
          alt="Mountain adventure"
          fill
          className="object-cover opacity-50"
          sizes="(max-width:768px) 100vw, 1152px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/70 to-stone-900/30" />

        <div className="relative flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="max-w-md">
            <span className="inline-block rounded-full bg-brand/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-200">
              Limited time offer
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
              Travel More, Spend Less!
            </h2>
            <p className="mt-2 text-sm text-stone-300">
              Book any famous package this season and unlock exclusive group discounts.
            </p>
            <button
              type="button"
              onClick={onEnquire}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-stone-900 transition hover:bg-stone-100"
            >
              Book now
              <span aria-hidden>→</span>
            </button>
          </div>

          <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full bg-brand text-center shadow-lg shadow-brand/40 sm:h-32 sm:w-32">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/90">Up to</p>
            <p className="text-3xl font-extrabold leading-none text-white">25%</p>
            <p className="text-xs font-bold uppercase text-white/90">Off</p>
          </div>
        </div>
      </div>
    </section>
  );
}
