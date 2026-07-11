"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LocationOptionsSkeleton from "@/components/location/LocationOptionsSkeleton";
import { fetchHotelCities } from "@/store/locationSlice";

export default function LocationSearchField({
  value,
  onChange,
  className = "",
  inputClassName = "",
  placeholder = "Goa, Manali, Jaipur...",
  label = "Location",
  compact = true,
}) {
  const dispatch = useDispatch();
  const ref = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [hasTriggeredFetch, setHasTriggeredFetch] = useState(false);
  const { cities, status, error } = useSelector((state) => state.locations);

  useEffect(() => {
    if (!open || hasTriggeredFetch) return;
    dispatch(fetchHotelCities());
    setHasTriggeredFetch(true);
  }, [dispatch, hasTriggeredFetch, open]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const filtered = useMemo(() => {
    const query = String(value || "").trim().toLowerCase();
    if (!query) return cities;

    const startsWith = [];
    const contains = [];
    for (const city of cities) {
      const key = city.toLowerCase();
      if (key.startsWith(query)) startsWith.push(city);
      else if (key.includes(query)) contains.push(city);
    }
    return [...startsWith, ...contains];
  }, [cities, value]);

  const isLoadingLocations =
    status === "loading" || (hasTriggeredFetch && status === "idle");

  const showDropdown =
    open &&
    (isLoadingLocations || filtered.length > 0 || status === "failed");

  const iconClass = compact
    ? "h-7 w-7 sm:h-8 sm:w-8"
    : "h-8 w-8 sm:h-9 sm:w-9";
  const titleClass = compact
    ? "block text-[9px] font-bold uppercase tracking-wide text-brand"
    : "block text-[10px] font-bold uppercase tracking-wide text-brand";

  return (
    <div ref={ref} className={`relative flex w-full items-center gap-2 ${className}`}>
      <span className={`flex shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand ${iconClass}`}>
        <PinIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className={titleClass}>
          {label}
        </span>
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={value}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className={`input-no-ios-zoom mt-0.5 w-full max-w-full bg-transparent text-base outline-none placeholder:font-normal placeholder:text-stone-400 sm:text-sm ${inputClassName}`}
        />
      </span>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-[260] mt-2 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
          {isLoadingLocations && <LocationOptionsSkeleton />}

          {status === "failed" && (
            <p className="px-3 py-2 text-xs text-red-600">
              {error || "Unable to fetch locations"}
            </p>
          )}

          {!isLoadingLocations && filtered.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted">No location found</p>
          )}

          {filtered.length > 0 && (
            <ul className="no-scrollbar max-h-[min(40vh,300px)] overflow-y-auto py-1">
              {filtered.map((city) => (
                <li key={city}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(city);
                      setOpen(false);
                      inputRef.current?.blur();
                    }}
                    className="flex w-full items-center px-3 py-1.5 text-left text-xs sm:text-sm text-foreground transition hover:bg-brand-muted"
                  >
                    {city}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}
