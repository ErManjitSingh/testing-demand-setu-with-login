"use client";

import { MapPin } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

/** Destination combobox with trending suggestions, shared by every trip search. */
export default function DestinationInput({ value, onChange, suggestions }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef(null);
  const listId = useId();

  const matches = useMemo(() => {
    const needle = value.trim().toLowerCase();
    const pool = needle
      ? suggestions.filter((s) => s.label.toLowerCase().includes(needle))
      : suggestions.filter((s) => s.popular);
    return pool.slice(0, 7);
  }, [value, suggestions]);

  useEffect(() => {
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, []);

  const choose = (item) => {
    onChange(item.label);
    setOpen(false);
    setActive(-1);
  };

  const onKeyDown = (e) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % Math.max(1, matches.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === "Enter" && open && active >= 0 && matches[active]) {
      e.preventDefault();
      choose(matches[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <label className="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-stone-50 focus-within:bg-stone-50">
        <MapPin className="h-5 w-5 shrink-0 text-brand" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
            Where to?
          </span>
          <input
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            autoComplete="off"
            value={value}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder="Ladakh, Bali, honeymoon…"
            className="input-no-ios-zoom block w-full bg-transparent text-sm font-bold text-stone-900 outline-none placeholder:font-semibold placeholder:text-stone-400"
          />
        </span>
      </label>

      {open && matches.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="pk-zoom-in absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[70] origin-top overflow-hidden rounded-3xl border border-stone-200 bg-white p-2 shadow-2xl shadow-stone-900/15 md:min-w-[20rem]"
        >
          {!value.trim() ? (
            <li className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
              Trending now
            </li>
          ) : null}
          {matches.map((item, i) => (
            <li key={item.label} role="option" aria-selected={i === active}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(item)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                  i === active ? "bg-brand-muted" : "hover:bg-stone-50"
                }`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand">
                  <MapPin className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-stone-900">{item.label}</span>
                  <span className="block truncate text-xs text-stone-500">{item.hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
