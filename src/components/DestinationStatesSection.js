"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import SectionHeading from "@/components/SectionHeading";
import StateCardsSkeleton from "@/components/location/StateCardsSkeleton";
import { useInView } from "@/hooks/useInView";
import { fetchHotelStates } from "@/store/locationSlice";
import { getStateImage } from "@/components/state/stateImageMap";
import {
  buildListingsSearchUrl,
  DEFAULT_GUESTS,
  persistTripSearch,
} from "@/lib/bookingSearch";
import { markListingsScrollIntent } from "@/components/listings/ListingsScrollToResults";
import { logSearchSelection } from "@/lib/logSearchSelection";
import { getDefaultBookingDates } from "@/lib/dates";

export default function DestinationStatesSection() {
  const dispatch = useDispatch();
  const trackRef = useRef(null);
  const hasRequested = useRef(false);
  const { ref: sectionRef, inView } = useInView({ rootMargin: "160px" });
  const { states, statesStatus, statesError } = useSelector((state) => state.locations);

  useEffect(() => {
    if (!inView || hasRequested.current) return;
    hasRequested.current = true;
    dispatch(fetchHotelStates());
  }, [dispatch, inView]);

  const topStates = useMemo(() => states, [states]);
  const defaultDates = useMemo(() => getDefaultBookingDates(), []);

  const scrollByCards = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-state-card='true']");
    const cardWidth = card ? card.clientWidth : 160;
    track.scrollBy({
      left: direction === "left" ? -(cardWidth * 2) : cardWidth * 2,
      behavior: "smooth",
    });
  };

  const showSkeleton = statesStatus === "loading" || (inView && statesStatus === "idle");
  const showStates = statesStatus === "succeeded" && topStates.length > 0;

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-white to-brand-muted/30 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Destinations"
          title="Where will you go next?"
          subtitle="Trending regions with the highest guest satisfaction this season."
          action={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollByCards("left")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:border-brand hover:text-brand"
                aria-label="Scroll states left"
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={() => scrollByCards("right")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-foreground transition hover:border-brand hover:text-brand"
                aria-label="Scroll states right"
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          }
        />

        <div
          ref={trackRef}
          className="no-scrollbar mt-8 flex gap-4 overflow-x-auto pb-2"
          aria-busy={showSkeleton}
          aria-label={showSkeleton ? "Loading destinations" : undefined}
        >
          {showSkeleton && <StateCardsSkeleton />}

          {statesStatus === "failed" && !showSkeleton && (
            <div className="w-full py-6 text-center text-sm text-red-600">
              {statesError || "Unable to load destinations"}
            </div>
          )}

          {showStates &&
            topStates.map((stateName) => (
              <Link
                key={stateName}
                href={buildListingsSearchUrl({
                  category: "hotel",
                  state: stateName,
                  checkIn: defaultDates.checkIn,
                  checkOut: defaultDates.checkOut,
                  guests: DEFAULT_GUESTS,
                })}
                onClick={() => {
                  const trip = {
                    category: "hotel",
                    state: stateName,
                    city: "",
                    locationKind: "state",
                    checkIn: defaultDates.checkIn,
                    checkOut: defaultDates.checkOut,
                    guests: DEFAULT_GUESTS,
                  };
                  logSearchSelection("state-click", trip);
                  persistTripSearch(trip);
                  markListingsScrollIntent();
                }}
                data-state-card="true"
                className="card-shine group relative w-[140px] shrink-0 overflow-hidden rounded-2xl shadow-lg ring-1 ring-stone-900/5 sm:w-[160px]"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={getStateImage(stateName)}
                    alt={stateName}
                    fill
                    loading="lazy"
                    className="object-cover transition duration-500 group-hover:scale-110"
                    sizes="160px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center text-white">
                    <p className="text-sm font-bold">{stateName}</p>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
function ArrowIcon({ direction }) {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  );
}

