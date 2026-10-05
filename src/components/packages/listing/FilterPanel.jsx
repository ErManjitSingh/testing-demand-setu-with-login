"use client";

import { Check, ChevronDown, RotateCcw, Star } from "lucide-react";
import { useState } from "react";
import { getThemeIcon } from "@/components/packages/shared/themeIcons";
import { PERK_FILTERS, RATING_OPTIONS } from "@/lib/packageFilters";
import { DURATION_BUCKETS, PACKAGE_THEMES } from "@/lib/tourPackageMeta";

const inr = (n) => `₹${n.toLocaleString("en-IN")}`;

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-stone-100 py-5 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-sm font-extrabold tracking-tight text-stone-900">{title}</h3>
        <ChevronDown
          className={`h-4 w-4 text-stone-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className="pk-collapse" data-open={open}>
        <div>
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function CheckRow({ checked, onChange, children, count }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 rounded-xl px-1 py-1.5 transition hover:bg-stone-50">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-brand/40 ${
          checked ? "border-brand bg-brand text-white" : "border-stone-300 bg-white group-hover:border-brand/60"
        }`}
      >
        <Check className={`h-3 w-3 transition-transform ${checked ? "scale-100" : "scale-0"}`} strokeWidth={3.5} />
      </span>
      <span className="flex-1 text-sm font-semibold text-stone-700">{children}</span>
      {count != null ? <span className="text-xs font-semibold text-stone-400">{count}</span> : null}
    </label>
  );
}

function PriceSlider({ bounds, value, onChange }) {
  const [lo, hi] = value;
  const step = 1000;
  const span = bounds.max - bounds.min;
  const left = ((lo - bounds.min) / span) * 100;
  const right = 100 - ((hi - bounds.min) / span) * 100;

  return (
    <div>
      <div className="relative mx-2.5 h-6">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-stone-200" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-400 to-brand"
          style={{ left: `${left}%`, right: `${right}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          className="pk-range"
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
        />
        <input
          type="range"
          aria-label="Maximum price"
          className="pk-range"
          min={bounds.min}
          max={bounds.max}
          step={step}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs font-bold">
        <span className="rounded-lg bg-stone-100 px-2.5 py-1.5 text-stone-700">{inr(lo)}</span>
        <span className="text-stone-400">to</span>
        <span className="rounded-lg bg-stone-100 px-2.5 py-1.5 text-stone-700">
          {inr(hi)}
          {hi >= bounds.max ? "+" : ""}
        </span>
      </div>
    </div>
  );
}

export default function FilterPanel({
  filters,
  onChange,
  onReset,
  bounds,
  allPackages,
  activeCount,
}) {
  const toggleIn = (key, value) => {
    const list = filters[key];
    onChange({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };

  const themeCount = (id) => allPackages.filter((p) => p.meta.themes.includes(id)).length;
  const durationCount = (bucket) => allPackages.filter((p) => bucket.test(p.meta.nights)).length;

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-base font-extrabold text-stone-900">
          Filters
          {activeCount > 0 ? (
            <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </h2>
        <button
          type="button"
          onClick={onReset}
          disabled={activeCount === 0}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand transition hover:text-brand-dark disabled:cursor-not-allowed disabled:text-stone-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <Section title="Destination type">
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-stone-100 p-1">
          {[
            { id: "all", label: "All" },
            { id: "india", label: "India" },
            { id: "international", label: "Abroad" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ region: opt.id })}
              aria-pressed={filters.region === opt.id}
              className={`rounded-xl py-2 text-xs font-extrabold transition ${
                filters.region === opt.id
                  ? "bg-white text-brand shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Trip style">
        <div className="flex flex-wrap gap-2">
          {PACKAGE_THEMES.map((theme) => {
            const Icon = getThemeIcon(theme.id);
            const active = filters.themes.includes(theme.id);
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => toggleIn("themes", theme.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition active:scale-95 ${
                  active
                    ? "border-brand bg-brand text-white shadow-md shadow-brand/25"
                    : "border-stone-200 bg-white text-stone-700 hover:border-brand/50 hover:text-brand"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {theme.label}
                <span className={active ? "text-white/70" : "text-stone-400"}>{themeCount(theme.id)}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Price per person">
        <PriceSlider bounds={bounds} value={filters.price} onChange={(price) => onChange({ price })} />
      </Section>

      <Section title="Trip length">
        <div>
          {DURATION_BUCKETS.map((bucket) => (
            <CheckRow
              key={bucket.id}
              checked={filters.durations.includes(bucket.id)}
              onChange={() => toggleIn("durations", bucket.id)}
              count={durationCount(bucket)}
            >
              {bucket.label}
            </CheckRow>
          ))}
        </div>
      </Section>

      <Section title="Guest rating">
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((opt) => {
            const active = filters.rating === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ rating: opt.value })}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition active:scale-95 ${
                  active
                    ? "border-amber-400 bg-amber-50 text-amber-800"
                    : "border-stone-200 bg-white text-stone-700 hover:border-amber-300"
                }`}
              >
                {opt.value ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> : null}
                {opt.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Hotel category" defaultOpen={false}>
        <div className="flex gap-2">
          {[3, 4, 5].map((stars) => {
            const active = filters.stars.includes(stars);
            return (
              <button
                key={stars}
                type="button"
                onClick={() => toggleIn("stars", stars)}
                aria-pressed={active}
                className={`flex-1 rounded-xl border py-2.5 text-xs font-extrabold transition active:scale-95 ${
                  active
                    ? "border-brand bg-brand-muted text-brand"
                    : "border-stone-200 bg-white text-stone-700 hover:border-brand/40"
                }`}
              >
                {stars}★
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Inclusions & extras" defaultOpen={false}>
        <div>
          {PERK_FILTERS.map((perk) => (
            <CheckRow
              key={perk.id}
              checked={filters.perks.includes(perk.id)}
              onChange={() => toggleIn("perks", perk.id)}
            >
              {perk.label}
            </CheckRow>
          ))}
          {filters.perks.includes("inseason") && !filters.date ? (
            <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              Pick a travel date in the search bar to use this filter.
            </p>
          ) : null}
        </div>
      </Section>
    </div>
  );
}
