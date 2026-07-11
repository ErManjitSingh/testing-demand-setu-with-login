"use client";

import { CATEGORIES } from "@/lib/listings";
import { useCategoryExplore } from "@/hooks/useCategoryExplore";

export default function CategoryExploreQuickLinks({ showAllLink = true }) {
  const { openExplore, modal } = useCategoryExplore();

  const linkClass =
    "rounded-full border border-border bg-white px-4 py-2.5 text-sm font-bold transition hover:border-brand";

  return (
    <>
      {showAllLink && (
        <button
          type="button"
          onClick={() => openExplore("all")}
          className="rounded-full bg-gradient-to-r from-brand to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand/25"
        >
          View all stays
        </button>
      )}
      {CATEGORIES.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => openExplore(c.id)}
          className={linkClass}
        >
          {c.icon} {c.label}
        </button>
      ))}
      {modal}
    </>
  );
}
