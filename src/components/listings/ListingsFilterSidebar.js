"use client";

import { CATEGORIES } from "@/lib/listings";
import { ALL_STAYS_CATEGORY } from "@/lib/categoryExplore";
import { useCategoryExplore } from "@/hooks/useCategoryExplore";
import { AMENITY_FILTER_OPTIONS, PRICE_FILTER_OPTIONS } from "@/lib/listingFilters";

export default function ListingsFilterSidebar({
  activeCategory = "all",
  locationFilterMode = false,
  categoryCounts = null,
  selectedPrices = [],
  selectedStars = [],
  selectedAmenities = [],
  onCategoryChange,
  onPriceToggle,
  onStarToggle,
  onAmenityToggle,
  onClearFilters,
  hasActiveFilters = false,
}) {
  const { openExplore, modal } = useCategoryExplore();

  const typeLinkClass = (active) =>
    `flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
      active
        ? "bg-brand text-white shadow-md shadow-brand/20"
        : "text-muted hover:bg-brand-muted hover:text-brand-dark"
    }`;

  const showCounts = Boolean(categoryCounts);

  const countLabel = (id) => {
    if (!showCounts) return null;
    const n = categoryCounts[id];
    if (n == null) return null;
    return (
      <span className="ml-auto min-w-[1.25rem] text-right text-xs font-bold tabular-nums opacity-90">
        {n}
      </span>
    );
  };

  const handlePropertyType = (id) => {
    if (locationFilterMode && onCategoryChange) {
      onCategoryChange(id);
      return;
    }
    openExplore(id);
  };

  return (
    <>
      <aside className="rounded-3xl border border-border/80 bg-white shadow-lg shadow-stone-200/30">
        <div className="border-b border-stone-100 px-5 py-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">Refine search</h3>
              <p className="mt-0.5 text-xs text-muted">
                {locationFilterMode
                  ? "Filter stays in this destination"
                  : "Property type, price & more"}
              </p>
            </div>
            {hasActiveFilters && onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-brand hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand">
            Property type
          </p>
          <ul className="mt-3 space-y-1">
            <li>
              <button
                type="button"
                onClick={() => handlePropertyType("all")}
                className={typeLinkClass(activeCategory === "all")}
              >
                <span>{ALL_STAYS_CATEGORY.icon}</span> {ALL_STAYS_CATEGORY.label}
                {countLabel("all")}
              </button>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => handlePropertyType(cat.id)}
                  className={typeLinkClass(activeCategory === cat.id)}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                  {showCounts ? countLabel(cat.id) : (
                    <span className="ml-auto text-xs opacity-70">{cat.count}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-stone-100 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand">
            Price per night
          </p>
          <ul className="mt-3 space-y-1">
            {PRICE_FILTER_OPTIONS.map((range) => {
              const active = selectedPrices.includes(range.id);
              return (
                <li key={range.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-stone-50 ${
                      active ? "bg-brand-muted font-semibold text-brand-dark" : "text-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => onPriceToggle?.(range.id)}
                      className="h-4 w-4 rounded border-stone-300 accent-[#ea580c]"
                    />
                    {range.label}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-stone-100 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand">
            Amenities
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {AMENITY_FILTER_OPTIONS.map((a) => {
              const active = selectedAmenities.includes(a.id);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => onAmenityToggle?.(a.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "border-brand bg-brand-muted font-bold text-brand-dark"
                        : "border-border text-muted hover:border-brand hover:text-brand-dark"
                    }`}
                  >
                    {a.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-stone-100 p-5">
          <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 p-4 text-white">
            <p className="text-xs font-bold text-orange-200">Orange line · 24/7</p>
            <p className="mt-1 text-sm font-semibold leading-snug">
              Talk to a travel expert—we&apos;ll find your perfect stay.
            </p>
            <a
              href="tel:+918353056000"
              className="mt-3 flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-bold text-stone-900 transition hover:bg-orange-50"
            >
              +91 8353056000
            </a>
          </div>
        </div>
      </aside>
      {!locationFilterMode && modal}
    </>
  );
}
