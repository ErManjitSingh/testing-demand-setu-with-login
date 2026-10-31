"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSnapScroll } from "@/components/packages/useSnapScroll";

/**
 * Home-page "rail": a white rounded card with a bold title and a horizontally scrolling row of tiles
 * (arrows top-right). `variant="theme"` is the cream "explore by theme" panel with a lead-in on the left.
 */
export default function HomeRail({
  id,
  title,
  subtitle,
  action = null,
  footer = null,
  toolbar = null,
  variant = "card",
  children,
}) {
  const { scrollerRef, scrollPrev, scrollNext } = useSnapScroll();
  const headingId = id ? `${id}-heading` : undefined;

  const arrows = (
    <div className="flex shrink-0 items-center overflow-hidden rounded-full border border-stone-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Scroll left"
        className="grid h-9 w-10 place-items-center text-stone-500 transition hover:bg-brand-muted hover:text-brand"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <span aria-hidden className="h-5 w-px bg-stone-200" />
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Scroll right"
        className="grid h-9 w-10 place-items-center text-stone-500 transition hover:bg-brand-muted hover:text-brand"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );

  const row = (
    <div
      ref={scrollerRef}
      className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto scroll-smooth px-1 pb-1 sm:gap-4"
    >
      {children}
    </div>
  );

  if (variant === "theme") {
    return (
      <section id={id} aria-labelledby={headingId} className="px-3 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff7ec] via-[#fdf1e2] to-[#fbe7d0] shadow-sm ring-1 ring-orange-100 sm:rounded-3xl">
          <div className="grid gap-5 p-4 sm:p-7 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-center lg:gap-8">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand">Explore</p>
              <h2 id={headingId} className="mt-1 text-3xl font-extrabold leading-[1.05] tracking-tight text-[#7a2e12] sm:text-4xl">
                {title}
              </h2>
              {subtitle ? <p className="mt-3 max-w-xs text-sm font-medium leading-relaxed text-stone-600">{subtitle}</p> : null}
              <div className="mt-4 hidden lg:block">{arrows}</div>
            </div>
            <div className="min-w-0">
              {row}
              <div className="mt-3 flex justify-end lg:hidden">{arrows}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} aria-labelledby={headingId} className="px-3 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-3xl sm:p-7">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id={headingId} className="text-2xl font-extrabold leading-tight tracking-tight text-stone-950 sm:text-4xl">
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-sm font-medium text-stone-600 sm:text-base">{subtitle}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {action}
            {arrows}
          </div>
        </header>
        {toolbar}
        <div className="mt-5 sm:mt-6">{row}</div>
        {footer}
      </div>
    </section>
  );
}

const SIZES = {
  md: "w-[9.5rem] sm:w-[11rem] lg:w-[11.75rem]",
  lg: "w-[12.5rem] sm:w-[14rem] lg:w-[15rem]",
};

/** Tall photo tile with the label bottom-left. Pass `href` for a link, `onClick` for a button. */
export function RailCard({ href, onClick, image, title, sub, price, badge, size = "md", ariaLabel }) {
  const className = `group relative block shrink-0 snap-start overflow-hidden rounded-xl bg-stone-200 text-left shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${SIZES[size]} ${
    size === "lg" ? "aspect-[3/4]" : "aspect-[3/4.3]"
  }`;

  const inner = (
    <>
      <Image
        src={image}
        alt=""
        fill
        loading="lazy"
        sizes={size === "lg" ? "240px" : "190px"}
        className="object-cover transition duration-700 group-hover:scale-105"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
      {badge ? (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-stone-900">
          {badge}
        </span>
      ) : null}
      <span className="absolute inset-x-0 bottom-0 p-3 text-white">
        <span className={`block font-extrabold leading-tight ${size === "lg" ? "text-lg" : "text-sm sm:text-[15px]"}`}>{title}</span>
        {sub ? <span className="mt-0.5 line-clamp-2 block text-[11px] font-medium leading-snug text-white/80">{sub}</span> : null}
        {price ? <span className="mt-1.5 inline-block rounded-md bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white">{price}</span> : null}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} data-snap-card aria-label={ariaLabel} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} data-snap-card aria-label={ariaLabel} className={`${className} cursor-pointer`}>
      {inner}
    </button>
  );
}
