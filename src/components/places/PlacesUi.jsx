import Image from "next/image";
import SafeImage from "@/components/places/SafeImage";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Castle,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  Droplets,
  Landmark,
  MapPin,
  Mountain,
  Route,
  ShoppingBag,
  Trees,
  Waves,
} from "lucide-react";
import { getStateImage } from "@/components/state/stateImageMap";
import { PLACE_TYPE_BY_ID, formatDuration, formatKm, placesHref } from "@/lib/places/placesText";

export const TYPE_ICONS = {
  passes: Route,
  waterfalls: Droplets,
  lakes: Waves,
  treks: Mountain,
  spiritual: Landmark,
  nature: Trees,
  heritage: Castle,
  leisure: ShoppingBag,
  sightseeing: Camera,
};

export function JsonLd({ data }) {
  const items = Array.isArray(data) ? data : [data];
  return items
    .filter(Boolean)
    .map((item, i) => (
      <script
        key={i}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
      />
    ));
}

export function placeImage(place) {
  return place.image || getStateImage(place.stateName);
}

/* --------------------------------- layout --------------------------------- */

const WRAP = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

export function Container({ className = "", children }) {
  return <div className={`${WRAP} ${className}`}>{children}</div>;
}

const BAND_TONES = {
  white: "bg-white",
  soft: "bg-stone-50",
  brand: "bg-brand-muted/60",
};

/** Full-width band: gives the page a clear rhythm of sections instead of one long column. */
export function Band({ tone = "white", labelledBy, id, className = "", children }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${BAND_TONES[tone] ?? BAND_TONES.white} scroll-mt-28 border-t border-stone-100 first:border-t-0`}
    >
      <div className={`${WRAP} py-12 sm:py-16 lg:py-20 ${className}`}>{children}</div>
    </section>
  );
}

export function Breadcrumbs({ items, className = "" }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-semibold text-white/70 sm:text-sm">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href} className="flex min-w-0 items-center gap-1.5">
              {i > 0 ? <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-white/40" /> : null}
              {last ? (
                <span aria-current="page" className="truncate text-white">
                  {item.name}
                </span>
              ) : (
                <Link href={item.href} className="transition hover:text-white">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const STAT_COLS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-2 sm:grid-cols-4" };

export function PlacesHero({ breadcrumbs, eyebrow, title, subtitle, image, stats = [], children }) {
  const cols = STAT_COLS[Math.min(Math.max(stats.length, 1), 4)];
  return (
    <>
      <section className="relative isolate overflow-hidden bg-stone-950 text-white">
        {image ? (
          <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
        ) : null}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-950/90 via-stone-950/60 to-stone-950/25" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30" />
        <div aria-hidden className="absolute -left-24 -top-24 -z-10 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />

        <div className={`${WRAP} pb-24 pt-7 sm:pb-28 sm:pt-10 lg:pb-36 lg:pt-12`}>
          <Breadcrumbs items={breadcrumbs} className="pk-fade" />

          <div className="mt-8 max-w-3xl sm:mt-12">
            {eyebrow ? (
              <p className="pk-fade-up inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-orange-100 backdrop-blur sm:text-xs">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={`pk-fade-up text-balance text-[2rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl ${eyebrow ? "mt-4" : ""}`}
              style={{ animationDelay: "60ms" }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className="pk-fade-up mt-4 max-w-2xl text-pretty text-sm font-medium leading-relaxed text-white/85 sm:text-lg"
                style={{ animationDelay: "120ms" }}
              >
                {subtitle}
              </p>
            ) : null}
            {children ? (
              <div className="pk-fade-up mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: "180ms" }}>
                {children}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {stats.length ? (
        <div className={`${WRAP} relative z-10 -mt-12 sm:-mt-14 lg:-mt-16`}>
          <dl className={`grid ${cols} overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_-24px_rgba(28,25,23,0.35)] ring-1 ring-stone-200/80`}>
            {stats.map((s) => (
              <div
                key={s.label}
                className={`border-stone-100 px-3 py-4 text-center sm:px-6 sm:py-6 ${
                  stats.length === 4
                    ? "[&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0 [&:nth-child(even)]:border-l sm:[&:not(:first-child)]:border-l"
                    : "[&:not(:first-child)]:border-l"
                }`}
              >
                <dd className={`font-extrabold leading-tight text-stone-900 ${String(s.value).length > 9 ? "text-base sm:text-2xl" : "text-xl leading-none sm:text-3xl"}`}>{s.value}</dd>
                <dt className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500 sm:text-xs">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, id, action, align = "left" }) {
  const center = align === "center";
  return (
    <div className={`flex flex-col gap-4 ${center ? "items-center text-center" : "sm:flex-row sm:items-end sm:justify-between"}`}>
      <div className={center ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? (
          <p className={`flex items-center gap-2.5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand sm:text-xs ${center ? "justify-center" : ""}`}>
            <span aria-hidden className="h-0.5 w-7 rounded-full bg-brand" />
            {eyebrow}
          </p>
        ) : null}
        <h2 id={id} className="mt-2.5 text-balance text-2xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        {subtitle ? <p className="mt-3 text-pretty text-sm font-medium leading-relaxed text-stone-600 sm:text-base">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------- cards --------------------------------- */

export function TypeBadge({ type, className = "" }) {
  const meta = PLACE_TYPE_BY_ID[type];
  const Icon = TYPE_ICONS[type] ?? Camera;
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-stone-800 shadow-sm ${className}`}
    >
      <Icon aria-hidden className="h-3.5 w-3.5 text-brand" />
      {meta.label}
    </span>
  );
}

