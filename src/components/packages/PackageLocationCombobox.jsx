"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function filterOptions(options, query) {
  const q = query.trim().toLowerCase();
  if (!q) return options;

  const startsWith = [];
  const contains = [];
  for (const name of options) {
    const key = name.toLowerCase();
    if (key.startsWith(q)) startsWith.push(name);
    else if (key.includes(q)) contains.push(name);
  }
  return [...startsWith, ...contains];
}

export default function PackageLocationCombobox({
  options = [],
  value = "",
  onChange,
  placeholder = "Search destination…",
  emptyMessage = "No matching destination",
  highlightFirst = null,
}) {
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery(value);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open, value]);

  const filtered = useMemo(() => {
    const list = filterOptions(options, query);
    if (!query.trim() && highlightFirst && list.includes(highlightFirst)) {
      return [highlightFirst, ...list.filter((item) => item !== highlightFirst)];
    }
    return list;
  }, [options, query, highlightFirst]);

  const pick = (name) => {
    onChange?.(name);
    setQuery(name);
    setOpen(false);
    inputRef.current?.blur();
  };

  const showDropdown = open && (filtered.length > 0 || query.trim());

  return (
    <div ref={rootRef} className="relative">
      <div
        className={`flex items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 transition ${
          open ? "border-brand ring-2 ring-brand/25" : "border-stone-200 hover:border-stone-300"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
          <PinIcon />
        </span>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) onChange?.("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setQuery(value);
            }
            if (e.key === "Enter" && filtered[0]) {
              e.preventDefault();
              pick(filtered[0]);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              if (!rootRef.current?.contains(document.activeElement)) {
                setQuery(value);
              }
            }, 120);
          }}
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-stone-900 outline-none placeholder:font-normal placeholder:text-stone-400"
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => {
            setOpen((prev) => !prev);
            if (!open) inputRef.current?.focus();
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-50 hover:text-stone-600"
          aria-label="Toggle destination list"
        >
          <ChevronIcon open={open} />
        </button>
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[200] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_16px_48px_-12px_rgba(0,0,0,0.18)]">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-stone-500">{emptyMessage}</p>
          ) : (
            <ul className="no-scrollbar max-h-[min(42vh,280px)] overflow-y-auto py-1.5">
              {filtered.map((name) => {
                const selected = name === value;
                return (
                  <li key={name}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(name)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition ${
                        selected
                          ? "bg-brand-muted font-semibold text-brand"
                          : "text-stone-800 hover:bg-stone-50"
                      }`}
                    >
                      <span className="truncate">{name}</span>
                      {selected && <CheckIcon />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function PinIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
