"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Heart,
  LayoutGrid,
  List,
  Phone,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PackageEnquiryForm from "@/components/booking/PackageEnquiryForm";
import FilterPanel from "@/components/packages/listing/FilterPanel";
import ListingHero from "@/components/packages/listing/ListingHero";
import ListingPackageCard from "@/components/packages/listing/ListingPackageCard";
import MoodStrip from "@/components/packages/listing/MoodStrip";
import TripDetailsCard from "@/components/packages/listing/TripDetailsCard";
import PackagesFAQ from "@/components/packages/PackagesFAQ";
import { useWishlist } from "@/components/packages/shared/useWishlist";
import AnimateIn from "@/components/packages/AnimateIn";
import {
  BUDGET_PRESETS,
  PAGE_SIZE,
  SORT_OPTIONS,
  applyFilters,
  createDefaultFilters,
  describeActiveFilters,
  filtersToQuery,
  removeFilterChip,
  sortPackages,
} from "@/lib/packageFilters";
import { buildSearchSuggestions } from "@/lib/packageSearch";
import { getListingPackages, getPackagePriceBounds } from "@/lib/tourPackageMeta";
import { DEFAULT_PACKAGE_IMAGE } from "@/lib/tourPackages";

function budgetIdFromPrice(price, bounds) {
  const [min, max] = price;
  const preset = BUDGET_PRESETS.find(
    (b) => b.id !== "any" && (b.min ?? bounds.min) === min && (b.max ?? bounds.max) === max
  );
  return preset?.id ?? "any";
}

function useLockScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

