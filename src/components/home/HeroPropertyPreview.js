"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import PropertyBookingLink from "@/components/booking/PropertyBookingLink";
import ListingsBookingAlert from "@/components/listings/ListingsBookingAlert";
import { CATEGORIES } from "@/lib/listings";

/** Fixed showcase photos only — never API images in the hero. */
const HERO_STATIC_IMAGES = [
  CATEGORIES[0].cover,
  CATEGORIES[1].cover,
  CATEGORIES[2].cover,
];

function HeroPreviewImage({ src, alt, sizes, priority = false }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className="object-cover"
      sizes={sizes}
    />
  );
}

export default function HeroPropertyPreview({ spotlight, sideCards = [] }) {
  const [alert, setAlert] = useState("");

  const onBlocked = useCallback((message) => {
    setAlert(message);
    document.getElementById("hero-search")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  if (!spotlight) return null;

  return (
    <>
      <ListingsBookingAlert message={alert} onDismiss={() => setAlert("")} />

      <PropertyBookingLink
        listing={spotlight}
        slug={spotlight.slug}
        requireBooking
        onBlocked={onBlocked}
        className="animate-float absolute right-0 top-0 w-[72%] overflow-hidden rounded-3xl shadow-2xl ring-2 ring-white/30"
      >
        <div className="relative aspect-[4/5]">
          <HeroPreviewImage
            src={HERO_STATIC_IMAGES[0]}
            alt={spotlight.title}
            sizes="400px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs font-bold text-orange-200">Featured</p>
            <p className="truncate text-lg font-bold" title={spotlight.title}>
              {spotlight.title}
            </p>
          </div>
        </div>
      </PropertyBookingLink>

      {sideCards.map((item, i) => (
        <PropertyBookingLink
          key={item.slug}
          listing={item}
          slug={item.slug}
          requireBooking
          onBlocked={onBlocked}
          className={`animate-float-delay absolute overflow-hidden rounded-2xl shadow-xl ring-2 ring-white/25 ${
            i === 0 ? "left-0 top-8 w-[42%]" : "bottom-0 left-8 w-[38%]"
          }`}
        >
          <div className="relative aspect-square">
            <HeroPreviewImage
              src={HERO_STATIC_IMAGES[i + 1] ?? HERO_STATIC_IMAGES[2]}
              alt={item.title}
              sizes="200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <p
              className="absolute bottom-2 left-2 right-2 truncate text-[10px] font-bold text-white sm:text-xs"
              title={item.title}
            >
              {item.title}
            </p>
          </div>
        </PropertyBookingLink>
      ))}
    </>
  );
}
