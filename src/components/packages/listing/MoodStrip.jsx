"use client";

import { getThemeIcon } from "@/components/packages/shared/themeIcons";
import { PACKAGE_THEMES } from "@/lib/tourPackageMeta";

const TILE_TINTS = [
  "from-sky-100 to-sky-50 text-sky-700",
  "from-cyan-100 to-cyan-50 text-cyan-700",
  "from-amber-100 to-amber-50 text-amber-700",
  "from-orange-100 to-orange-50 text-orange-700",
  "from-emerald-100 to-emerald-50 text-emerald-700",
  "from-rose-100 to-rose-50 text-rose-700",
  "from-violet-100 to-violet-50 text-violet-700",
  "from-slate-200 to-slate-50 text-slate-700",
  "from-lime-100 to-lime-50 text-lime-700",
];

export default function MoodStrip({ active, counts, onToggle }) {
  return (
    <section aria-label="Browse by trip style" className="relative z-10 -mt-1 border-b border-stone-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          {PACKAGE_THEMES.map((theme, i) => {
            const Icon = getThemeIcon(theme.id);
            const isActive = active.includes(theme.id);
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onToggle(theme.id)}
                aria-pressed={isActive}
                className={`group flex shrink-0 items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left transition duration-300 active:scale-95 ${
                  isActive
                    ? "border-brand bg-brand text-white shadow-lg shadow-brand/30"
                    : "border-stone-200 bg-white hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
                }`}
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br transition group-hover:rotate-6 group-hover:scale-110 ${
                    isActive ? "from-white/25 to-white/10 text-white" : TILE_TINTS[i % TILE_TINTS.length]
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-extrabold leading-tight">{theme.label}</span>
                  <span className={`block text-[11px] font-semibold ${isActive ? "text-white/75" : "text-stone-400"}`}>
                    {counts[theme.id] ?? 0} trips
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
