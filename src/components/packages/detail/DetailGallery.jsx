"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, Maximize2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function Lightbox({ images, index, onClose, onChange }) {
  const count = images.length;
  const go = useCallback((dir) => onChange((index + dir + count) % count), [index, count, onChange]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  const current = images[index];

  return (
    <div className="pk-fade fixed inset-0 z-[120] flex flex-col bg-stone-950/95 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Photo gallery">
      <div className="flex items-center justify-between px-4 py-3 text-white sm:px-6">
        <p className="text-sm font-bold">
          {index + 1} <span className="text-white/50">/ {count}</span>
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        <div key={current.src} className="pk-zoom-in absolute inset-0 mx-4 sm:mx-20">
          <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" priority />
        </div>
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 sm:left-5"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/25 sm:right-5"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}
      </div>

      <div className="px-4 pb-5 pt-3 sm:px-6">
        <p className="mb-3 text-center text-sm font-semibold text-white/80">{current.caption}</p>
        <div className="no-scrollbar mx-auto flex max-w-3xl justify-start gap-2 overflow-x-auto sm:justify-center">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => onChange(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition ${
                i === index ? "ring-brand" : "opacity-60 ring-transparent hover:opacity-100"
              }`}
            >
              <Image src={img.src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Bento-style mosaic + fullscreen lightbox. */
export default function DetailGallery({ images, badge }) {
  const [open, setOpen] = useState(null);
  const grid = images.slice(0, 5);
  const extra = Math.max(0, images.length - 5);
  const close = useCallback(() => setOpen(null), []);

  const tile = (img, i, className) => (
    <button
      key={img.src}
      type="button"
      onClick={() => setOpen(i)}
      aria-label={`Open photo: ${img.caption}`}
      className={`group relative overflow-hidden bg-stone-200 ${className}`}
    >
      <Image
        src={img.src}
        alt={img.alt}
        fill
        priority={i === 0}
        sizes={i === 0 ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"}
        className="object-cover transition duration-[900ms] ease-out group-hover:scale-110"
      />
      <span className="absolute inset-0 bg-stone-950/0 transition group-hover:bg-stone-950/20" />
      {i === 0 && badge ? (
        <span className="absolute left-4 top-4 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-900 shadow-lg">
          {badge}
        </span>
      ) : null}
      {i === 4 && extra > 0 ? (
        <span className="absolute inset-0 grid place-items-center bg-stone-950/55 text-lg font-extrabold text-white backdrop-blur-[2px]">
          +{extra} more
        </span>
      ) : null}
    </button>
  );

  return (
    <>
      <div className="relative">
        {/* Mobile: swipeable strip */}
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 sm:hidden">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`Open photo: ${img.caption}`}
              className="relative aspect-[4/3] w-[86%] shrink-0 snap-center overflow-hidden rounded-3xl bg-stone-200"
            >
              <Image src={img.src} alt={img.alt} fill priority={i === 0} sizes="90vw" className="object-cover" />
              {i === 0 && badge ? (
                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-stone-900 shadow-lg">
                  {badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Desktop: bento mosaic */}
        <div className="hidden h-[460px] grid-cols-4 grid-rows-2 gap-2.5 overflow-hidden rounded-[2rem] sm:grid lg:h-[520px]">
          {grid[0] && tile(grid[0], 0, "col-span-2 row-span-2")}
          {grid[1] && tile(grid[1], 1, "")}
          {grid[2] && tile(grid[2], 2, "")}
          {grid[3] && tile(grid[3], 3, "")}
          {grid[4] && tile(grid[4], 4, "")}
        </div>

        <button
          type="button"
          onClick={() => setOpen(0)}
          className="absolute bottom-4 right-4 hidden items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-extrabold text-stone-900 shadow-xl transition hover:scale-105 active:scale-95 sm:inline-flex"
        >
          <Images className="h-4 w-4 text-brand" />
          View all {images.length} photos
          <Maximize2 className="h-3.5 w-3.5 text-stone-400" />
        </button>
      </div>

      {open != null ? <Lightbox images={images} index={open} onClose={close} onChange={setOpen} /> : null}
    </>
  );
}
