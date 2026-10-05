"use client";

import { CalendarDays, Search, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import DestinationInput from "@/components/packages/shared/DestinationInput";
import TravellersPicker from "@/components/packages/shared/TravellersPicker";
import { BUDGET_PRESETS } from "@/lib/packageFilters";
import { buildSearchHref, buildSearchSuggestions } from "@/lib/packageSearch";
import { getListingPackages } from "@/lib/tourPackageMeta";
import { todayInputValue } from "@/lib/tourTravellers";

const DEFAULT_TRAVELLERS = { adults: 2, children: 0, infants: 0, childAges: [] };

const fieldShell =
  "rounded-2xl border border-stone-200 bg-white transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 hover:border-stone-300";

/**
 * Self-contained trip search that sends visitors to the listing page with their
 * destination, date and travellers. `layout="bar"` is a single row (product page),
 * `layout="stack"` is a roomy vertical form (home hero card).
 */
export default function TripSearchBar({
  layout = "bar",
  initialDate = "",
  initialTravellers = DEFAULT_TRAVELLERS,
  showBudget = false,
  buttonLabel = "Search trips",
  className = "",
}) {
  const router = useRouter();
  const suggestions = useMemo(() => buildSearchSuggestions(getListingPackages()), []);
  const minDate = useMemo(() => todayInputValue(), []);
  const [draft, setDraft] = useState({
    q: "",
    date: initialDate,
    travellers: initialTravellers,
    budget: "any",
  });
  const patch = (next) => setDraft((d) => ({ ...d, ...next }));

  const submit = (e) => {
    e.preventDefault();
    router.push(buildSearchHref(draft));
  };

  const stack = layout === "stack";

  const date = (
    <label className={`flex items-center gap-3 px-4 py-3 ${stack ? fieldShell : "rounded-2xl transition hover:bg-stone-50 focus-within:bg-stone-50"}`}>
      <CalendarDays className="h-5 w-5 shrink-0 text-brand" />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">Travel date</span>
        <input
          type="date"
          min={minDate}
          value={draft.date}
          onChange={(e) => patch({ date: e.target.value })}
          className="input-no-ios-zoom block w-full bg-transparent text-sm font-bold text-stone-900 outline-none"
          aria-label="Travel date"
        />
      </span>
    </label>
  );

  const budget = showBudget ? (
    <label className={`flex items-center gap-3 px-4 py-3 ${fieldShell}`}>
      <Wallet className="h-5 w-5 shrink-0 text-brand" />
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">Budget / person</span>
        <select
          value={draft.budget}
          onChange={(e) => patch({ budget: e.target.value })}
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
  ) : null;

  if (stack) {
    return (
      <form onSubmit={submit} role="search" aria-label="Search tour packages" className={`space-y-3 ${className}`}>
        <div className={fieldShell}>
          <DestinationInput value={draft.q} onChange={(q) => patch({ q })} suggestions={suggestions} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {date}
          <div className={fieldShell}>
            <TravellersPicker
              variant="hero"
              label="Adults & children"
              value={draft.travellers}
              onChange={(travellers) => patch({ travellers })}
              align="right"
            />
          </div>
        </div>
        {budget}
        <button
          type="submit"
          className="pk-sweep group flex w-full items-center justify-center gap-2 rounded-2xl bg-brand py-4 text-base font-extrabold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark active:scale-[0.98]"
        >
          <Search className="h-5 w-5 transition group-hover:scale-110" />
          {buttonLabel}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Search tour packages"
      className={`rounded-[1.75rem] bg-white p-2 shadow-[0_18px_50px_-24px_rgba(28,25,23,0.35)] ring-1 ring-stone-200/80 sm:rounded-full ${className}`}
    >
      <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.1fr_auto] lg:items-center lg:gap-0 lg:divide-x lg:divide-stone-100">
        <DestinationInput value={draft.q} onChange={(q) => patch({ q })} suggestions={suggestions} />
        {date}
        <TravellersPicker
          variant="hero"
          label="Adults & children"
          value={draft.travellers}
          onChange={(travellers) => patch({ travellers })}
        />
        <button
          type="submit"
          className="pk-sweep group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark active:scale-[0.98] sm:col-span-2 lg:col-span-1 lg:ml-2"
        >
          <Search className="h-4 w-4 transition group-hover:scale-110" />
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}
