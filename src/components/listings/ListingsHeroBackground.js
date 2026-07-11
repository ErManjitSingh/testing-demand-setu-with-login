"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const SLIDE_INTERVAL_MS = 5000;

export default function ListingsHeroBackground({ images, fallbackCover, fallbackAlt }) {
  const slides = useMemo(() => {
    const fromSeo = Array.isArray(images)
      ? images
          .filter((img) => img?.preview)
          .map((img, i) => ({
            src: img.preview,
            alt: img.name || fallbackAlt || `Destination image ${i + 1}`,
          }))
      : [];

    if (fromSeo.length > 0) return fromSeo;

    return [
      {
        src: fallbackCover,
        alt: fallbackAlt || "Destination stays",
      },
    ];
  }, [images, fallbackCover, fallbackAlt]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <>
      {slides.map((slide, i) => (
        <Image
          key={`${slide.src}-${i}`}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          className={`object-cover transition-opacity duration-[1200ms] ease-in-out ${
            i === activeIndex ? "opacity-100" : "opacity-0"
          }`}
          sizes="100vw"
        />
      ))}

      {slides.length > 1 && (
        <div
          className="absolute bottom-5 left-1/2 z-[2] flex -translate-x-1/2 gap-2 sm:bottom-6"
          aria-hidden
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-[0_1px_6px_rgba(0,0,0,0.45)] ${
                i === activeIndex ? "w-7 bg-white" : "w-1.5 bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
