"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { useWishlist } from "@/components/packages/shared/useWishlist";

export default function WishlistButton({ packageId, className = "", label = false, tone = "glass" }) {
  const { has, toggle } = useWishlist();
  const saved = has(packageId);
  const [pops, setPops] = useState(0);

  const tones = {
    glass: "bg-white/90 text-stone-700 shadow-md backdrop-blur hover:bg-white",
    solid: "bg-white text-stone-700 shadow-md ring-1 ring-stone-200 hover:ring-brand/40",
    dark: "bg-black/35 text-white backdrop-blur hover:bg-black/55",
  };

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved trips" : "Save this trip"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setPops((n) => n + 1);
        toggle(packageId);
      }}
      className={`inline-flex items-center gap-2 rounded-full transition active:scale-95 ${
        label ? "px-4 py-2.5 text-sm font-bold" : "h-10 w-10 justify-center"
      } ${tones[tone]} ${className}`}
    >
      <Heart
        key={pops}
        className={`h-[18px] w-[18px] transition-colors ${pops ? "pk-pop" : ""} ${
          saved ? "fill-rose-500 text-rose-500" : ""
        }`}
      />
      {label ? <span>{saved ? "Saved" : "Save"}</span> : null}
    </button>
  );
}
