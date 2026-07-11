"use client";

import { useCallback, useRef, useState } from "react";
import PropertyCard from "@/components/PropertyCard";

export default function HomeListingsSlider({ listings }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const scrollTo = useCallback((index) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[index];
    if (slide) {
      slide.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      setActive(index);
    }
  }, []);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track?.children.length) return;
    const slideWidth = track.children[0].offsetWidth;
    const gap = 20;
    const index = Math.round(track.scrollLeft / (slideWidth + gap));
    setActive(Math.min(Math.max(index, 0), listings.length - 1));
  }, [listings.length]);

  if (!listings.length) return null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-2">
        <span className="rounded-full bg-brand-muted px-3 py-1 text-xs font-bold text-brand-dark ring-1 ring-brand/10">
          {active + 1} / {listings.length}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => scrollTo(Math.max(active - 1, 0))}
            disabled={active === 0}
            aria-label="Previous stay"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-stone-600 shadow-sm transition hover:border-brand/40 hover:text-brand disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollTo(Math.min(active + 1, listings.length - 1))}
            disabled={active === listings.length - 1}
            aria-label="Next stay"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-stone-600 shadow-sm transition hover:border-brand/40 hover:text-brand disabled:opacity-40"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0"
      >
        {listings.map((listing) => (
          <div
            key={listing.slug}
            className="w-[min(85vw,320px)] shrink-0 snap-start sm:w-[min(42vw,360px)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <PropertyCard listing={listing} />
          </div>

        ))}
      </div>

      {listings.length <= 15 && (
        <div className="mt-5 flex justify-center gap-1.5">
          {listings.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Go to stay ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                active === i ? "w-6 bg-brand" : "w-1.5 bg-stone-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