const TYPE_ART = {
  passes: "from-sky-700 via-slate-800 to-stone-900",
  waterfalls: "from-cyan-700 via-slate-800 to-stone-900",
  lakes: "from-blue-700 via-slate-800 to-stone-900",
  treks: "from-emerald-700 via-stone-800 to-stone-900",
  spiritual: "from-orange-600 via-stone-800 to-stone-900",
  nature: "from-green-700 via-stone-800 to-stone-900",
  heritage: "from-amber-700 via-stone-800 to-stone-900",
  leisure: "from-rose-600 via-stone-800 to-stone-900",
  sightseeing: "from-orange-500 via-stone-800 to-stone-900",
};

/**
 * Card artwork: the place photo when it has one, otherwise a tinted placeholder with the category icon.
 * (Many places have no photo yet — repeating one stock picture on every card looks worse than this.)
 */
function CardArt({ place, alt, priority, sizes, imgClassName = "" }) {
  if (place.image) {
    return (
      <SafeImage
        src={place.image}
        fallback={getStateImage(place.stateName)}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={`object-cover ${imgClassName}`}
      />
    );
  }
  const Icon = TYPE_ICONS[place.type] ?? Camera;
  return (
    <div role="img" aria-label={alt} className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${TYPE_ART[place.type] ?? TYPE_ART.sightseeing}`}>
      <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle,#fff_1px,transparent_1px)] [background-size:18px_18px]" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-white/80 ring-1 ring-white/20 backdrop-blur-sm sm:h-20 sm:w-20">
          <Icon aria-hidden className="h-8 w-8 sm:h-10 sm:w-10" />
        </span>
      </span>
    </div>
  );
}

export function PlaceCard({ place, showCity = true, priority = false, className = "" }) {
  const href = placesHref.place(place.stateSlug, place.citySlug, place.slug);
  const km = formatKm(place.distanceKm);
  const dur = formatDuration(place.minutes);

  return (
    <Link
      href={href}
      className={`group flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(234,88,12,0.45)] hover:ring-brand/40 ${className}`}
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-stone-200">
        <CardArt
          place={place}
          alt={`${place.name}, ${place.city}`}
          priority={priority}
          sizes="(min-width:1280px) 380px, (min-width:640px) 45vw, 100vw"
          imgClassName="transition duration-700 ease-out group-hover:scale-105"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent" />
        <TypeBadge type={place.type} className="absolute left-3 top-3" />
        <span
          aria-hidden
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-stone-800 opacity-0 shadow transition group-hover:opacity-100"
        >
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="text-base font-extrabold leading-snug tracking-tight text-stone-900 transition group-hover:text-brand sm:text-lg">
          {place.name}
        </h3>
        {showCity ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-stone-500">
            <MapPin aria-hidden className="h-3.5 w-3.5 shrink-0 text-brand" />
            <span className="truncate">
              {place.city}, {place.stateName}
            </span>
          </p>
        ) : null}
        {place.blurb ? <p className="mt-2.5 line-clamp-3 text-sm font-medium leading-relaxed text-stone-600">{place.blurb}</p> : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone-100 pt-4 text-xs font-bold text-stone-600">
          {km ? (
            <span className="inline-flex items-center gap-1.5">
              <Route aria-hidden className="h-3.5 w-3.5 text-brand" />
              {km}
              {showCity ? ` from ${place.city}` : ""}
            </span>
          ) : null}
          {dur ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock aria-hidden className="h-3.5 w-3.5 text-brand" />~{dur}
            </span>
          ) : null}
          <span className="ml-auto inline-flex items-center gap-1 text-brand">
            Explore
            <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Big image-first card for the "must visit" row. */
export function FeaturedPlaceCard({ place, rank, priority = false }) {
  const href = placesHref.place(place.stateSlug, place.citySlug, place.slug);
  const km = formatKm(place.distanceKm);

  return (
    <Link
      href={href}
      className="group relative isolate flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl bg-stone-900 text-white ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl sm:min-h-[26rem]"
    >
      <div className="absolute inset-0 -z-10">
        <CardArt
          place={place}
          alt={`${place.name}, ${place.city}`}
          priority={priority}
          sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw"
          imgClassName="transition duration-700 group-hover:scale-105"
        />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-stone-950/95 via-stone-950/35 to-stone-950/10" />
      <span
        aria-hidden
        className="absolute left-5 top-4 font-serif text-6xl font-medium leading-none text-white/25 transition group-hover:text-brand/90"
      >
        {String(rank).padStart(2, "0")}
      </span>
      <TypeBadge type={place.type} className="absolute right-4 top-4" />

      <div className="p-5 sm:p-6">
        <p className="flex items-center gap-1.5 text-xs font-bold text-orange-200">
          <MapPin aria-hidden className="h-3.5 w-3.5" />
          {place.city}
          {km ? ` · ${km}` : ""}
        </p>
        <h3 className="mt-1.5 text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{place.name}</h3>
        {place.blurb ? <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed text-white/75">{place.blurb}</p> : null}
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-xs font-extrabold backdrop-blur transition group-hover:bg-brand">
          View details
          <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

/** Image tile that fills its grid cell (the parent grid decides the height). */
export function DestinationTile({ href, title, subtitle, image, fallback, count, countLabel = "places", featured = false, className = "" }) {
  return (
    <Link
      href={href}
      className={`group relative isolate block h-full overflow-hidden rounded-3xl bg-stone-900 text-white ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl ${className}`}
    >
      <SafeImage
        src={image}
        fallback={fallback}
        alt={`${title} tourist places`}
        fill
        sizes={featured ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"}
        className="-z-10 object-cover transition duration-700 group-hover:scale-105"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-transparent" />
      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-stone-800 shadow-sm sm:left-4 sm:top-4">
        {count} {count === 1 ? countLabel.replace(/s$/, "") : countLabel}
      </span>
      <span
        aria-hidden
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-brand sm:right-4 sm:top-4"
      >
        <ArrowUpRight className="h-4 w-4" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className={`font-serif font-medium leading-tight ${featured ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>{title}</h3>
        {subtitle ? (
          <p className={`mt-1.5 line-clamp-2 text-xs font-medium leading-snug text-white/75 sm:text-sm ${featured ? "" : "hidden sm:block"}`}>{subtitle}</p>
        ) : null}
      </div>
    </Link>
  );
}

