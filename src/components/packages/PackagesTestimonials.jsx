"use client";

import AnimateIn from "@/components/packages/AnimateIn";
import { PACKAGE_TESTIMONIALS } from "@/lib/tourPackages";

export default function PackagesTestimonials() {
  return (
    <section className="border-y border-stone-200 bg-gradient-to-b from-stone-50 to-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-dark">
            Guest stories
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            Loved by travellers across India
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-600 sm:text-base">
            Real reviews from guests who booked our tour packages — rated 4.9★ on average.
          </p>
        </AnimateIn>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGE_TESTIMONIALS.map((t, i) => (
            <AnimateIn key={t.name} delay={i * 80}>
              <article className="package-card-hover flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j}>★</span>
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-stone-600">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-amber-500 text-xs font-bold text-white">
                    {t.avatar}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-stone-900">{t.name}</p>
                    <p className="text-xs text-stone-500">{t.location}</p>
                  </div>
                </div>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-brand">
                  {t.package}
                </p>
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
