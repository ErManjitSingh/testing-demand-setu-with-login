"use client";

import { CalendarDays, Info } from "lucide-react";
import { useMemo } from "react";
import TravellersPicker from "@/components/packages/shared/TravellersPicker";
import { formatDisplayDate, todayInputValue } from "@/lib/tourTravellers";

/** "Your trip" card: travel date + adults/children, applied instantly to prices below. */
export default function TripDetailsCard({ date, travellers, onDateChange, onTravellersChange }) {
  const minDate = useMemo(() => todayInputValue(), []);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-brand-muted via-white to-orange-50 p-4 ring-1 ring-orange-200/70">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand">Your trip</p>

      <label className="mt-3 flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5 transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/25 hover:border-stone-300">
        <CalendarDays className="h-5 w-5 shrink-0 text-brand" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Travel date
          </span>
          <input
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="input-no-ios-zoom block w-full bg-transparent text-sm font-bold text-stone-900 outline-none"
          />
        </span>
      </label>

      <div className="mt-2">
        <TravellersPicker label="Adults & children" value={travellers} onChange={onTravellersChange} />
      </div>

      <p className="mt-3 flex items-start gap-2 text-[11px] font-medium leading-relaxed text-stone-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
        {date
          ? `Prices below are estimated for ${formatDisplayDate(date, { day: "numeric", month: "short" })}.`
          : "Add a date to see which trips are in season. Prices update for your group size."}
      </p>
    </div>
  );
}
