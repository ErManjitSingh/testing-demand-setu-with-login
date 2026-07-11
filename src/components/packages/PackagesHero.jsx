"use client";

import Image from "next/image";
import Link from "next/link";

const STATS = [
  { value: "8+", label: "Curated packages" },
  { value: "15+", label: "Destinations" },
  { value: "4.9", label: "Avg. guest rating" },
  { value: "24/7", label: "Travel support" },
];

export default function PackagesHero({ image, title, location, duration }) {
  return (
    <section className="relative min-h-[min(92vh,820px)] overflow-hidden bg-stone-950">
      <Image
        src={image}
        alt=""
        fill
        priority
        className="object-cover opacity-80"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/55 to-stone-950/25" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(234,88,12,0.18),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-[min(92vh,820px)] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-32">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/60">
            Demand Setu · Tour packages
          </p>
          <h1 className="mt-5 text-[2.75rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            Journeys crafted
            <span className="block text-white/90">for the curious traveller.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            All-inclusive routes across India — handpicked stays, private transfers, local guides,
            and a dedicated team from first enquiry to homecoming.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#packages-list"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-bold text-stone-900 transition hover:bg-stone-100"
            >
              Browse packages
            </a>
            <Link
              href="/accommodations"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Hotel stays
            </Link>
          </div>
        </div>

        {(title || location) && (
          <div className="mt-10 hidden max-w-sm rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-200">
              Editor&apos;s pick
            </p>
            <p className="mt-2 text-lg font-bold text-white">{title}</p>
            <p className="mt-1 text-sm text-white/65">
              {duration} · {location}
            </p>
          </div>
        )}

        <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-white/15 pt-8 sm:grid-cols-4 sm:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-xs font-medium uppercase tracking-wider text-white/55 sm:text-[11px]">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
