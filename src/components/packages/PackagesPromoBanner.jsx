import Image from "next/image";

export default function PackagesPromoBanner({ onEnquire }) {
  return (
    <section className="bg-[#f6f3ee] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] bg-stone-950 text-white sm:grid-cols-2">
        <div className="group relative min-h-[240px] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80"
            alt="Mountain adventure"
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 560px"
          />
        </div>
        <div className="flex flex-col justify-center p-8 sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">Limited time offer</p>
          <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight">Travel More, Spend Less!</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/75">
            Book any famous package this season and unlock exclusive group discounts.
          </p>
          <div className="mt-8 flex items-center gap-5">
            <button
              type="button"
              onClick={onEnquire}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-950"
            >
              Book now
            </button>
            <p className="font-serif text-5xl leading-none text-orange-200">25%</p>
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/50">Off this season</p>
        </div>
      </div>
    </section>
  );
}