export default function PackagesListingPage({ initialFilters }) {
  const allPackages = useMemo(() => getListingPackages(), []);
  const bounds = useMemo(() => getPackagePriceBounds(), []);
  const wishlist = useWishlist();

  const [filters, setFilters] = useState(initialFilters);
  const [draft, setDraft] = useState(() => ({
    q: initialFilters.q,
    date: initialFilters.date,
    travellers: initialFilters.travellers,
    budget: budgetIdFromPrice(initialFilters.price, bounds),
  }));
  const [savedOnly, setSavedOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enquiry, setEnquiry] = useState(null);
  const resultsRef = useRef(null);
  useLockScroll(drawerOpen);

  const patchFilters = useCallback((patch) => setFilters((f) => ({ ...f, ...patch })), []);
  const patchDraft = useCallback((patch) => setDraft((d) => ({ ...d, ...patch })), []);

  // Keep the hero draft aligned with edits made in the sidebar / chips.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft((d) => ({
      ...d,
      q: filters.q,
      date: filters.date,
      travellers: filters.travellers,
      budget: budgetIdFromPrice(filters.price, bounds),
    }));
  }, [filters.q, filters.date, filters.travellers, filters.price, bounds]);

  // Shareable URL without triggering a navigation.
  const queryString = useMemo(() => filtersToQuery(filters), [filters]);
  useEffect(() => {
    const url = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    window.history.replaceState(window.history.state, "", url);
  }, [queryString]);

  const scrollToResults = useCallback(() => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const runSearch = useCallback(() => {
    const preset = BUDGET_PRESETS.find((b) => b.id === draft.budget) ?? BUDGET_PRESETS[0];
    setFilters((f) => ({
      ...f,
      q: draft.q,
      date: draft.date,
      travellers: draft.travellers,
      price: [preset.min ?? bounds.min, preset.max ?? bounds.max],
    }));
    window.setTimeout(scrollToResults, 60);
  }, [draft, bounds, scrollToResults]);

  const resetFilters = useCallback(() => {
    setFilters((f) => ({ ...createDefaultFilters(), date: f.date, travellers: f.travellers, view: f.view, sort: f.sort }));
    setSavedOnly(false);
  }, []);

  const toggleTheme = useCallback((id) => {
    setFilters((f) => ({
      ...f,
      themes: f.themes.includes(id) ? f.themes.filter((t) => t !== id) : [...f.themes, id],
    }));
  }, []);

  const themeCounts = useMemo(() => {
    const counts = {};
    allPackages.forEach((p) => p.meta.themes.forEach((t) => (counts[t] = (counts[t] ?? 0) + 1)));
    return counts;
  }, [allPackages]);

  const suggestions = useMemo(() => buildSearchSuggestions(allPackages), [allPackages]);

  const slideImages = useMemo(() => {
    const map = {};
    allPackages.forEach((p) => (map[p.id] = p.image));
    return map;
  }, [allPackages]);

  const results = useMemo(() => {
    let list = applyFilters(allPackages, filters);
    if (savedOnly) list = list.filter((p) => wishlist.list.includes(p.id));
    return sortPackages(list, filters.sort);
  }, [allPackages, filters, savedOnly, wishlist.list]);

  const activeChips = useMemo(() => describeActiveFilters(filters), [filters]);
  const activeCount = activeChips.length;

  // "Load more" paging that resets whenever the result set definition changes.
  const signature = `${queryString}|${savedOnly}`;
  const [pager, setPager] = useState({ signature: "", count: PAGE_SIZE });
  const visibleCount = pager.signature === signature ? pager.count : PAGE_SIZE;
  const visible = results.slice(0, visibleCount);
  const remaining = results.length - visible.length;

  const openEnquiry = useCallback(
    (pkg) =>
      setEnquiry({
        ...pkg,
        defaultTravellers: filters.travellers.adults,
        defaultChildren: filters.travellers.children,
        defaultChildAges: filters.travellers.childAges,
        defaultInfants: filters.travellers.infants,
        defaultTravelDate: filters.date,
      }),
    [filters.travellers, filters.date]
  );

  const openCustomEnquiry = useCallback(
    () =>
      openEnquiry({
        id: "custom-enquiry",
        title: filters.q.trim() || "Custom tour",
        duration: "Flexible",
        location: filters.q.trim() || "India",
        country: "India",
        state: "",
        city: "",
        image: DEFAULT_PACKAGE_IMAGE,
      }),
    [filters.q, openEnquiry]
  );

  return (
    <div className="bg-[#f6f3ee]">
      <ListingHero
        draft={draft}
        onDraftChange={patchDraft}
        onSearch={runSearch}
        suggestions={suggestions}
        slideImages={slideImages}
        total={allPackages.length}
      />

      <MoodStrip active={filters.themes} counts={themeCounts} onToggle={toggleTheme} />

      <section ref={resultsRef} className="scroll-mt-24 pb-20 pt-8 sm:pt-10" aria-labelledby="results-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
            {/* Sidebar (desktop) */}
            <aside className="hidden lg:block">
              <div className="no-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] space-y-4 overflow-y-auto pb-6 pr-1">
                <TripDetailsCard
                  date={filters.date}
                  travellers={filters.travellers}
                  onDateChange={(date) => patchFilters({ date })}
                  onTravellersChange={(travellers) => patchFilters({ travellers })}
                />
                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200/70">
                  <FilterPanel
                    filters={filters}
                    onChange={patchFilters}
                    onReset={resetFilters}
                    bounds={bounds}
                    allPackages={allPackages}
                    activeCount={activeCount}
                  />
                </div>
                <HelpCard />
              </div>
            </aside>

            {/* Results */}
            <div className="min-w-0">
              <div className="sticky top-[68px] z-30 -mx-4 border-b border-stone-200/70 bg-[#f6f3ee]/90 px-4 py-3 backdrop-blur-xl sm:top-[80px] sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:pb-3 lg:backdrop-blur-none">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 id="results-heading" className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">
                      {results.length} {results.length === 1 ? "trip" : "trips"}{" "}
                      <span className="font-medium text-stone-500">
                        {filters.q.trim() ? `for “${filters.q.trim()}”` : "to explore"}
                      </span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-stone-800 shadow-sm ring-1 ring-stone-200 transition active:scale-95 lg:hidden"
                    >
                      <SlidersHorizontal className="h-4 w-4 text-brand" />
                      Filters
                      {activeCount > 0 ? (
                        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
                          {activeCount}
                        </span>
                      ) : null}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSavedOnly((s) => !s)}
                      aria-pressed={savedOnly}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-sm ring-1 transition active:scale-95 ${
                        savedOnly
                          ? "bg-rose-50 text-rose-600 ring-rose-200"
                          : "bg-white text-stone-800 ring-stone-200 hover:ring-rose-200"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${savedOnly ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} />
                      <span className="hidden sm:inline">Saved</span>
                      {wishlist.count > 0 ? <span className="text-xs">{wishlist.count}</span> : null}
                    </button>

                    <label className="relative">
                      <span className="sr-only">Sort by</span>
                      <select
                        value={filters.sort}
                        onChange={(e) => patchFilters({ sort: e.target.value })}
                        className="input-no-ios-zoom cursor-pointer appearance-none rounded-full bg-white py-2.5 pl-4 pr-9 text-sm font-bold text-stone-800 shadow-sm outline-none ring-1 ring-stone-200 transition focus:ring-2 focus:ring-brand/40"
                      >
                        {SORT_OPTIONS.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      <span aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-stone-400">
                        ▼
                      </span>
                    </label>

                    <div className="hidden rounded-full bg-white p-1 shadow-sm ring-1 ring-stone-200 sm:flex" role="group" aria-label="Layout">
                      {[
                        { id: "grid", icon: LayoutGrid, label: "Grid view" },
                        { id: "list", icon: List, label: "List view" },
                      ].map(({ id, icon: Icon, label }) => (
                        <button
                          key={id}
                          type="button"
                          aria-label={label}
                          aria-pressed={filters.view === id}
                          onClick={() => patchFilters({ view: id })}
                          className={`grid h-9 w-9 place-items-center rounded-full transition ${
                            filters.view === id ? "bg-brand text-white shadow-md" : "text-stone-500 hover:text-stone-900"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {activeChips.length > 0 ? (
                  <ul className="mt-3 flex flex-wrap items-center gap-2">
                    {activeChips.map((chip) => (
                      <li key={chip.key} className="pk-zoom-in">
                        <button
                          type="button"
                          onClick={() => setFilters((f) => removeFilterChip(f, chip.key))}
                          className="group inline-flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-3 pr-2 text-xs font-bold text-stone-700 shadow-sm ring-1 ring-stone-200 transition hover:ring-brand/50"
                        >
                          {chip.label}
                          <span className="grid h-4 w-4 place-items-center rounded-full bg-stone-100 text-stone-500 transition group-hover:bg-brand group-hover:text-white">
                            <X className="h-3 w-3" />
                          </span>
                        </button>
                      </li>
                    ))}
                    <li>
                      <button type="button" onClick={resetFilters} className="px-2 text-xs font-bold text-brand hover:underline">
                        Clear all
                      </button>
                    </li>
                  </ul>
                ) : null}
              </div>

              {visible.length > 0 ? (
                <>
                  <div
                    className={`mt-4 grid gap-5 sm:gap-6 ${
                      filters.view === "list" ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3"
                    }`}
                  >
                    {visible.map((pkg, i) => (
                      <ListingPackageCard
                        key={pkg.id}
                        pkg={pkg}
                        filters={filters}
                        view={filters.view === "list" ? "list" : "grid"}
                        index={i % PAGE_SIZE}
                        priority={i < 3}
                        onEnquire={openEnquiry}
                      />
                    ))}
                  </div>

                  <div className="mt-10 flex flex-col items-center gap-3">
                    <p className="text-xs font-semibold text-stone-500">
                      Showing {visible.length} of {results.length} trips
                    </p>
                    <div className="h-1.5 w-48 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-brand transition-all duration-700"
                        style={{ width: `${(visible.length / Math.max(1, results.length)) * 100}%` }}
                      />
                    </div>
                    {remaining > 0 ? (
                      <button
                        type="button"
                        onClick={() => setPager({ signature, count: visibleCount + PAGE_SIZE })}
                        className="pk-sweep mt-1 inline-flex items-center gap-2 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-stone-800 active:scale-95"
                      >
                        Load {Math.min(PAGE_SIZE, remaining)} more trips
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </>
              ) : (
                <EmptyState
                  savedOnly={savedOnly}
                  onReset={resetFilters}
                  onCustom={openCustomEnquiry}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <CustomTripBanner onPlan={openCustomEnquiry} />

      <PackagesFAQ />

      {/* Mobile filter drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-[90] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            aria-label="Close filters"
            className="pk-fade absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="pk-slide-in-left absolute inset-y-0 left-0 flex w-[min(24rem,92vw)] flex-col bg-[#f6f3ee] shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
              <p className="text-base font-extrabold text-stone-900">Filter trips</p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <TripDetailsCard
                date={filters.date}
                travellers={filters.travellers}
                onDateChange={(date) => patchFilters({ date })}
                onTravellersChange={(travellers) => patchFilters({ travellers })}
              />
              <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-200/70">
                <FilterPanel
                  filters={filters}
                  onChange={patchFilters}
                  onReset={resetFilters}
                  bounds={bounds}
                  allPackages={allPackages}
                  activeCount={activeCount}
                />
              </div>
            </div>
            <div className="border-t border-stone-200 bg-white p-4 pb-[max(1rem,var(--safe-bottom))]">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-full bg-brand py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/30 active:scale-[0.99]"
              >
                Show {results.length} {results.length === 1 ? "trip" : "trips"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <PackageEnquiryForm open={Boolean(enquiry)} onClose={() => setEnquiry(null)} tourPackage={enquiry} />
    </div>
  );
}

function HelpCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-stone-900 p-5 text-white">
      <div aria-hidden className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand/40 blur-2xl" />
      <Sparkles className="h-6 w-6 text-amber-300" />
      <p className="mt-3 text-base font-extrabold">Not sure where to go?</p>
      <p className="mt-1 text-sm text-white/70">A real travel expert will shortlist 3 trips for your dates and budget.</p>
      <a
        href="tel:+918353056000"
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-stone-900 transition hover:bg-orange-100"
      >
        <Phone className="h-4 w-4 text-brand" />
        +91 83530 56000
      </a>
    </div>
  );
}

function EmptyState({ savedOnly, onReset, onCustom }) {
  return (
    <div className="pk-fade-up mt-6 overflow-hidden rounded-[2rem] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-stone-200/70">
      <div className="pk-drift mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-muted text-brand">
        {savedOnly ? <Heart className="h-9 w-9" /> : <Compass className="h-9 w-9" />}
      </div>
      <h3 className="mt-6 text-2xl font-extrabold text-stone-900">
        {savedOnly ? "No saved trips match yet" : "No trips match those filters"}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">
        {savedOnly
          ? "Tap the heart on any trip to keep it here for later."
          : "Try widening your budget, removing a trip style or clearing everything. Or tell us what you have in mind and we will build it."}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-stone-900 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-stone-800 active:scale-95"
        >
          Clear all filters
        </button>
        <button
          type="button"
          onClick={onCustom}
          className="rounded-full border border-brand px-6 py-3 text-sm font-extrabold text-brand transition hover:bg-brand-muted active:scale-95"
        >
          Plan a custom trip
        </button>
      </div>
    </div>
  );
}

function CustomTripBanner({ onPlan }) {
  return (
    <section className="px-4 pb-16 sm:px-6">
      <AnimateIn direction="scale">
        <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] bg-stone-950 text-white lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-10 p-8 sm:p-12 lg:p-16">
            <p className="font-serif text-lg italic text-orange-300">Can&apos;t see your trip?</p>
            <h2 className="mt-2 max-w-lg font-serif text-3xl font-medium leading-tight sm:text-5xl">
              We&apos;ll build it around you.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              Share your dates, group and budget. Within a few hours a specialist sends a day-by-day plan with
              hotels, transfers and a clear price.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onPlan}
                className="pk-sweep inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark active:scale-95"
              >
                Plan my custom trip
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Explore destinations
              </Link>
            </div>
          </div>
          <div className="relative min-h-[260px] lg:min-h-full">
            <Image
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80"
              alt=""
              fill
              sizes="(min-width:1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/30 to-transparent lg:from-stone-950 lg:via-stone-950/10" />
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
