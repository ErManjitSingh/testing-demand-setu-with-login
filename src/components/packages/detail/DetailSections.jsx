"use client";

import Image from "next/image";
import {
  Backpack,
  BedDouble,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Flame,
  Gauge,
  Heart,
  MapPin,
  Mountain,
  Plane,
  Quote,
  ShieldAlert,
  Sparkles,
  Star,
  ThumbsUp,
  Users,
  Utensils,
  Wifi,
  X,
  Sun,
  CircleHelp,
  Wallet,
  Info,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AnimateIn from "@/components/packages/AnimateIn";
import { useInView } from "@/hooks/useInView";
import { formatPackagePrice } from "@/lib/tourPackages";
import { formatDisplayDate } from "@/lib/tourTravellers";

export function SectionHeading({ id, eyebrow, title, subtitle, children }) {
  return (
    <div id={id} className="scroll-mt-40 sm:scroll-mt-44">
      <AnimateIn>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-serif text-lg italic text-brand">{eyebrow}</p>
            <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">{title}</h2>
            {subtitle ? <p className="mt-1 max-w-2xl text-sm text-stone-500">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </AnimateIn>
    </div>
  );
}

const FACT_ICONS = {
  duration: Clock,
  group: Users,
  best: Sun,
  pickup: MapPin,
  difficulty: Gauge,
  meals: Utensils,
};

export function QuickFacts({ facts }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {facts.map((fact, i) => {
        const Icon = FACT_ICONS[fact.key] ?? Info;
        return (
          <li
            key={fact.key}
            className="pk-fade-up flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-stone-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-stone-400">
                {fact.label}
              </span>
              <span className="block truncate text-sm font-extrabold text-stone-900" title={fact.value}>
                {fact.value}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const HIGHLIGHT_ICONS = [Camera, Compass, Heart, Mountain, Sparkles, Sun];

export function HighlightsGrid({ highlights, description }) {
  return (
    <div>
      <p className="text-base leading-relaxed text-stone-600 sm:text-lg">{description}</p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {highlights.map((h, i) => {
          const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length];
          return (
            <AnimateIn key={h} as="li" delay={i * 80}>
              <div className="group h-full rounded-3xl bg-gradient-to-br from-white to-brand-muted p-5 ring-1 ring-stone-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-brand/30">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white shadow-md shadow-brand/30 transition group-hover:rotate-6 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>
                <p className="mt-4 text-base font-extrabold text-stone-900">{h}</p>
                <p className="mt-1 text-sm text-stone-500">Included in your day-wise plan with a local guide.</p>
              </div>
            </AnimateIn>
          );
        })}
      </ul>
    </div>
  );
}

export function InclusionsExclusions({ inclusions, exclusions }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AnimateIn direction="left">
        <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-emerald-200/70">
          <h3 className="flex items-center gap-2 text-lg font-extrabold text-stone-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <Check className="h-5 w-5" strokeWidth={3} />
            </span>
            What&apos;s included
          </h3>
          <ul className="mt-5 space-y-3">
            {inclusions.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm font-medium text-stone-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </AnimateIn>
      <AnimateIn direction="right">
        <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-rose-200/70">
          <h3 className="flex items-center gap-2 text-lg font-extrabold text-stone-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-rose-700">
              <X className="h-5 w-5" strokeWidth={3} />
            </span>
            Not included
          </h3>
          <ul className="mt-5 space-y-3">
            {exclusions.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm font-medium text-stone-700">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </AnimateIn>
    </div>
  );
}

const AMENITY_ICON = { "Free Wi-Fi": Wifi, Restaurant: Utensils, Breakfast: Utensils };

export function StaysList({ hotels }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {hotels.map((hotel, i) => (
        <AnimateIn key={hotel.id} delay={i * 80}>
          <article className="group flex h-full overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200/70 transition duration-300 hover:shadow-lg hover:ring-brand/30">
            <div className="relative w-32 shrink-0 sm:w-40">
              <Image
                src={hotel.image}
                alt={hotel.name}
                fill
                sizes="160px"
                className="object-cover transition duration-700 group-hover:scale-110"
              />
            </div>
            <div className="min-w-0 flex-1 p-4">
              <p className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-brand">
                <MapPin className="h-3 w-3" />
                {hotel.place} · {hotel.nights}N
              </p>
              <h3 className="mt-1 text-base font-extrabold leading-snug text-stone-900">{hotel.name}</h3>
              <p className="text-xs font-bold tracking-widest text-amber-500" aria-label={`${hotel.stars} star`}>
                {"★".repeat(hotel.stars)}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {hotel.amenities.map((a) => {
                  const Icon = AMENITY_ICON[a] ?? BedDouble;
                  return (
                    <li
                      key={a}
                      className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-600"
                    >
                      <Icon className="h-3 w-3" />
                      {a}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-[11px] font-medium text-stone-400">{hotel.note}</p>
            </div>
          </article>
        </AnimateIn>
      ))}
    </div>
  );
}

const LABEL_STYLE = {
  "Best price": "bg-emerald-500 text-white",
  Peak: "bg-rose-500 text-white",
  "Filling fast": "bg-amber-400 text-stone-900",
  Available: "bg-stone-200 text-stone-700",
};

export function DepartureStrip({ departures, selected, onSelect }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-3 pt-3 sm:mx-0 sm:px-0">
      {departures.map((d) => {
        const active = selected === d.date;
        return (
          <button
            key={d.date}
            type="button"
            onClick={() => onSelect(d.date)}
            aria-pressed={active}
            className={`group relative w-36 shrink-0 rounded-3xl border p-4 text-left transition duration-300 active:scale-95 ${
              active
                ? "border-brand bg-brand text-white shadow-xl shadow-brand/30"
                : "border-stone-200 bg-white hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
            }`}
          >
            <span
              className={`absolute -top-2.5 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shadow ${
                active ? "bg-white text-brand" : LABEL_STYLE[d.label]
              }`}
            >
              {d.label}
            </span>
            <span className={`block text-[11px] font-bold uppercase tracking-wider ${active ? "text-white/75" : "text-stone-400"}`}>
              {formatDisplayDate(d.date, { weekday: "short" })}
            </span>
            <span className="mt-0.5 block text-2xl font-extrabold leading-none">
              {formatDisplayDate(d.date, { day: "numeric" })}
              <span className="ml-1 text-sm font-bold">{formatDisplayDate(d.date, { month: "short" })}</span>
            </span>
            <span className={`mt-3 block text-sm font-extrabold ${active ? "text-white" : "text-stone-900"}`}>
              {formatPackagePrice(d.price)}
            </span>
            <span className={`mt-0.5 flex items-center gap-1 text-[11px] font-semibold ${active ? "text-white/80" : "text-rose-600"}`}>
              <Flame className="h-3 w-3" />
              {d.seatsLeft} seats left
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RatingBar({ stars, count, total, delay }) {
  const { ref, inView } = useInView({ rootMargin: "0px" });
  const pct = total ? (count / total) * 100 : 0;
  return (
    <div ref={ref} className="flex items-center gap-3 text-xs font-bold text-stone-600">
      <span className="flex w-8 items-center gap-0.5">
        {stars}
        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      </span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
        <span
          className="block h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-1000 ease-out"
          style={{ width: inView ? `${pct}%` : "0%", transitionDelay: `${delay}ms` }}
        />
      </span>
      <span className="w-8 text-right tabular-nums text-stone-400">{count}</span>
    </div>
  );
}

function Stars({ value, size = "h-4 w-4" }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${size} ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"}`} />
      ))}
    </span>
  );
}

export function ReviewsSection({ reviews }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <AnimateIn>
        <div className="rounded-3xl bg-white p-6 ring-1 ring-stone-200/70">
          <div className="flex items-end gap-3">
            <span className="text-6xl font-extrabold leading-none tracking-tight text-stone-900">{reviews.average}</span>
            <div className="pb-1">
              <Stars value={reviews.average} size="h-5 w-5" />
              <p className="mt-1 text-xs font-bold text-stone-500">{reviews.total} verified reviews</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {reviews.distribution.map((row, i) => (
              <RatingBar key={row.stars} {...row} total={reviews.total} delay={i * 90} />
            ))}
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-dashed border-stone-200 pt-5">
            {reviews.categories.map((c) => (
              <div key={c.label}>
                <dt className="text-[11px] font-bold text-stone-500">{c.label}</dt>
                <dd className="flex items-center gap-1.5 text-sm font-extrabold text-stone-900">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {c.score.toFixed(1)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </AnimateIn>

      <ul className="grid gap-4 sm:grid-cols-2">
        {reviews.items.map((r, i) => (
          <AnimateIn key={r.id} as="li" delay={i * 80}>
            <figure className="relative h-full overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-stone-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <Quote className="absolute right-4 top-4 h-10 w-10 text-brand/10" />
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-brand text-sm font-extrabold text-white">
                  {r.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <p className="text-sm font-extrabold text-stone-900">{r.name}</p>
                  <p className="text-xs font-semibold text-stone-500">
                    {r.from} · {r.tripType} · {r.month}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <Stars value={r.rating} />
              </div>
              <blockquote className="mt-2 text-sm leading-relaxed text-stone-600">{r.text}</blockquote>
              <figcaption className="mt-4 flex items-center gap-1.5 text-xs font-bold text-stone-400">
                <ThumbsUp className="h-3.5 w-3.5" />
                {r.helpful} found this helpful
              </figcaption>
            </figure>
          </AnimateIn>
        ))}
      </ul>
    </div>
  );
}

const TONE = {
  good: "bg-emerald-500",
  ok: "bg-lime-500",
  warn: "bg-amber-500",
  bad: "bg-rose-500",
};

export function PolicyTabs({ policies, thingsToCarry }) {
  const tabs = [
    { id: "cancel", label: "Cancellation", icon: ShieldAlert },
    { id: "payment", label: "Payment", icon: Wallet },
    { id: "carry", label: "Things to carry", icon: Backpack },
    { id: "know", label: "Good to know", icon: Info },
  ];
  const [tab, setTab] = useState("cancel");

  return (
    <div className="rounded-3xl bg-white p-4 ring-1 ring-stone-200/70 sm:p-6">
      <div role="tablist" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition active:scale-95 ${
              tab === id ? "bg-stone-900 text-white shadow-md" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div key={tab} role="tabpanel" className="pk-fade mt-5">
        {tab === "cancel" ? (
          <div>
            <ol className="grid gap-3 sm:grid-cols-4">
              {policies.cancellation.map((c) => (
                <li key={c.window} className="rounded-2xl bg-stone-50 p-4">
                  <span className={`block h-1.5 w-10 rounded-full ${TONE[c.tone]}`} />
                  <p className="mt-3 text-xs font-bold text-stone-500">{c.window}</p>
                  <p className="mt-1 text-lg font-extrabold text-stone-900">{c.refund}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs font-medium text-stone-500">
              Refund slabs are indicative. The exact terms are written into your quote before you pay anything.
            </p>
          </div>
        ) : null}
        {tab === "payment" ? (
          <ul className="space-y-3">
            {policies.payment.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm font-medium text-stone-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
                {p}
              </li>
            ))}
          </ul>
        ) : null}
        {tab === "carry" ? (
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {thingsToCarry.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm font-medium text-stone-700">
                <Backpack className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {p}
              </li>
            ))}
          </ul>
        ) : null}
        {tab === "know" ? (
          <ul className="space-y-3">
            {policies.notes.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm font-medium text-stone-700">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
                {p}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export function FaqAccordion({ faqs }) {
  const [open, setOpen] = useState(0);
  return (
    <ul className="space-y-3">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <li key={f.q} className={`overflow-hidden rounded-2xl bg-white ring-1 transition ${isOpen ? "ring-brand/40 shadow-md" : "ring-stone-200/70"}`}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 p-4 text-left sm:p-5"
            >
              <span className="flex items-center gap-3 text-sm font-extrabold text-stone-900 sm:text-base">
                <CircleHelp className={`h-5 w-5 shrink-0 transition ${isOpen ? "text-brand" : "text-stone-400"}`} />
                {f.q}
              </span>
              <ChevronDown className={`h-5 w-5 shrink-0 text-stone-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand" : ""}`} />
            </button>
            <div className="pk-collapse" data-open={isOpen}>
              <div>
                <p className="px-4 pb-5 pl-12 text-sm leading-relaxed text-stone-600 sm:px-5 sm:pl-[3.25rem]">{f.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Scrollspy tabs that stick under the site header. */
export function SectionNav({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);
  const barRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // The active tab is the last section whose heading has scrolled past the sticky bars.
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 200) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [sections]);

  useEffect(() => {
    const btn = barRef.current?.querySelector(`[data-id="${active}"]`);
    btn?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="Trip sections"
      className="sticky top-[68px] z-30 -mx-4 border-b border-stone-200/70 bg-[#f6f3ee]/90 px-4 backdrop-blur-xl sm:top-[80px] sm:mx-0 sm:rounded-full sm:border sm:bg-white/90 sm:px-2 sm:shadow-sm"
    >
      <div ref={barRef} className="no-scrollbar flex gap-1 overflow-x-auto py-2">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            data-id={s.id}
            aria-current={active === s.id ? "true" : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              active === s.id ? "bg-brand text-white shadow-md shadow-brand/30" : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {s.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function TrustRow() {
  const items = [
    { icon: Calendar, label: "Free itinerary changes" },
    { icon: Plane, label: "Flights & visa assistance" },
    { icon: Check, label: "Verified hotels" },
    { icon: Users, label: "24x7 trip coordinator" },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-2.5 rounded-2xl bg-white/70 px-3.5 py-3 text-xs font-extrabold text-stone-700 ring-1 ring-stone-200/70">
          <Icon className="h-4 w-4 shrink-0 text-brand" />
          {label}
        </li>
      ))}
    </ul>
  );
}
