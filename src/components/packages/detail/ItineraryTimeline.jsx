"use client";

import {
  BedDouble,
  Car,
  Check,
  ChevronDown,
  Coffee,
  Plane,
  Sunrise,
  Utensils,
} from "lucide-react";
import { useState } from "react";
import AnimateIn from "@/components/packages/AnimateIn";

const MEAL_ICON = { Breakfast: Coffee, Lunch: Utensils, Dinner: Utensils };

function DayCard({ item, open, onToggle, isFirst, isLast }) {
  const Marker = isFirst ? Plane : isLast ? Sunrise : null;
  return (
    <div className="relative pl-14 sm:pl-20">
      <span
        aria-hidden
        className={`absolute left-0 top-0 grid h-11 w-11 place-items-center rounded-2xl text-sm font-extrabold shadow-md transition-all duration-500 sm:h-14 sm:w-14 sm:rounded-3xl ${
          open ? "scale-105 bg-brand text-white shadow-brand/40" : "bg-white text-brand ring-1 ring-stone-200"
        }`}
      >
        {Marker ? <Marker className="h-5 w-5" /> : item.day}
      </span>

      <div
        className={`overflow-hidden rounded-3xl bg-white transition-all duration-500 ${
          open ? "shadow-lg shadow-stone-900/5 ring-1 ring-brand/30" : "ring-1 ring-stone-200/80 hover:ring-stone-300"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5"
        >
          <span>
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand">
              Day {item.day}
              {item.place ? <span className="text-stone-400"> · {item.place}</span> : null}
            </span>
            <span className="mt-1 block text-lg font-extrabold leading-snug text-stone-900">{item.title}</span>
            {!open ? (
              <span className="mt-1 line-clamp-1 block text-sm text-stone-500">{item.summary}</span>
            ) : null}
          </span>
          <ChevronDown
            className={`mt-1 h-5 w-5 shrink-0 text-stone-400 transition-transform duration-300 ${open ? "rotate-180 text-brand" : ""}`}
          />
        </button>

        <div className="pk-collapse" data-open={open}>
          <div>
            <div className="border-t border-dashed border-stone-200 px-4 pb-5 pt-4 sm:px-5">
              <p className="text-sm leading-relaxed text-stone-600">{item.summary}</p>

              <ul className="mt-4 space-y-2.5">
                {item.activities.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-sm font-medium text-stone-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                      <Check className="h-3 w-3" strokeWidth={3.5} />
                    </span>
                    {a}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap gap-2">
                {item.meals.length > 0 ? (
                  item.meals.map((meal) => {
                    const Icon = MEAL_ICON[meal] ?? Utensils;
                    return (
                      <span
                        key={meal}
                        className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {meal}
                      </span>
                    );
                  })
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-500">
                    <Utensils className="h-3.5 w-3.5" />
                    Meals on your own
                  </span>
                )}
                {item.transfer ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800">
                    <Car className="h-3.5 w-3.5" />
                    {item.transfer}
                  </span>
                ) : null}
                {item.stay ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-800">
                    <BedDouble className="h-3.5 w-3.5" />
                    {item.stay}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ItineraryTimeline({ itinerary }) {
  const [openDays, setOpenDays] = useState(() => new Set([1]));
  const allOpen = openDays.size === itinerary.length;

  const toggle = (day) =>
    setOpenDays((current) => {
      const next = new Set(current);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-stone-500">
          {itinerary.length}-day plan · tap a day to see the details
        </p>
        <button
          type="button"
          onClick={() => setOpenDays(allOpen ? new Set() : new Set(itinerary.map((d) => d.day)))}
          className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-brand shadow-sm ring-1 ring-stone-200 transition hover:ring-brand/40 active:scale-95"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="relative">
        <span
          aria-hidden
          className="pk-grow-y absolute bottom-6 left-[21px] top-6 w-0.5 rounded-full bg-gradient-to-b from-brand via-orange-300 to-stone-200 sm:left-[27px]"
        />
        <ol className="space-y-4">
          {itinerary.map((item, i) => (
            <AnimateIn as="li" key={item.day} delay={Math.min(i, 4) * 60}>
              <DayCard
                item={item}
                open={openDays.has(item.day)}
                onToggle={() => toggle(item.day)}
                isFirst={i === 0}
                isLast={i === itinerary.length - 1 && itinerary.length > 1}
              />
            </AnimateIn>
          ))}
        </ol>
      </div>
    </div>
  );
}
