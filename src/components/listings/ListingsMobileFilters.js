"use client";

import { useState } from "react";
import ListingsFilterSidebar from "@/components/listings/ListingsFilterSidebar";

export default function ListingsMobileFilters(sidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-brand to-orange-500 px-3 py-2 text-xs font-bold text-white shadow-md shadow-brand/30 transition hover:brightness-105 lg:hidden"
      >
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 0v12h9.75V6" />
        </svg>
        Filters
        {sidebarProps.hasActiveFilters && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold text-brand">
            !
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#f8f6f3] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-foreground">Filters</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-200 text-stone-600"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ListingsFilterSidebar {...sidebarProps} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-brand to-orange-500 py-3.5 text-sm font-bold text-white shadow-lg"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
