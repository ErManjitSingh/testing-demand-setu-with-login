"use client";

import Image from "next/image";
import { formatPackagePrice, getPackageImage } from "@/lib/tourPackages";

function MetaRow({ tourPackage }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
      <span className="inline-flex items-center gap-1.5">
        <PinIcon />
        {tourPackage.location}
      </span>
      <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:block" aria-hidden />
      <span className="inline-flex items-center gap-1.5">
        <ClockIcon />
        {tourPackage.duration}
      </span>
      <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:block" aria-hidden />
      <span className="inline-flex items-center gap-1">
        <StarIcon />
        <span className="font-semibold text-stone-800">{tourPackage.rating}</span>
        <span className="text-stone-400">({tourPackage.reviews})</span>
      </span>
    </div>
  );
}

function HighlightsList({ items, limit = 3 }) {
  return (
    <ul className="space-y-2">
      {items.slice(0, limit).map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-stone-600">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

function EnquireButton({ onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/btn inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105 ${className}`}
    >
      View details
      <ArrowIcon />
    </button>
  );
}

export default function PackageCard({ tourPackage, onViewDetails, variant = "default" }) {
  const savings =
    tourPackage.originalPrice &&
    Math.round(
      ((tourPackage.originalPrice - tourPackage.price) / tourPackage.originalPrice) * 100
    );

  if (variant === "hero") {
    return (
      <article className="overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white shadow-[0_8px_40px_-12px_rgba(28,25,23,0.12)]">
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          <div className="relative aspect-[16/11] lg:aspect-auto lg:min-h-[440px]">
            <Image
              src={getPackageImage(tourPackage)}
              alt={tourPackage.title}
              fill
              priority
              sizes="(max-width:1024px) 100vw, 55vw"
              className="object-cover"
            />
            {tourPackage.badge && (
              <span className="absolute left-5 top-5 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-900 shadow-lg">
                {tourPackage.badge}
              </span>
            )}
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
              {tourPackage.subtitle}
            </p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-4xl">
              {tourPackage.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-stone-600">
              {tourPackage.description}
            </p>

            <div className="mt-6">
              <MetaRow tourPackage={tourPackage} />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Highlights
                </p>
                <HighlightsList items={tourPackage.highlights} />
              </div>
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Included
                </p>
                <ul className="space-y-2">
                  {tourPackage.inclusions.slice(0, 4).map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-stone-600">
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-stone-100 pt-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                  Starting from
                </p>
                <p className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900">
                  {formatPackagePrice(tourPackage.price)}
                  <span className="ml-1 text-sm font-medium text-stone-400">/ person</span>
                </p>
                {savings > 0 && (
                  <p className="mt-1 text-xs font-semibold text-emerald-600">
                    Save {savings}% · was {formatPackagePrice(tourPackage.originalPrice)}
                  </p>
                )}
              </div>
              <EnquireButton onClick={() => onViewDetails(tourPackage)} />
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col">
      <div className="relative overflow-hidden rounded-[1.25rem] bg-stone-100">
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={getPackageImage(tourPackage)}
            alt={tourPackage.title}
            fill
            loading="lazy"
            sizes="(max-width:640px) 100vw, 33vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

          <div className="absolute left-4 top-4 flex flex-col gap-2">
            <span className="w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-stone-800 shadow-sm backdrop-blur">
              {tourPackage.duration}
            </span>
            {tourPackage.badge && (
              <span className="w-fit rounded-full bg-stone-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                {tourPackage.badge}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
          {tourPackage.subtitle}
        </p>
        <h3 className="mt-2 text-xl font-bold leading-snug tracking-tight text-stone-900">
          {tourPackage.title}
        </h3>

        <div className="mt-3">
          <MetaRow tourPackage={tourPackage} />
        </div>

        <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-stone-500">
          {tourPackage.description}
        </p>

        <div className="mt-5">
          <HighlightsList items={tourPackage.highlights} limit={2} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-stone-200/80 pt-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">From</p>
            <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-stone-900">
              {formatPackagePrice(tourPackage.price)}
            </p>
            {savings > 0 && (
              <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">{savings}% off</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onViewDetails(tourPackage)}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
          >
            Details
            <ArrowIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4 transition group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}
