"use client";

import { Quote, Star } from "lucide-react";
import HomeSection from "@/components/packages/HomeSection";
import { PACKAGE_TESTIMONIALS } from "@/lib/tourPackages";

function clampRating(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 5;
}

export default function PackagesTestimonials({ config = null }) {
  const reviews = config?.items?.length ? config.items : PACKAGE_TESTIMONIALS;
  const average = (reviews.reduce((sum, r) => sum + clampRating(r.rating), 0) / reviews.length).toFixed(1);

  return (
    <HomeSection
      headingId="testimonials"
      eyebrow="Guest stories"
      title={config?.title || "Loved by travellers across India"}
      action={
        <div className="inline-flex items-center gap-3 self-start rounded-full border border-stone-200 bg-stone-50 px-4 py-2 sm:self-auto">
          <span className="flex gap-0.5 text-amber-500" aria-hidden>
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </span>
          <span className="text-sm font-bold text-stone-900">
            {average} <span className="font-medium text-stone-500">from {reviews.length} reviews</span>
          </span>
        </div>
      }
    >
      {/* Swipeable on phones, grid from tablet up */}
      <div className="no-scrollbar -mx-1 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
        {reviews.map((t, i) => (
          <article
            key={`${t.name}-${i}`}
            className="relative flex w-[82%] shrink-0 snap-center flex-col rounded-2xl border border-stone-200 bg-stone-50 p-5 transition hover:border-brand/30 hover:bg-white hover:shadow-lg sm:w-auto"
          >
            <Quote aria-hidden className="absolute right-4 top-4 h-8 w-8 text-brand/15" strokeWidth={2} />
            <div className="flex gap-0.5 text-amber-500" aria-label={`${clampRating(t.rating)} out of 5 stars`}>
              {Array.from({ length: clampRating(t.rating) }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-700">&ldquo;{t.text}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3 border-t border-stone-200 pt-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-amber-500 text-xs font-bold text-white ring-4 ring-orange-50">
                {t.avatar}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-stone-900">{t.name}</p>
                {t.location ? <p className="truncate text-xs text-stone-500">{t.location}</p> : null}
              </div>
            </div>
            {t.package ? <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-brand">{t.package}</p> : null}
          </article>
        ))}
      </div>
    </HomeSection>
  );
}
