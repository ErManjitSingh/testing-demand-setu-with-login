"use client";

import Image from "next/image";
import {
  BadgeCheck,
  CalendarDays,
  Headset,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DestinationInput from "@/components/packages/shared/DestinationInput";
import TravellersPicker from "@/components/packages/shared/TravellersPicker";
import { useInView } from "@/hooks/useInView";
import { BUDGET_PRESETS } from "@/lib/packageFilters";
import { todayInputValue } from "@/lib/tourTravellers";

const SLIDES = [
  { id: "ladakh-escape", label: "Ladakh" },
  { id: "kerala-backwaters", label: "Kerala" },
  { id: "rajasthan-heritage", label: "Rajasthan" },
  { id: "maldives-paradise", label: "Maldives" },
  { id: "kashmir-paradise", label: "Kashmir" },
];

function CountUp({ to, decimals = 0, suffix = "" }) {
  const { ref, inView } = useInView({ rootMargin: "0px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const id = requestAnimationFrame(() => setValue(to));
      return () => cancelAnimationFrame(id);
    }
    let frame;
    const start = performance.now();
    const duration = 1400;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(to * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

export default function ListingHero({
  draft,
  onDraftChange,
  onSearch,
  suggestions,
  slideImages,
  total,
}) {
  const [slide, setSlide] = useState(0);
  const minDate = useMemo(() => todayInputValue(), []);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return undefined;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6500);
    return () => window.clearInterval(id);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <section className="relative isolate bg-stone-950 text-white">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            aria-hidden
            className={`absolute inset-0 transition-opacity duration-[1600ms] ease-in-out ${
              i === slide ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slideImages[s.id]}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover ${i === slide ? "packages-hero-bg-active" : ""}`}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/45 to-stone-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(234,88,12,0.35),transparent_55%)]" />
        <div aria-hidden className="pointer-events-none absolute -right-10 top-24 hidden h-56 w-56 rounded-full bg-orange-500/20 blur-3xl pk-drift lg:block" />
        <div aria-hidden className="pointer-events-none absolute -left-16 bottom-10 hidden h-64 w-64 rounded-full bg-amber-400/15 blur-3xl pk-drift lg:block" style={{ animationDelay: "-3s" }} />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-20">
        <div className="max-w-3xl">
          <p className="pk-fade-up pk-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide text-orange-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            {total}+ handcrafted itineraries · India & the world
          </p>
          <h1
            className="pk-fade-up mt-5 font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "90ms" }}
          >
            Find the trip that
            <span className="text-shimmer ml-3 italic">feels like you.</span>
          </h1>
          <p
            className="pk-fade-up mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
            style={{ animationDelay: "180ms" }}
          >
            Pick your dates and your people. We price every itinerary for exactly who is travelling —
            adults, children and infants included.
          </p>
        </div>

        {/* Search card */}
        <form
          onSubmit={submit}
          className="pk-fade-up relative z-20 mt-8 rounded-[1.75rem] bg-white p-2 text-stone-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/30 sm:mt-10 sm:rounded-full sm:p-2.5"
          style={{ animationDelay: "270ms" }}
          role="search"
          aria-label="Search tour packages"
        >
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1.1fr_1fr_auto] lg:items-center lg:gap-0 lg:divide-x lg:divide-stone-100">
            <DestinationInput
              value={draft.q}
              onChange={(q) => onDraftChange({ q })}
              suggestions={suggestions}
            />

            <label className="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-stone-50 focus-within:bg-stone-50 lg:rounded-none">
              <CalendarDays className="h-5 w-5 shrink-0 text-brand" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
                  Travel date
                </span>
                <input
                  type="date"
                  min={minDate}
                  value={draft.date}
                  onChange={(e) => onDraftChange({ date: e.target.value })}
                  className="input-no-ios-zoom block w-full bg-transparent text-sm font-bold text-stone-900 outline-none"
                  aria-label="Travel date"
                />
              </span>
            </label>

            <TravellersPicker
              variant="hero"
              label="Adults & children"
              value={draft.travellers}
              onChange={(travellers) => onDraftChange({ travellers })}
            />

            <label className="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-stone-50 focus-within:bg-stone-50 lg:rounded-none">
              <Wallet className="h-5 w-5 shrink-0 text-brand" />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
                  Budget / person
                </span>
                <select
                  value={draft.budget}
                  onChange={(e) => onDraftChange({ budget: e.target.value })}
                  className="input-no-ios-zoom block w-full cursor-pointer bg-transparent text-sm font-bold text-stone-900 outline-none"
                >
                  {BUDGET_PRESETS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <button
              type="submit"
              className="pk-sweep group mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-4 text-sm font-extrabold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark active:scale-[0.98] sm:col-span-2 lg:col-span-1 lg:mt-0 lg:ml-2"
            >
              <Search className="h-4 w-4 transition group-hover:scale-110" />
              Search trips
            </button>
          </div>
        </form>

        {/* Trust row */}
        <dl className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4">
          {[
            { icon: BadgeCheck, value: <CountUp to={total} suffix="+" />, label: "Curated packages" },
            { icon: Star, value: <CountUp to={4.8} decimals={1} />, label: "Average rating" },
            { icon: Users, value: <CountUp to={12500} suffix="+" />, label: "Happy travellers" },
            { icon: Headset, value: "24x7", label: "Trip support" },
          ].map((item, i) => (
            <div
              key={item.label}
              className="pk-fade-up pk-glass flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{ animationDelay: `${380 + i * 70}ms` }}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-orange-200">
                <item.icon className="h-5 w-5" />
              </span>
              <div>
                <dd className="text-xl font-extrabold leading-none tabular-nums">{item.value}</dd>
                <dt className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/65">
                  {item.label}
                </dt>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex items-center justify-between gap-4 text-xs font-semibold text-white/70">
          <p className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            Free itinerary changes · Pay 25% to confirm
          </p>
          <div className="flex items-center gap-1.5" aria-hidden>
            {SLIDES.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === slide ? "w-8 bg-orange-400" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
          <p className="hidden sm:block">Now showing · {SLIDES[slide].label}</p>
        </div>
      </div>
    </section>
  );
}
