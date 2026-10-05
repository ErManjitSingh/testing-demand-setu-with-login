"use client";

import { useCallback, useRef } from "react";

export function useSnapScroll() {
  const scrollerRef = useRef(null);

  const scrollByDir = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-snap-card]");
    const gap = 16;
    const delta = card ? card.getBoundingClientRect().width + gap : el.clientWidth * 0.82;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  }, []);

  return {
    scrollerRef,
    scrollPrev: () => scrollByDir(-1),
    scrollNext: () => scrollByDir(1),
  };
}

export const snapRowClass =
  "no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-3 sm:-mx-6 sm:mt-10 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:snap-none lg:overflow-visible lg:px-0 lg:pb-0";

export const sliderRowClass =
  "no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-4 sm:-mx-6 sm:px-6";
