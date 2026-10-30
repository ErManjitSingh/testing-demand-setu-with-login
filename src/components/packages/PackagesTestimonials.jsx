"use client";

import { Quote, Star } from "lucide-react";
import AnimateIn from "@/components/packages/AnimateIn";
import { PACKAGE_TESTIMONIALS } from "@/lib/tourPackages";

function clampRating(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 5;
}

export default function PackagesTestimonials({ config = null }) {
  const reviews = config?.items?.length ? config.items : PACKAGE_TESTIMONIALS;
  const average = (reviews.reduce((sum, r) => sum + clampRating(r.rating), 0) / reviews.length).toFixed(1);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fbf8f4] to-[#f6f3ee] py-16 sm:py-24">
      <Quote
        aria-hidden
        className="pointer-events-none absolute -left-6 top-10 hidden h-64 w-64 rotate-180 text-brand/[0.06] lg:block"
        strokeWidth={1.2}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <AnimateIn className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-lg italic text-brand">Guest stories</p>
          <h2 className="mt-1 font-serif text-4xl font-medium tracking-tight text-stone-950 sm:text-5xl">
            {config?.title || "Loved by travellers across India"}
          </h2>
          <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-2 shadow-sm">
            <span className="flex gap-0.5 text-amber-500" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </span>
            <span className="text-sm font-semibold text-stone-800">
              {average} <span className="font-normal text-stone-500">average from {reviews.length} guest reviews</span>
            </span>
          </div>
        </AnimateIn>

        {/* Swipeable on phones, grid from tablet up */}
        <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {reviews.map((t, i) => (
            <AnimateIn key={`${t.name}-${i}`} delay={i * 80} className="w-[82%] shrink-0 snap-center sm:w-auto">
              <article className="package-card-hover relative flex h-full flex-col rounded-3xl border border-stone-200/80 bg-white p-6 shadow-[0_18px_40px_-28px_rgba(28,25,23,0.35)]">
                <Quote aria-hidden className="absolute right-5 top-5 h-9 w-9 text-brand/15" strokeWidth={2} />
                <div className="flex gap-0.5 text-amber-500" aria-label={`${clampRating(t.rating)} out of 5 stars`}>
                  {Array.from({ length: clampRating(t.rating) }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-stone-700">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-stone-100 pt-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-amber-500 text-xs font-bold text-white ring-4 ring-orange-50">
                    {t.avatar}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-stone-900">{t.name}</p>
                    {t.location ? <p className="truncate text-xs text-stone-500">{t.location}</p> : null}
                  </div>
                </div>
                {t.package ? (
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-brand">{t.package}</p>
                ) : null}
              </article>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
