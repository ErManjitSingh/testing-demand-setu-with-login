"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BedDouble,
  Camera,
  CarFront,
  Clock,
  Flame,
  MapPin,
  MessageCircle,
  Plane,
  Star,
  Sun,
  Utensils,
} from "lucide-react";
import { useMemo } from "react";
import { getThemeIcon } from "@/components/packages/shared/themeIcons";
import WishlistButton from "@/components/packages/shared/WishlistButton";
import { buildDetailHref, isInSeason, monthIndexFromDate } from "@/lib/packageFilters";
import { calculateTripPrice } from "@/lib/tourPackageDetails";
import { THEME_BY_ID } from "@/lib/tourPackageMeta";
import { formatPackagePrice } from "@/lib/tourPackages";
import { formatTravellerSummary, totalTravellers } from "@/lib/tourTravellers";

function Facts({ pkg }) {
  const { meta } = pkg;
  const items = [
    { icon: BedDouble, label: `${meta.stars}★ stays` },
    { icon: Utensils, label: meta.mealPlan === "Breakfast" ? "Breakfast" : meta.mealPlan },
    { icon: CarFront, label: "Private cab" },
    meta.flightsIncluded
      ? { icon: Plane, label: "Flights assist" }
      : { icon: Camera, label: "Sightseeing" },
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2">
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600">
          <Icon className="h-3.5 w-3.5 text-brand" />
          {label}
        </li>
      ))}
    </ul>
  );
}

function Price({ pkg, filters, estimate }) {
  const { meta } = pkg;
  const travellers = filters.travellers;
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Starting from</p>
      <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
        <span className="text-2xl font-extrabold tracking-tight text-stone-900">
          {formatPackagePrice(pkg.price)}
        </span>
        {pkg.originalPrice ? (
          <span className="text-sm font-semibold text-stone-400 line-through">
            {formatPackagePrice(pkg.originalPrice)}
          </span>
        ) : null}
        <span className="text-xs font-semibold text-stone-500">/ person</span>
      </div>
      <p className="mt-1 text-[11px] font-semibold text-stone-500">
        <span className="text-stone-700">≈ {formatPackagePrice(estimate.total)}</span> for{" "}
        {formatTravellerSummary(travellers).toLowerCase().replace(/ · /g, ", ")} · incl. taxes
      </p>
      {meta.discount > 0 ? (
        <span className="mt-1.5 inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          You save {meta.discount}%
        </span>
      ) : null}
    </div>
  );
}

export default function ListingPackageCard({ pkg, filters, view = "grid", index = 0, onEnquire, priority = false }) {
  const { meta } = pkg;
  const href = buildDetailHref(pkg.slug, filters);
  const month = monthIndexFromDate(filters.date);
  const hasDate = month != null;
  const inSeason = hasDate && isInSeason(meta.bestTime, month);

  const estimate = useMemo(
    () =>
      calculateTripPrice({
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        adults: filters.travellers.adults,
        childAges: filters.travellers.childAges,
        infants: filters.travellers.infants,
      }),
    [pkg.price, pkg.originalPrice, filters.travellers]
  );

  const isList = view === "list";
  const delay = Math.min(index, 8) * 55;
  const travellerCount = totalTravellers(filters.travellers);

  return (
    <article
      className={`pk-fade-up group relative overflow-hidden rounded-[1.75rem] bg-white shadow-[0_2px_20px_-8px_rgba(28,25,23,0.18)] ring-1 ring-stone-200/70 transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-24px_rgba(234,88,12,0.35)] hover:ring-brand/30 ${
        isList ? "grid md:grid-cols-[minmax(0,320px)_1fr]" : "flex flex-col"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Media */}
      <div className={`relative overflow-hidden ${isList ? "min-h-[240px]" : "aspect-[4/3]"}`}>
        <Link href={href} className="absolute inset-0" aria-label={`View ${pkg.title}`} tabIndex={-1}>
          <Image
            src={pkg.image}
            alt={pkg.title}
            fill
            priority={priority}
            sizes={isList ? "(min-width:768px) 320px, 100vw" : "(min-width:1280px) 340px, (min-width:640px) 45vw, 100vw"}
            className="object-cover transition duration-[900ms] ease-out group-hover:scale-110"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-stone-950/25" />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {pkg.badge ? (
            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-900 shadow-md">
              {pkg.badge}
            </span>
          ) : null}
          {hasDate ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-md ${
                inSeason ? "bg-emerald-500 text-white" : "bg-amber-400 text-stone-900"
              }`}
            >
              <Sun className="h-3 w-3" />
              {inSeason ? "Great time to go" : "Off-season"}
            </span>
          ) : null}
        </div>

        <WishlistButton packageId={pkg.id} className="absolute right-3 top-3" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-950/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            <Clock className="h-3.5 w-3.5 text-orange-300" />
            {pkg.duration}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-xs font-extrabold text-stone-900 shadow-md">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {pkg.rating}
            <span className="font-semibold text-stone-400">({pkg.reviews})</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className={`flex flex-1 flex-col p-5 ${isList ? "md:grid md:grid-cols-[1fr_auto] md:gap-6 md:p-6" : ""}`}>
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
            <MapPin className="h-3.5 w-3.5" />
            {pkg.location}
            {meta.international ? <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] text-stone-600">Intl</span> : null}
          </p>
          <h3 className="mt-2 text-xl font-extrabold leading-snug tracking-tight text-stone-900">
            <Link href={href} className="transition hover:text-brand">
              {pkg.title}
            </Link>
          </h3>
          <p className="mt-1 text-sm font-medium text-stone-500">{pkg.subtitle}</p>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {meta.themes.slice(0, 3).map((id) => {
              const Icon = getThemeIcon(id);
              return (
                <li
                  key={id}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-muted px-2.5 py-1 text-[11px] font-bold text-brand-dark"
                >
                  <Icon className="h-3 w-3" />
                  {THEME_BY_ID[id]?.label}
                </li>
              );
            })}
          </ul>

          <p className={`mt-3 text-sm leading-relaxed text-stone-600 ${isList ? "line-clamp-2" : "line-clamp-2"}`}>
            {pkg.description}
          </p>

          <div className="mt-4">
            <Facts pkg={pkg} />
          </div>

          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1.5 text-rose-600">
              <span className="pk-ping relative grid h-2 w-2 place-items-center rounded-full bg-rose-500 text-rose-500" />
              Only {meta.seatsLeft} seats left on next departure
            </span>
            <span className="inline-flex items-center gap-1 text-stone-500">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {meta.bookedThisMonth} booked this month
            </span>
          </p>
        </div>

        <div
          className={`mt-5 flex flex-col gap-4 border-t border-dashed border-stone-200 pt-4 ${
            isList ? "md:mt-0 md:min-w-[230px] md:justify-between md:border-l md:border-t-0 md:pl-6 md:pt-0" : "mt-auto"
          }`}
        >
          <Price pkg={pkg} filters={filters} estimate={estimate} />
          <div className="flex items-center gap-2">
            <Link
              href={href}
              className="pk-sweep group/btn inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-brand/30 transition hover:bg-brand-dark active:scale-[0.98]"
            >
              View details
              <ArrowRight className="h-4 w-4 transition group-hover/btn:translate-x-1" />
            </Link>
            <button
              type="button"
              onClick={() => onEnquire?.(pkg)}
              aria-label={`Quick enquiry for ${pkg.title}`}
              title={`Quick enquiry · ${travellerCount} traveller${travellerCount === 1 ? "" : "s"}`}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-stone-200 bg-white text-brand transition hover:border-brand hover:bg-brand-muted active:scale-95"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
