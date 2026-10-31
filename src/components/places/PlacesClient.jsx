"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, Search, SlidersHorizontal, X } from "lucide-react";
import PackageEnquiryForm from "@/components/booking/PackageEnquiryForm";
import { PlaceCard, TYPE_ICONS } from "@/components/places/PlacesUi";
import { DISTANCE_OPTIONS, SORT_OPTIONS, buildPlacesQuery } from "@/lib/places/placesFilter";
import { PLACE_TYPE_BY_ID } from "@/lib/places/placesText";

/* -------------------------------- enquiry -------------------------------- */

function useEnquiryPackage({ title, location, state = "", city = "", image }) {
  return useMemo(
    () => ({
      id: `places-${location}`,
      title,
      duration: "Flexible",
      location,
      country: "India",
      state,
      city,
      destination: [city, state, "India"].filter(Boolean).join(", "),
      image,
    }),
    [title, location, state, city, image]
  );
}

/** Opens the same query form used across the site, pre-filled with the destination. */
export function EnquiryButton({ label = "Plan this trip", title, location, state, city, image, variant = "primary", className = "" }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const tourPackage = useEnquiryPackage({ title, location, state, city, image });

  const styles =
    variant === "primary"
      ? "bg-brand text-white shadow-lg shadow-brand/30 hover:bg-brand-dark"
      : variant === "light"
        ? "bg-white text-stone-900 shadow-lg hover:bg-orange-50"
        : "border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`pk-sweep inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold transition active:scale-95 ${styles} ${className}`}
      >
        <MessageCircle aria-hidden className="h-4 w-4" />
        {label}
      </button>
      <PackageEnquiryForm open={open} onClose={close} tourPackage={tourPackage} />
    </>
  );
}

/** Cities we know of but have no place guide for yet — they open the query form instead of a dead page. */
export function ComingSoonCities({ cities, stateName }) {
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);
  const tourPackage = useMemo(
    () =>
      active
        ? {
            id: `places-${stateName}-${active}`,
            title: `${active} trip`,
            duration: "Flexible",
            location: `${active}, ${stateName}`,
            country: "India",
            state: stateName,
            city: active,
            destination: `${active}, ${stateName}, India`,
          }
        : null,
    [active, stateName]
  );

  return (
    <>
      <ul className="mt-5 flex flex-wrap gap-2">
        {cities.map((name) => (
          <li key={name}>
            <button
              type="button"
              onClick={() => setActive(name)}
              className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-brand hover:bg-brand-muted hover:text-brand active:scale-95"
            >
              {name}
            </button>
          </li>
        ))}
      </ul>
      <PackageEnquiryForm open={Boolean(active)} onClose={close} tourPackage={tourPackage} />
    </>
  );
}

/* ------------------------------ city page grid ----------------------------- */

