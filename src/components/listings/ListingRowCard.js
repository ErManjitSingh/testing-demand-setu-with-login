"use client";

import Image from "next/image";
import PropertyBookingLink from "@/components/booking/PropertyBookingLink";
import { formatPrice, getCategoryLabel } from "@/lib/listings";

export default function ListingRowCard({
  listing,
  compact = false,
  featured = false,
  requireBooking = false,
  onBookingBlocked,
}) {
  const savePct =
    listing.originalPrice &&
    Math.round(
      ((listing.originalPrice - listing.price) / listing.originalPrice) * 100
    );

  return (
    <PropertyBookingLink
      slug={listing.slug}
      listing={listing}
      requireBooking={requireBooking}
      onBlocked={onBookingBlocked}
      className={`card-shine group relative flex overflow-hidden bg-white transition duration-300 active:scale-[0.995] ${
        compact ? "min-h-[140px] rounded-2xl" : "rounded-2xl sm:rounded-3xl"
      } ${
        featured
          ? "ring-2 ring-brand/40 shadow-lg shadow-brand/15 hover:shadow-xl hover:shadow-brand/20"
          : "shadow-md shadow-stone-300/30 ring-1 ring-stone-900/[0.06] hover:-translate-y-0.5 hover:shadow-xl hover:ring-brand/25"
      }`}
    >
      <span className="absolute left-0 top-0 z-10 h-full w-1 scale-y-0 bg-gradient-to-b from-brand to-amber-400 transition-transform duration-300 group-hover:scale-y-100" />

      <div
        className={`relative shrink-0 self-stretch overflow-hidden bg-stone-200 ${
          compact
            ? "w-[118px] sm:w-[128px]"
            : "w-[140px] sm:w-[180px] md:w-[220px]"
        }`}
      >
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          loading="lazy"
          className="object-cover transition duration-700 group-hover:scale-110"
          sizes={compact ? "128px" : "220px"}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

        {listing.badge && (
          <span className="absolute left-2 top-2 rounded-lg bg-brand px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-md">
            {listing.badge}
          </span>
        )}

        <span className="absolute bottom-2 left-2 flex items-center gap-0.5 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-bold text-amber-800 shadow-sm backdrop-blur">
          <svg className="h-3 w-3 fill-amber-500" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {listing.rating}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5 sm:p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex rounded-full bg-brand-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-dark">
              {getCategoryLabel(listing.category)}
            </span>
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-100 bg-stone-50 text-stone-400 transition group-hover:border-brand/30 group-hover:bg-brand-muted group-hover:text-brand"
              aria-hidden
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </span>
          </div>

          <h3
            className={`mt-2 font-extrabold leading-snug text-foreground transition group-hover:text-brand-dark ${
              compact ? "line-clamp-2 text-sm" : "line-clamp-2 text-base sm:text-lg md:text-xl"
            }`}
          >
            {listing.title}
          </h3>

          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
            <svg className="h-3.5 w-3.5 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="truncate">{listing.location}</span>
          </p>

          {!compact && (
            <div className="mt-3 hidden flex-wrap gap-1.5 sm:flex">
              {[
                `${listing.guests} guests`,
                `${listing.beds} beds`,
                `${listing.baths} baths`,
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-stone-100 px-2 py-1 text-[10px] font-semibold text-stone-600"
                >
                  {tag}
                </span>
              ))}
              {listing.amenities?.slice(0, 2).map((a) => (
                <span
                  key={a}
                  className="rounded-md border border-brand/15 bg-brand-muted/50 px-2 py-1 text-[10px] font-semibold text-brand-dark"
                >
                  {a}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-stone-200 pt-3 sm:mt-4">
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className={`font-extrabold text-foreground ${compact ? "text-base" : "text-xl sm:text-2xl"}`}>
                {formatPrice(listing.price)}
              </span>
              <span className="text-xs font-medium text-muted">/ night</span>
            </div>
            {listing.originalPrice && (
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-xs text-muted line-through">
                  {formatPrice(listing.originalPrice)}
                </span>
                {savePct > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    −{savePct}%
                  </span>
                )}
              </div>
            )}
            {!compact && (
              <p className="mt-1 text-[10px] text-muted">{listing.reviews} reviews</p>
            )}
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand to-orange-500 font-bold text-white shadow-md shadow-brand/30 transition group-hover:brightness-105 ${
              compact ? "px-3 py-2 text-[11px]" : "px-4 py-2.5 text-xs sm:text-sm"
            }`}
          >
            View
            <svg className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </div>
    </PropertyBookingLink>
  );
}
