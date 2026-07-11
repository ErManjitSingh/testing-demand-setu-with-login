"use client";

import Image from "next/image";
import PropertyBookingLink from "@/components/booking/PropertyBookingLink";
import { useBookingGate } from "@/components/booking/BookingGateProvider";
import { formatPrice, getCategoryLabel } from "@/lib/listings";

export default function PropertyCard({
  listing,
  variant = "grid",
  featured = false,
  requireBooking: requireBookingProp,
  onBookingBlocked: onBookingBlockedProp,
}) {
  const gate = useBookingGate();
  const requireBooking = requireBookingProp ?? gate.requireBooking ?? false;
  const onBookingBlocked = onBookingBlockedProp ?? gate.onBookingBlocked;

  const isHorizontal = variant === "horizontal";

  if (featured) {
    return (
      <PropertyBookingLink
        slug={listing.slug}
        listing={listing}
        requireBooking={requireBooking}
        onBlocked={onBookingBlocked}
        className="card-shine group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-3xl shadow-2xl shadow-stone-900/20 ring-1 ring-stone-900/10 sm:min-h-[320px]"
      >
        <div className="relative min-h-[240px] flex-1 sm:min-h-[280px] lg:absolute lg:inset-0 lg:min-h-0">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            loading="lazy"
            sizes="(max-width:1024px) 100vw, 60vw"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 lg:z-10" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent opacity-60 lg:z-10" />

        {listing.badge && (
          <span className="absolute left-5 top-5 z-20 rounded-full bg-brand px-3 py-1 text-xs font-bold text-white shadow-lg">
            {listing.badge}
          </span>
        )}

        <div className="relative z-20 mt-auto bg-gradient-to-t from-black/90 to-transparent p-6 text-white lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:mt-0 lg:bg-none">
          <span className="text-xs font-semibold uppercase tracking-widest text-orange-200">
            {getCategoryLabel(listing.category)}
          </span>
          <h3
            className="mt-1 truncate text-2xl font-extrabold leading-tight sm:text-3xl"
            title={listing.title}
          >
            {listing.title}
          </h3>
          <p className="mt-1 text-sm text-stone-300">{listing.location}</p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-sm font-bold backdrop-blur">
                ★ {listing.rating}
              </span>
              <span className="text-sm text-stone-300">
                {listing.reviews} reviews
              </span>
            </div>
            <p className="text-xl font-extrabold">
              {formatPrice(listing.price)}
              <span className="text-sm font-normal text-stone-400"> /night</span>
            </p>
          </div>
        </div>
      </PropertyBookingLink>
    );
  }

  return (
    <PropertyBookingLink
      slug={listing.slug}
      listing={listing}
      requireBooking={requireBooking}
      onBlocked={onBookingBlocked}
      className={`card-shine group overflow-hidden rounded-2xl bg-surface shadow-md shadow-stone-300/25 ring-1 ring-stone-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand/10 hover:ring-brand/20 active:scale-[0.99] ${
        isHorizontal ? "flex h-full gap-4 p-3" : "block"
      }`}
    >
      <div
        className={`relative overflow-hidden bg-stone-200 ${
          isHorizontal
            ? "h-full min-h-[120px] w-36 shrink-0 rounded-2xl sm:w-40"
            : "aspect-[5/4] w-full"
        }`}
      >
        <Image
          src={listing.image}
          alt={listing.title}
          fill
          loading="lazy"
          sizes={isHorizontal ? "128px" : "(max-width:640px) 100vw, 33vw"}
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

        <span className="absolute left-3 top-3 rounded-lg bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
          {getCategoryLabel(listing.category)}
        </span>

        {listing.badge && (
          <span className="absolute bottom-3 left-3 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold text-white shadow-md">
            {listing.badge}
          </span>
        )}

        <span
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-stone-400 shadow-lg backdrop-blur transition group-hover:scale-110 group-hover:text-brand"
          aria-hidden
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </span>

        {!isHorizontal && (
          <div className="absolute bottom-3 right-3 flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full ${i === 0 ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={
          isHorizontal
            ? "flex min-w-0 flex-1 flex-col justify-center py-1"
            : "p-4"
        }
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className="truncate text-base font-bold leading-snug text-foreground group-hover:text-brand-dark"
              title={listing.title}
            >
              {listing.title}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted">
              <svg className="h-3.5 w-3.5 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {listing.location}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-0.5 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200/80">
            ★ {listing.rating}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {[`${listing.guests} guests`, `${listing.beds} beds`].map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-end justify-between border-t border-dashed border-border pt-3">
          <p className="flex flex-wrap items-baseline gap-1">
            <span className="text-lg font-extrabold text-foreground">
              {formatPrice(listing.price)}
            </span>
            <span className="text-xs text-muted">/ night</span>
          </p>
          {listing.originalPrice && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Save{" "}
              {Math.round(
                ((listing.originalPrice - listing.price) /
                  listing.originalPrice) *
                  100
              )}
              %
            </span>
          )}
        </div>
      </div>
    </PropertyBookingLink>
  );
}
