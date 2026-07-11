"use client";

import { useCallback, useRef, useState } from "react";
import PropertyCard from "@/components/PropertyCard";

export default function RecommendedSlider({
  listings,
  requireBooking = false,
  onBookingBlocked,
}) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track?.children.length) return;
    const w = track.children[0].offsetWidth + 16;
    const i = Math.round(track.scrollLeft / w);
    setActive(Math.min(i, listings.length - 1));
  }, [listings.length]);

  if (!listings.length) return null;

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Editor&apos;s choice
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-foreground sm:text-2xl">
            Top picks for you
          </h2>
        </div>
        <span className="rounded-full bg-brand-muted px-3 py-1 text-xs font-bold text-brand-dark ring-1 ring-brand/10 lg:hidden">
          {active + 1} / {listings.length}
        </span>
      </div>

      <div className="lg:hidden">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
        >
          {listings.map((listing) => (
            <div
              key={listing.slug}
              className="w-[min(85vw,300px)] shrink-0 snap-center"
            >
              <PropertyCard
                listing={listing}
                requireBooking={requireBooking}
                onBookingBlocked={onBookingBlocked}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-1.5">
          {listings.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() =>
                trackRef.current?.children[i]?.scrollIntoView({
                  behavior: "smooth",
                  inline: "center",
                })
              }
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                active === i ? "w-6 bg-brand" : "w-1.5 bg-stone-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="hidden gap-5 lg:grid lg:grid-cols-3">
        {listings.map((listing) => (
          <PropertyCard
            key={listing.slug}
            listing={listing}
            requireBooking={requireBooking}
            onBookingBlocked={onBookingBlocked}
          />
        ))}
      </div>
    </section>
  );
}
