"use client";

import { useEffect, useRef, useState } from "react";

export const SORT_STAYS = "stays";
export const SORT_PRICE_ASC = "price-asc";
export const SORT_PRICE_DESC = "price-desc";

export const PRICE_SORT_OPTIONS = [
  { id: SORT_PRICE_ASC, label: "Low to high" },
  { id: SORT_PRICE_DESC, label: "High to low" },
];

export const RATING_FILTER_OPTIONS = [
  { id: "5", label: "5 Star" },
  { id: "4", label: "4 Star" },
  { id: "3", label: "3 Star" },
  { id: "2", label: "2 Star" },
];

export function sortListings(listings, sortKey) {
  const copy = [...listings];
  if (sortKey === SORT_PRICE_ASC) {
    return copy.sort((a, b) => (a.price || 0) - (b.price || 0));
  }
  if (sortKey === SORT_PRICE_DESC) {
    return copy.sort((a, b) => (b.price || 0) - (a.price || 0));
  }
  return copy;
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 transition ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SortDropdown({ label, active, open, onToggle, children, summary }) {
  return (
    <div className="relative min-w-0 flex-1">
      <button
        type="button"
        onClick={onToggle}
        className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-bold transition sm:flex-none sm:justify-start sm:gap-1.5 sm:px-3 ${
          active
            ? "bg-brand-muted text-brand-dark ring-1 ring-brand/25"
            : "text-foreground hover:bg-stone-50"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="truncate">{summary || label}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-[120] mt-1.5 min-w-[160px] overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-xl ring-1 ring-stone-900/5"
          role="listbox"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function ListingsSortBar({
  sort = SORT_STAYS,
  selectedStars = [],
  onSortChange,
  onStarToggle,
  onClearStars,
}) {
  const [openMenu, setOpenMenu] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!openMenu) return;
    const onDocMouseDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [openMenu]);

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const priceActive = sort === SORT_PRICE_ASC || sort === SORT_PRICE_DESC;
  const ratingActive = selectedStars.length > 0;

  const priceSummary = PRICE_SORT_OPTIONS.find((o) => o.id === sort)?.label;
  const ratingSummary =
    selectedStars.length > 0
      ? `Rating · ${selectedStars.length} selected`
      : "Rating";

  return (
    <div
      ref={rootRef}
      className="flex w-full min-w-0 items-center gap-0.5 rounded-xl border border-border bg-white p-1 shadow-sm sm:gap-1"
    >
      {/* Price dropdown */}
      <SortDropdown
        label="Price"
        active={priceActive}
        open={openMenu === "price"}
        onToggle={() => toggleMenu("price")}
        summary={priceActive && priceSummary ? `Price · ${priceSummary}` : "Price"}
      >
        {PRICE_SORT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="option"
            aria-selected={sort === opt.id}
            onClick={() => {
              onSortChange?.(opt.id);
              setOpenMenu(null);
            }}
            className={`flex w-full px-4 py-2.5 text-left text-sm font-semibold transition hover:bg-brand-muted ${
              sort === opt.id ? "bg-brand-muted/80 text-brand-dark" : "text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </SortDropdown>

      <span className="h-5 w-px shrink-0 bg-stone-200 self-center" aria-hidden />

      {/* Rating dropdown */}
      <SortDropdown
        label="Rating"
        active={ratingActive}
        open={openMenu === "rating"}
        onToggle={() => toggleMenu("rating")}
        summary={ratingSummary}
      >
        {RATING_FILTER_OPTIONS.map((star) => {
          const checked = selectedStars.includes(star.id);
          return (
            <button
              key={star.id}
              type="button"
              role="option"
              aria-selected={checked}
              onClick={() => onStarToggle?.(star.id)}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold transition hover:bg-brand-muted ${
                checked ? "bg-brand-muted/80 text-brand-dark" : "text-foreground"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  checked ? "border-brand bg-brand text-white" : "border-stone-300 bg-white"
                }`}
              >
                {checked && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              ★ {star.label}
            </button>
          );
        })}
        {selectedStars.length > 0 && onClearStars && (
          <button
            type="button"
            onClick={() => {
              onClearStars();
              setOpenMenu(null);
            }}
            className="w-full border-t border-stone-100 px-4 py-2 text-xs font-bold text-brand hover:bg-stone-50"
          >
            Clear rating
          </button>
        )}
      </SortDropdown>
    </div>
  );
}
