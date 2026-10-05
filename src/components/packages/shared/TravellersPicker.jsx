"use client";

import { BedDouble, Baby, ChevronDown, Minus, Plus, User, Users } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import {
  CHILD_AGE_MAX,
  CHILD_AGE_MIN,
  TRAVELLER_LIMITS,
  formatTravellerSummary,
  getRoomsNeeded,
  syncChildAges,
} from "@/lib/tourTravellers";

const AGE_OPTIONS = Array.from({ length: CHILD_AGE_MAX - CHILD_AGE_MIN + 1 }, (_, i) => CHILD_AGE_MIN + i);

function Stepper({ value, min, max, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-brand hover:text-brand active:scale-90 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-stone-200 disabled:hover:text-stone-700"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span
        key={value}
        aria-live="polite"
        className="pk-zoom-in w-6 text-center text-base font-extrabold tabular-nums text-stone-900"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`Increase ${label}`}
        className="grid h-9 w-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-brand hover:text-brand active:scale-90 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-stone-200 disabled:hover:text-stone-700"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function Row({ icon: Icon, title, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-stone-900">{title}</p>
          <p className="text-xs text-stone-500">{hint}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/** Adult / child (with ages) / infant selector shared across listing, product page and forms. */
export function TravellersPanel({ value, onChange }) {
  const { adults, children, infants, childAges } = value;
  const rooms = getRoomsNeeded(adults);

  const update = (patch) => {
    const next = { ...value, ...patch };
    next.childAges = syncChildAges(next.childAges, next.children);
    onChange(next);
  };

  const setChildAge = (index, age) => {
    const nextAges = childAges.slice();
    nextAges[index] = age;
    update({ childAges: nextAges });
  };

  return (
    <div>
      <div className="divide-y divide-stone-100">
        <Row icon={User} title="Adults" hint="12+ years">
          <Stepper
            label="adults"
            value={adults}
            {...TRAVELLER_LIMITS.adults}
            onChange={(n) => update({ adults: n })}
          />
        </Row>
        <Row icon={Users} title="Children" hint={`Ages ${CHILD_AGE_MIN}–${CHILD_AGE_MAX}`}>
          <Stepper
            label="children"
            value={children}
            {...TRAVELLER_LIMITS.children}
            onChange={(n) => update({ children: n })}
          />
        </Row>
        <Row icon={Baby} title="Infants" hint="Under 2 · travel free">
          <Stepper
            label="infants"
            value={infants}
            {...TRAVELLER_LIMITS.infants}
            onChange={(n) => update({ infants: n })}
          />
        </Row>
      </div>

      {children > 0 ? (
        <div className="pk-fade mt-2 rounded-2xl bg-stone-50 p-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Age of each child
          </p>
          <div className="grid grid-cols-2 gap-2">
            {childAges.map((age, i) => (
              <label key={i} className="block">
                <span className="sr-only">Age of child {i + 1}</span>
                <select
                  value={age}
                  onChange={(e) => setChildAge(i, Number(e.target.value))}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-800 outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
                >
                  {AGE_OPTIONS.map((a) => (
                    <option key={a} value={a}>
                      Child {i + 1} · {a} yrs
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mt-3 flex items-center gap-2 rounded-xl bg-brand-muted px-3 py-2 text-xs font-semibold text-brand-dark">
        <BedDouble className="h-4 w-4 shrink-0" />
        {rooms} room{rooms > 1 ? "s" : ""} suggested · 2 adults per room, kids share with parents
      </p>
    </div>
  );
}

/**
 * Trigger + popover. `variant="hero"` is tuned for the dark hero search bar and
 * `variant="field"` for light forms. `inline` skips the popover and renders the panel.
 */
export default function TravellersPicker({
  value,
  onChange,
  variant = "field",
  inline = false,
  label = "Travellers",
  align = "left",
  mode = "popover", // "accordion" expands in the flow (for scrollable / sticky containers)
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (inline) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-3">
        <TravellersPanel value={value} onChange={onChange} />
      </div>
    );
  }

  const summary = formatTravellerSummary(value);
  const triggerClass =
    variant === "hero"
      ? "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition hover:bg-stone-50"
      : "flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left transition hover:border-stone-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className={triggerClass}
      >
        <Users className="h-5 w-5 shrink-0 text-brand" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
            {label}
          </span>
          <span className="block truncate text-sm font-bold text-stone-900">{summary}</span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && mode === "accordion" ? (
        <div id={panelId} className="pk-fade mt-2 rounded-2xl border border-stone-200 bg-white p-3">
          <TravellersPanel value={value} onChange={onChange} />
        </div>
      ) : null}

      {open && mode === "popover" ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Choose travellers"
          className={`pk-zoom-in absolute top-[calc(100%+0.5rem)] z-[70] w-[min(22rem,calc(100vw-2rem))] origin-top rounded-3xl border border-stone-200 bg-white p-4 shadow-2xl shadow-stone-900/15 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <TravellersPanel value={value} onChange={onChange} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-full bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            Done
          </button>
        </div>
      ) : null}
    </div>
  );
}
