"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { startNavigationLoading } from "@/lib/navigationLoading";
import { useCategoryExplore } from "@/hooks/useCategoryExplore";
import { HOME_COLLECTIONS } from "@/lib/categoryExplore";

function CategoryCard({ cat, className = "", onExplore }) {
  const countSuffix = cat.countSuffix ?? "stays";

  return (
    <article
      className={`card-shine group relative block overflow-hidden rounded-3xl shadow-xl ring-1 ring-stone-900/10 transition hover:-translate-y-1 hover:shadow-2xl ${className}`}
    >
      <div className="relative aspect-[3/4] sm:aspect-[4/5]">
        <Image
          src={cat.cover}
          alt={cat.label}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
          sizes="(max-width:640px) 85vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-brand/20" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand/30 to-transparent opacity-0 transition group-hover:opacity-100" />

        <div className="absolute left-0 right-0 top-0 flex items-start justify-between p-5">
          <span className="text-4xl drop-shadow-lg">{cat.icon}</span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
            {cat.count} {countSuffix}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <h3 className="text-2xl font-extrabold">{cat.label}</h3>
          <p className="mt-1 text-sm text-stone-300">{cat.description}</p>
          <button
            type="button"
            onClick={() => onExplore(cat)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-brand-dark shadow-lg transition group-hover:gap-3"
          >
            Explore collection
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function CategoryShowcase() {
  const router = useRouter();
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const { openExplore, modal } = useCategoryExplore();

  const scrollTo = useCallback((index) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[index];
    if (slide) {
      slide.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setActive(index);
    }
  }, []);

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || track.children.length === 0) return;
    const slideWidth = track.children[0].offsetWidth;
    const gap = 16;
    const index = Math.round(track.scrollLeft / (slideWidth + gap));
    setActive(Math.min(Math.max(index, 0), HOME_COLLECTIONS.length - 1));
  }, []);

  const handleExplore = useCallback(
    (cat) => {
      if (cat.href) {
        startNavigationLoading();
        router.push(cat.href);
        return;
      }
      openExplore(cat);
    },
    [openExplore, router]
  );

  return (
    <>
      {/* Mobile slider */}
      <div className="mt-8 sm:hidden">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2"
        >
          {HOME_COLLECTIONS.map((cat) => (
            <div
              key={cat.id}
              className="w-[85vw] max-w-[320px] shrink-0 snap-center"
            >
              <CategoryCard cat={cat} onExplore={handleExplore} />
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            {HOME_COLLECTIONS.map((cat, i) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to ${cat.label}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  active === i ? "w-7 bg-brand" : "w-2 bg-stone-300"
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-muted">
            Swipe to explore · {active + 1} / {HOME_COLLECTIONS.length}
          </p>
        </div>
      </div>

      {/* Desktop grid */}
      <div className="mt-8 hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {HOME_COLLECTIONS.map((cat, i) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            onExplore={handleExplore}
            className={i === 1 ? "lg:-mt-4 lg:mb-4" : ""}
          />
        ))}
      </div>

      {modal}
    </>
  );
}
