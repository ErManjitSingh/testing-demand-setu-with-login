"use client";

import Image from "next/image";

const HERO_BG =
  "https://images.pexels.com/photos/1470502/pexels-photo-1470502.jpeg?auto=compress&cs=tinysrgb&w=1920";

export default function ListPropertyBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="list-property-kenburns absolute inset-0 scale-105">
        <Image
          src={HERO_BG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-stone-950/88 via-stone-950/62 to-stone-900/45" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/92 via-stone-950/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(234,88,12,0.22),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(249,115,22,0.12),transparent_50%)]" />

      <div className="list-property-mist absolute inset-0 opacity-40" />
    </div>
  );
}
