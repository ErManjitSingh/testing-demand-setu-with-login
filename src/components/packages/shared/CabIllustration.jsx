"use client";

import { useId } from "react";

/**
 * Side-view vehicle illustrations (pure SVG, no image requests) for each cab option.
 * viewBox is shared so every vehicle sits on the same ground line and scales together.
 */

const PALETTE = {
  hatchback: { top: "#38bdf8", bottom: "#0369a1" },
  sedan: { top: "#f5f5f4", bottom: "#a8a29e" },
  suv: { top: "#57534e", bottom: "#1c1917" },
  innova: { top: "#d6b98c", bottom: "#78552b" },
  tempo: { top: "#ffffff", bottom: "#d6d3d1" },
  coach: { top: "#ffffff", bottom: "#d6d3d1" },
};

function Wheel({ cx, id }) {
  return (
    <g>
      <circle cx={cx} cy="88" r="15" fill="#1c1917" />
      <circle cx={cx} cy="88" r="9" fill={`url(#${id}-rim)`} />
      <circle cx={cx} cy="88" r="3" fill="#57534e" />
    </g>
  );
}

function Glass({ d, id }) {
  return <path d={d} fill={`url(#${id}-glass)`} stroke="#0c4a6e" strokeOpacity="0.25" strokeWidth="0.8" />;
}

function Car({ type, id }) {
  const body = `url(#${id}-body)`;

  if (type === "coach") {
    return (
      <g>
        <path d="M6 88 L6 30 C6 24 10 20 16 20 L196 20 C206 20 214 24 220 32 L232 52 C234 56 234 60 234 66 L234 88 Z" fill={body} />
        <path d="M6 66 L234 66 L234 74 L6 74 Z" fill="#f97316" />
        {[18, 52, 86, 120, 154].map((x) => (
          <Glass key={x} d={`M${x} 28 h28 a3 3 0 0 1 3 3 v16 h-34 v-16 a3 3 0 0 1 3 -3 Z`} id={id} />
        ))}
        <Glass d="M190 28 L208 28 C212 28 214 30 216 33 L224 48 L190 48 Z" id={id} />
        <rect x="224" y="62" width="9" height="5" rx="2" fill="#fde68a" />
        <Wheel cx={52} id={id} />
        <Wheel cx={82} id={id} />
        <Wheel cx={196} id={id} />
      </g>
    );
  }

  if (type === "tempo") {
    return (
      <g>
        <path d="M10 88 L10 44 C10 38 14 34 20 34 L178 34 C186 34 192 38 198 44 L222 60 C226 63 228 68 228 74 L228 88 Z" fill={body} />
        <path d="M10 66 L228 66 L228 73 L10 73 Z" fill="#2563eb" />
        {[22, 56, 90, 124].map((x) => (
          <Glass key={x} d={`M${x} 42 h28 a3 3 0 0 1 3 3 v14 h-34 v-14 a3 3 0 0 1 3 -3 Z`} id={id} />
        ))}
        <Glass d="M168 42 L180 42 C184 42 187 44 190 47 L206 60 L168 60 Z" id={id} />
        <rect x="220" y="66" width="8" height="5" rx="2" fill="#fde68a" />
        <Wheel cx={58} id={id} />
        <Wheel cx={190} id={id} />
      </g>
    );
  }

  if (type === "suv" || type === "innova") {
    return (
      <g>
        <path d="M16 88 L16 62 C16 56 20 54 26 54 L52 52 L66 38 C70 34 76 32 84 32 L156 32 C166 32 172 36 178 44 L198 54 L212 58 C218 60 222 66 222 74 L222 88 Z" fill={body} />
        <Glass d="M70 52 L80 39 C82 37 84 36 88 36 L108 36 L108 52 Z" id={id} />
        <Glass d="M113 36 L138 36 L138 52 L113 52 Z" id={id} />
        <Glass d="M143 36 L156 36 C162 36 166 39 170 45 L178 52 L143 52 Z" id={id} />
        {type === "innova" ? <rect x="206" y="66" width="14" height="4" rx="2" fill="#e7e5e4" /> : null}
        <rect x="212" y="62" width="9" height="5" rx="2" fill="#fde68a" />
        <rect x="16" y="62" width="6" height="5" rx="2" fill="#ef4444" />
        <Wheel cx={62} id={id} />
        <Wheel cx={178} id={id} />
      </g>
    );
  }

  if (type === "hatchback") {
    return (
      <g>
        <path d="M24 88 L24 78 C24 70 30 66 40 64 L62 58 C70 46 82 38 98 38 L146 38 C158 38 166 44 174 52 L204 62 C212 65 216 70 216 78 L216 88 Z" fill={body} />
        <Glass d="M70 56 L82 44 C86 41 90 40 96 40 L114 40 L114 56 Z" id={id} />
        <Glass d="M119 40 L144 40 C152 40 158 45 164 51 L168 56 L119 56 Z" id={id} />
        <rect x="206" y="66" width="9" height="5" rx="2" fill="#fde68a" />
        <rect x="24" y="68" width="6" height="5" rx="2" fill="#ef4444" />
        <Wheel cx={62} id={id} />
        <Wheel cx={176} id={id} />
      </g>
    );
  }

  // sedan
  return (
    <g>
      <path d="M18 88 L18 78 C18 70 24 66 34 64 L62 58 C72 46 84 40 100 40 L146 40 C160 40 172 48 182 60 L204 64 C214 66 220 70 220 78 L220 88 Z" fill={body} />
      <Glass d="M70 58 L84 47 L116 47 L116 58 Z" id={id} />
      <Glass d="M122 47 L146 47 C156 47 164 53 172 58 L122 58 Z" id={id} />
      <rect x="210" y="68" width="9" height="5" rx="2" fill="#fde68a" />
      <rect x="18" y="68" width="6" height="5" rx="2" fill="#ef4444" />
      <Wheel cx={62} id={id} />
      <Wheel cx={176} id={id} />
    </g>
  );
}

export function CabIllustration({ type = "sedan", className = "" }) {
  const uid = useId().replace(/:/g, "");
  const id = `cab-${uid}`;
  const colors = PALETTE[type] ?? PALETTE.sedan;

  return (
    <svg viewBox="0 0 240 110" className={className} role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors.top} />
          <stop offset="1" stopColor={colors.bottom} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bae6fd" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <radialGradient id={`${id}-rim`}>
          <stop offset="0" stopColor="#f5f5f4" />
          <stop offset="1" stopColor="#a8a29e" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="101" rx="104" ry="5" fill="#1c1917" opacity="0.14" />
      <Car type={type} id={id} />
    </svg>
  );
}

/** A soft "stage" with the vehicle on a road — used on cab cards. */
export default function CabStage({ type, className = "", children }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 ${className}`}
    >
      <span aria-hidden className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/60 blur-sm" />
      <span aria-hidden className="absolute left-4 top-4 h-3 w-10 rounded-full bg-white/80" />
      <span aria-hidden className="absolute left-12 top-8 h-2.5 w-7 rounded-full bg-white/70" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-stone-300/70 to-transparent" />
      <span aria-hidden className="absolute inset-x-6 bottom-2.5 h-px border-t border-dashed border-white/90" />
      <CabIllustration type={type} className="relative mx-auto h-full w-full max-w-[17rem] px-1.5 pb-1 pt-3 drop-shadow-sm" />
      {children}
    </div>
  );
}
