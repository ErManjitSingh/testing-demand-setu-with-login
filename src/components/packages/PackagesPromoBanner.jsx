import Image from "next/image";
import Link from "next/link";

export default function PackagesPromoBanner() {
  return (
    <section className="px-3 py-3 sm:px-6 sm:py-4">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-2xl sm:rounded-3xl bg-[#ea580c] text-white sm:grid-cols-2">
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
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/90">Limited time offer</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Travel More, Spend Less!</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
            Book any famous package this season and unlock exclusive group discounts.
          </p>
          <div className="mt-8 flex items-center gap-5">
            <Link
              href="/packages?sort=discount"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#c2410c] transition hover:bg-orange-50"
            >
              Explore offers
            </Link>
            <p className="text-5xl font-extrabold leading-none text-white">25%</p>
          </div>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Off this season</p>
        </div>
      </div>
    </section>
  );
}