export function CityPlacesGrid({ places, cityName, gridClassName = "sm:grid-cols-2 lg:grid-cols-3" }) {
  const [type, setType] = useState("");
  const [sort, setSort] = useState("recommended");

  const counts = useMemo(() => {
    const map = new Map();
    for (const p of places) map.set(p.type, (map.get(p.type) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [places]);

  const shown = useMemo(() => {
    const list = type ? places.filter((p) => p.type === type) : places;
    if (sort === "recommended") return list;
    const copy = [...list];
    if (sort === "nearest") copy.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) || a.name.localeCompare(b.name));
    else copy.sort((a, b) => a.name.localeCompare(b.name));
    return copy;
  }, [places, type, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by type">
          <Chip active={!type} onClick={() => setType("")}>
            All ({places.length})
          </Chip>
          {counts.map(([id, n]) => {
            const Icon = TYPE_ICONS[id];
            return (
              <Chip key={id} active={type === id} onClick={() => setType(type === id ? "" : id)}>
                {Icon ? <Icon aria-hidden className="h-3.5 w-3.5" /> : null}
                {PLACE_TYPE_BY_ID[id]?.label} ({n})
              </Chip>
            );
          })}
        </div>
        <label className="flex shrink-0 items-center gap-2 text-xs font-bold text-stone-500">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-bold text-stone-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className={`mt-6 grid gap-5 ${gridClassName}`} aria-label={`Places to visit in ${cityName}`}>
        {shown.map((place, i) => (
          <li key={place.id} className="pk-fade" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
            <PlaceCard place={place} showCity={false} priority={i < 3} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-extrabold transition active:scale-95 ${
        active ? "border-brand bg-brand text-white shadow-md shadow-brand/25" : "border-stone-200 bg-white text-stone-700 hover:border-brand/50 hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

/* ----------------------------- /places filter bar --------------------------- */

const field =
  "input-no-ios-zoom w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm font-semibold text-stone-900 outline-none transition hover:border-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/25 disabled:cursor-not-allowed disabled:bg-stone-50 disabled:text-stone-400";

export function PlacesFilterBar({ filters, states, types, resultCount }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(filters.q);
  const [resetKey, setResetKey] = useState(0);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const push = useCallback(
    (overrides) => {
      const qs = buildPlacesQuery(filters, { page: 1, ...overrides });
      startTransition(() => router.replace(`${pathname}${qs}`, { scroll: false }));
    },
    [filters, pathname, router]
  );

  const onSearch = (value) => {
    setSearch(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => push({ q: value.trim() }), 320);
  };

  const cities = useMemo(() => states.find((s) => s.slug === filters.state)?.cities ?? [], [states, filters.state]);
  const dirty = filters.q || filters.state || filters.city || filters.type || filters.dist || filters.sort !== "recommended";

  const reset = () => {
    clearTimeout(timer.current);
    setSearch("");
    setResetKey((k) => k + 1);
    startTransition(() => router.replace(pathname, { scroll: false }));
  };

  return (
    <div className="relative rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-5" aria-busy={pending}>
      {pending ? <span aria-hidden className="absolute inset-x-6 top-0 h-0.5 animate-pulse rounded-full bg-brand" /> : null}

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          clearTimeout(timer.current);
          push({ q: search.trim() });
        }}
        className="grid gap-3 md:grid-cols-[1.6fr_1fr_1fr]"
      >
        <label className="relative block">
          <span className="sr-only">Search places</span>
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            key={resetKey}
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search — Hamta Pass, temple, lake…"
            className={`${field} pl-10`}
          />
        </label>

        <label className="block">
          <span className="sr-only">State</span>
          <select
            value={filters.state}
            onChange={(e) => push({ state: e.target.value, city: "" })}
            className={`${field} cursor-pointer`}
          >
            <option value="">All states</option>
            {states.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name} ({s.count})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">City</span>
          <select
            value={filters.city}
            disabled={!filters.state}
            onChange={(e) => push({ city: e.target.value })}
            className={`${field} cursor-pointer`}
          >
            <option value="">{filters.state ? "All cities" : "Pick a state first"}</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name} ({c.count})
              </option>
            ))}
          </select>
        </label>
      </form>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-5 sm:px-5 lg:mx-0 lg:flex-wrap lg:px-0" role="group" aria-label="Filter by type">
          <Chip active={!filters.type} onClick={() => push({ type: "" })}>
            All types
          </Chip>
          {types.map((t) => {
            const Icon = TYPE_ICONS[t.id];
            return (
              <Chip key={t.id} active={filters.type === t.id} onClick={() => push({ type: filters.type === t.id ? "" : t.id })}>
                {Icon ? <Icon aria-hidden className="h-3.5 w-3.5" /> : null}
                {t.label}
              </Chip>
            );
          })}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <SlidersHorizontal aria-hidden className="hidden h-4 w-4 text-stone-400 sm:block" />
          <select
            aria-label="Distance"
            value={filters.dist}
            onChange={(e) => push({ dist: e.target.value })}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-bold text-stone-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          >
            {DISTANCE_OPTIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort"
            value={filters.sort}
            onChange={(e) => push({ sort: e.target.value })}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-bold text-stone-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-sm">
        <p className="font-bold text-stone-600" role="status">
          {resultCount} {resultCount === 1 ? "place" : "places"} found
        </p>
        {dirty ? (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-sm font-extrabold text-brand hover:text-brand-dark">
            <X aria-hidden className="h-4 w-4" />
            Clear filters
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-400">
            Tap a place to see details <ArrowRight aria-hidden className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
    </div>
  );
}
