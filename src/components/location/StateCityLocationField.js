"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LocationOptionsSkeleton from "@/components/location/LocationOptionsSkeleton";
import { fetchHotelCities, fetchHotelStates } from "@/store/locationSlice";

function filterAndSortLocations(items, query) {
  const q = query.trim().toLowerCase();
  let list = items;

  if (q) {
    const startsWith = [];
    const contains = [];
    for (const item of items) {
      const key = item.name.toLowerCase();
      if (key.startsWith(q)) startsWith.push(item);
      else if (key.includes(q)) contains.push(item);
    }
    list = [...startsWith, ...contains];
  } else {
    list = [...items].sort((a, b) =>
      a.name.localeCompare(b.name, "en", { sensitivity: "base" })
    );
  }

  return list;
}

function buildMixedLocations(states, cities) {
  const stateKeys = new Set(states.map((s) => s.toLowerCase()));
  const items = [];

  for (const name of states) {
    items.push({ kind: "state", name });
  }
  for (const name of cities) {
    if (stateKeys.has(name.toLowerCase())) continue;
    items.push({ kind: "city", name });
  }

  return items;
}

export default function StateCityLocationField({
  value,
  city = "",
  state = "",
  onChange,
  onSelect,
  className = "",
  placeholder = "Search city or state...",
  label = "Where do you want to go?",
  embedded = false,
  compact = false,
  capEmbeddedList = false,
  autoFocus = false,
}) {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [hasTriggeredFetch, setHasTriggeredFetch] = useState(false);
  const { cities, states, status, statesStatus, error, statesError } = useSelector(
    (s) => s.locations
  );

  useEffect(() => {
    if (hasTriggeredFetch) return;
    dispatch(fetchHotelCities());
    dispatch(fetchHotelStates());
    setHasTriggeredFetch(true);
  }, [dispatch, hasTriggeredFetch]);

  useEffect(() => {
    if (!embedded || !autoFocus) return;
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [embedded, autoFocus]);

  useEffect(() => {
    if (embedded || !open) return;
    const onDocMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [embedded, open]);

  const mixedLocations = useMemo(
    () => buildMixedLocations(states, cities),
    [states, cities]
  );

  const filtered = useMemo(
    () => filterAndSortLocations(mixedLocations, value),
    [mixedLocations, value]
  );

  const citiesLoading = status === "loading" || (hasTriggeredFetch && status === "idle");
  const statesLoading =
    statesStatus === "loading" || (hasTriggeredFetch && statesStatus === "idle");
  const isLoading = citiesLoading || statesLoading;
  const loadFailed = status === "failed" || statesStatus === "failed";
  const selectedName = city || state;
  const selectedKind = city ? "city" : state ? "state" : null;

  const pick = (item) => {
    onChange(item.name);
    if (item.kind === "city") {
      onSelect?.({ city: item.name, state: "", kind: "city" });
    } else {
      onSelect?.({ city: "", state: item.name, kind: "state" });
    }
    if (!embedded || capEmbeddedList) setOpen(false);
    inputRef.current?.blur();
  };

  const restoreSelectedLabel = () => {
    if (!value.trim() && selectedName) onChange(selectedName);
  };

  const showList = compact
    ? open
    : embedded
      ? capEmbeddedList
        ? open || !selectedName
        : true
      : open;

  const listContent = (
    <div
      className={
        embedded
          ? capEmbeddedList
            ? "mt-3 flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/80"
            : "mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/80"
          : "absolute left-0 right-0 top-full z-[450] mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl"
      }
    >
      {isLoading && (
        <div className="p-2">
          <LocationOptionsSkeleton rows={10} />
        </div>
      )}

      {loadFailed && !isLoading && (
        <p className="px-4 py-3 text-sm text-red-600">
          {error || statesError || "Unable to load locations"}
        </p>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-muted">
          No matching city or state. Try another spelling.
        </p>
      )}

      {!isLoading && filtered.length > 0 && (
        <>
          <p className="shrink-0 border-b border-stone-200/80 bg-white/90 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">
            {filtered.length} destination{filtered.length !== 1 ? "s" : ""} · cities & states
          </p>
          <ul
            className={`no-scrollbar divide-y divide-stone-100 overflow-y-auto overscroll-contain ${
              embedded
                ? capEmbeddedList
                  ? "max-h-[min(42vh,220px)]"
                  : "min-h-0 flex-1"
                : "max-h-[min(50vh,320px)]"
            }`}
          >
            {filtered.map((item) => {
              const isSelected =
                selectedName &&
                selectedName.toLowerCase() === item.name.toLowerCase() &&
                selectedKind === item.kind;

              return (
                <li key={`${item.kind}-${item.name}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(item)}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition sm:py-3 ${
                      isSelected
                        ? "bg-brand-muted"
                        : "hover:bg-white active:bg-brand-muted/60"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        item.kind === "state"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {item.kind === "state" ? <StateIcon /> : <CityIcon />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-bold text-stone-900 sm:text-[15px]">
                        {item.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-stone-500">
                        {item.kind === "state"
                          ? "Search all stays in this state"
                          : "Search stays in this city"}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        item.kind === "state"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {item.kind === "state" ? "State" : "City"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );

  if (compact) {
    return (
      <div ref={ref} className={`relative flex w-full min-w-0 items-center gap-2.5 ${className}`}>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand">
          <PinIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-bold uppercase tracking-wide text-brand">
            {label}
          </span>
          <input
            ref={inputRef}
            type="search"
            value={value}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => {
                restoreSelectedLabel();
                setOpen(false);
              }, 150);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            className="input-no-ios-zoom w-full bg-transparent text-sm font-bold text-stone-900 outline-none placeholder:font-medium placeholder:text-stone-400"
          />
        </span>
        {showList && listContent}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`${
        embedded
          ? capEmbeddedList
            ? "flex flex-col"
            : "flex min-h-0 flex-1 flex-col"
          : "relative"
      } ${className}`}
    >
      <label
        className={`flex shrink-0 items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3.5 transition ${
          open || embedded
            ? "border-brand shadow-[0_0_0_3px_rgba(249,115,22,0.12)]"
            : "border-stone-200"
        }`}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-orange-500 text-white shadow-md shadow-brand/25">
          <PinIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-brand">
            {label}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              window.setTimeout(() => {
                restoreSelectedLabel();
                setOpen(false);
              }, 150);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape" && !embedded) setOpen(false);
            }}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            placeholder={placeholder}
            className="input-no-ios-zoom mt-1 w-full max-w-full bg-transparent text-base font-semibold text-stone-900 outline-none placeholder:font-normal placeholder:text-stone-400"
          />
        </span>
      </label>

      {selectedName && !capEmbeddedList && (
        <div className="mt-3 flex shrink-0 items-center gap-2 rounded-xl bg-brand-muted/80 px-3 py-2 ring-1 ring-brand/15">
          <span className="text-lg" aria-hidden>
            {selectedKind === "state" ? "🗺️" : "📍"}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand">
              Selected {selectedKind}
            </p>
            <p className="truncate text-sm font-bold text-foreground">{selectedName}</p>
          </div>
        </div>
      )}

      {showList && listContent}
    </div>
  );
}

function PinIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function StateIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A2 2 0 013 15.382V6.618a2 2 0 011.553-1.894L9 2m0 18l6-3m-6 3V2m6 15l5.447-2.724A2 2 0 0021 15.382V6.618a2 2 0 00-1.553-1.894L15 2m0 18V2" />
    </svg>
  );
}

function CityIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />
    </svg>
  );
}