/** Bento layout: first tile is large when there are enough tiles to balance it. */
export function DestinationGrid({ children, count }) {
  const bento = count >= 5;
  return (
    <div
      className={`grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 ${
        bento ? "auto-rows-[12.5rem] sm:auto-rows-[15rem] lg:auto-rows-[16rem]" : "auto-rows-[14rem] sm:auto-rows-[18rem]"
      }`}
    >
      {children}
    </div>
  );
}

/* ------------------------------ content blocks ----------------------------- */

/** Counts by place type, shown as a compact bar list. Works on full places or card places. */
export function TypeBreakdown({ places, max = 6 }) {
  const counts = new Map();
  for (const p of places) counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, max);
  const top = rows[0]?.[1] ?? 1;

  return (
    <ul className="space-y-3.5">
      {rows.map(([id, n]) => {
        const Icon = TYPE_ICONS[id] ?? Camera;
        return (
          <li key={id}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5 font-bold text-stone-800">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-muted text-brand">
                  <Icon aria-hidden className="h-4 w-4" />
                </span>
                <span className="truncate">{PLACE_TYPE_BY_ID[id]?.label ?? "Sightseeing"}</span>
              </span>
              <span className="font-extrabold text-stone-900">{n}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.max(8, Math.round((n / top) * 100))}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function SideCard({ title, icon: Icon, children, className = "" }) {
  return (
    <div className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6 ${className}`}>
      {title ? (
        <h2 className="flex items-center gap-2.5 text-base font-extrabold text-stone-900">
          {Icon ? (
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-muted text-brand">
              <Icon aria-hidden className="h-4 w-4" />
            </span>
          ) : null}
          {title}
        </h2>
      ) : null}
      <div className={title ? "mt-4" : ""}>{children}</div>
    </div>
  );
}

export function FaqSection({ faqs, title = "Frequently asked questions", subtitle, aside }) {
  if (!faqs?.length) return null;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.7fr] lg:gap-14">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <SectionHeader eyebrow="Good to know" title={title} subtitle={subtitle} id="places-faq" />
        {aside ? <div className="mt-6 hidden lg:block">{aside}</div> : null}
      </div>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details
            key={faq.q}
            className="group rounded-2xl bg-white ring-1 ring-stone-200 transition open:shadow-lg open:shadow-brand/5 open:ring-brand/40"
            open={i === 0}
          >
            <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-4 marker:content-none sm:items-center sm:gap-4 sm:px-6 sm:py-5 [&::-webkit-details-marker]:hidden">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand">
                <CircleHelp aria-hidden className="h-5 w-5" />
              </span>
              <h3 className="flex-1 pt-1 text-sm font-extrabold leading-snug text-stone-900 sm:pt-0 sm:text-base">{faq.q}</h3>
              <span aria-hidden className="pt-0.5 text-2xl font-bold leading-none text-brand transition group-open:rotate-45 sm:pt-0">
                +
              </span>
            </summary>
            <p className="px-4 pb-5 text-sm font-medium leading-relaxed text-stone-600 sm:pl-[5.25rem] sm:pr-6">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function CtaBand({ eyebrow, title, text, image, children }) {
  return (
    <section className="bg-white">
      <div className={`${WRAP} py-12 sm:py-16`}>
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-stone-950 px-6 py-10 text-white sm:px-12 sm:py-14 lg:px-16">
          {image ? <Image src={image} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-35" /> : null}
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-950 via-stone-950/85 to-stone-950/40" />
          <div aria-hidden className="absolute -right-16 -top-24 -z-10 h-80 w-80 rounded-full bg-brand/40 blur-3xl" />
          <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              {eyebrow ? <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-200">{eyebrow}</p> : null}
              <h2 className="mt-2 text-balance text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl lg:text-4xl">{title}</h2>
              {text ? <p className="mt-3 text-sm font-medium leading-relaxed text-white/75 sm:text-base">{text}</p> : null}
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Pagination({ page, totalPages, hrefFor }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let p = 1; p <= totalPages; p += 1) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages.at(-1) !== "…") pages.push("…");
  }

  const base = "grid h-10 min-w-10 place-items-center rounded-full px-3 text-sm font-extrabold transition";
  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={`${base} border border-stone-200 bg-white text-stone-700 hover:border-brand hover:text-brand`}>
          <ChevronLeft aria-label="Previous page" className="h-4 w-4" />
        </Link>
      ) : null}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-stone-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${p === page ? "bg-brand text-white shadow-md shadow-brand/30" : "border border-stone-200 bg-white text-stone-700 hover:border-brand hover:text-brand"}`}
          >
            {p}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={`${base} border border-stone-200 bg-white text-stone-700 hover:border-brand hover:text-brand`}>
          <ChevronRight aria-label="Next page" className="h-4 w-4" />
        </Link>
      ) : null}
    </nav>
  );
}

export function PackagesStrip({ packages, title, subtitle }) {
  if (!packages?.length) return null;
  return (
    <div>
      <SectionHeader
        eyebrow="Ready-made trips"
        title={title}
        subtitle={subtitle}
        id="places-packages"
        action={
          <Link
            href="/packages"
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-extrabold text-stone-800 transition hover:border-brand hover:text-brand sm:self-auto"
          >
            All packages <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        }
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <Link
            key={pkg.slug}
            href={`/packages/${pkg.slug}`}
            className="group flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-brand/40"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={pkg.image}
                alt={pkg.title}
                fill
                sizes="(min-width:1024px) 300px, (min-width:640px) 45vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-stone-800 shadow">
                {pkg.duration}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="line-clamp-2 text-base font-extrabold leading-snug text-stone-900 transition group-hover:text-brand">{pkg.title}</h3>
              <p className="mt-auto pt-3 text-xs font-bold text-stone-500">
                From <span className="text-base font-extrabold text-brand">₹{pkg.price.toLocaleString("en-IN")}</span> / person
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
