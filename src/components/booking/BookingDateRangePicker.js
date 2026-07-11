"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatDateRange,
  formatShortDate,
  getMonthDays,
  isInRange,
  isSameDay,
  startOfDay,
} from "@/lib/dates";
import MobilePickerSheet, { useIsMobile } from "@/components/booking/MobilePickerSheet";

function usePickerOpen(controlledOpen, onOpenChange) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (value) => {
    const next = typeof value === "function" ? value(open) : value;
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  return [open, setOpen];
}

export default function BookingDateRangePicker({
  checkIn,
  checkOut,
  onChange,
  variant = "combined",
  className = "",
  heroLayout = false,
  open: controlledOpen,
  onOpenChange,
  popoverClassName = "",
  compactPopover = false,
}) {
  const [open, setOpen] = usePickerOpen(controlledOpen, onOpenChange);
  const [phase, setPhase] = useState("in");
  const ref = useRef(null);
  const isMobile = useIsMobile();
  const today = startOfDay(new Date());
  const [viewMonth, setViewMonth] = useState(() => {
    const d = checkIn ?? today;
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const monthLabel = new Date(viewMonth.year, viewMonth.month, 1).toLocaleDateString(
    "en-IN",
    { month: "long", year: "numeric" }
  );

  const prevMonth = () =>
    setViewMonth((v) =>
      v.month === 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: v.month - 1 }
    );

  const nextMonthNav = () =>
    setViewMonth((v) =>
      v.month === 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: v.month + 1 }
    );

  useEffect(() => {
    if (!open || isMobile) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, isMobile]);

  const pickDay = (day) => {
    if (!day || day < today) return;
    if (phase === "in" || !checkIn || (checkIn && checkOut)) {
      onChange({ checkIn: day, checkOut: null });
      setPhase("out");
      return;
    }
    if (day <= checkIn) {
      onChange({ checkIn: day, checkOut: null });
      setPhase("out");
      return;
    }
    onChange({ checkIn, checkOut: day });
    setPhase("in");
    setOpen(false);
  };

  const label = formatDateRange(checkIn, checkOut);
  const sheetTitle = phase === "out" ? "Select checkout" : "Select check-in";

  const triggerClass = heroLayout
    ? "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-stone-50 sm:rounded-none sm:px-5 sm:py-3"
    : compactPopover
      ? "flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left transition hover:bg-stone-50 sm:rounded-none sm:hover:bg-stone-50/80"
      : "flex w-full items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left transition hover:bg-stone-50 sm:rounded-none sm:px-4 sm:py-3 sm:hover:bg-white";

  const renderMonthGrid = (year, month, { compact = false, dense = false, showTitle = true } = {}) => {
    const days = getMonthDays(year, month);
    const title = new Date(year, month, 1).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
    const cellClass = dense
      ? "h-6 w-6 text-[10px] rounded"
      : compact
        ? "h-7 w-7 text-[11px] rounded-md"
        : "h-10 w-full text-sm rounded-xl sm:h-8 sm:text-xs sm:rounded-lg";
    const weekdayClass = dense
      ? "py-0 text-[8px]"
      : compact
        ? "py-0.5 text-[9px]"
        : "py-1.5 text-[11px] sm:py-1";

    return (
      <div key={`${year}-${month}`} className="min-w-0">
        {showTitle && (
          <p
            className={`text-center font-bold text-foreground ${
              compact ? "mb-1.5 text-xs" : "mb-3 text-sm"
            }`}
          >
            {title}
          </p>
        )}
        <div
          className={`grid grid-cols-7 gap-0.5 text-center font-semibold text-muted ${weekdayClass}`}
        >
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className={`grid grid-cols-7 ${compact ? "gap-0.5" : "gap-1"}`}>
          {days.map((day, i) => {
            if (!day)
              return (
                <span key={`e-${i}`} className={dense ? "h-6 w-6" : compact ? "h-7 w-7" : "h-8"} />
              );
            const disabled = day < today;
            const selected = isSameDay(day, checkIn) || isSameDay(day, checkOut);
            const inRange = isInRange(day, checkIn, checkOut);
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={disabled}
                onClick={() => pickDay(day)}
                className={`flex items-center justify-center font-semibold transition ${cellClass} ${
                  disabled
                    ? "cursor-not-allowed text-stone-300"
                    : selected
                      ? "bg-brand text-white"
                      : inRange
                        ? "bg-brand-muted text-brand-dark"
                        : "text-foreground hover:bg-stone-100"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const monthNavRow = ({ compact = false, dense = false } = {}) => (
    <div
      className={`flex items-center justify-between ${
        dense ? "mb-1.5" : compact ? "mb-2" : "mb-4"
      }`}
    >
      <NavButton compact={compact} dense={dense} dir="left" onClick={prevMonth} />
      <p
        className={`min-w-0 flex-1 text-center font-bold text-foreground ${
          dense ? "px-0.5 text-[11px]" : compact ? "px-1 text-xs" : "text-sm"
        }`}
      >
        {monthLabel}
      </p>
      <NavButton compact={compact} dense={dense} dir="right" onClick={nextMonthNav} />
    </div>
  );

  const footer = ({ compact = false, dense = false } = {}) => (
    <div
      className={`flex items-center justify-between border-t border-stone-100 ${
        dense ? "mt-1.5 pt-1.5" : compact ? "mt-2 pt-2" : "mt-4 pt-4"
      }`}
    >
      <button
        type="button"
        className={`font-semibold text-muted hover:text-brand ${
          dense ? "text-[10px]" : compact ? "text-[11px]" : "text-sm"
        }`}
        onClick={() => {
          onChange({ checkIn: null, checkOut: null });
          setPhase("in");
        }}
      >
        Clear
      </button>
      <button
        type="button"
        className={`font-bold text-white bg-brand hover:brightness-105 ${
          dense
            ? "rounded-md px-2.5 py-0.5 text-[10px]"
            : compact
              ? "rounded-lg px-3 py-1 text-[11px]"
              : "rounded-xl px-5 py-2 text-sm"
        }`}
        onClick={() => setOpen(false)}
      >
        Done
      </button>
    </div>
  );

  const desktopPanel = open && !isMobile && (
    <div
      className={`absolute right-0 top-full z-[500] rounded-lg border border-stone-200 bg-white shadow-xl ring-1 ring-stone-900/5 ${
        compactPopover
          ? "mt-1.5 w-[218px] p-2"
          : "mt-2 w-[272px] rounded-xl p-3"
      } ${popoverClassName}`}
    >
      <p
        className={`text-center font-bold uppercase tracking-wide text-brand ${
          compactPopover ? "mb-1 text-[9px]" : "mb-2 text-[11px]"
        }`}
      >
        {sheetTitle}
      </p>
      {monthNavRow({ compact: true, dense: compactPopover })}
      {renderMonthGrid(viewMonth.year, viewMonth.month, {
        compact: true,
        dense: compactPopover,
        showTitle: false,
      })}
      {footer({ compact: true, dense: compactPopover })}
    </div>
  );

  const mobileSheet = (
    <MobilePickerSheet open={open && isMobile} onClose={() => setOpen(false)} title={sheetTitle}>
      {monthNavRow({ compact: false })}
      {renderMonthGrid(viewMonth.year, viewMonth.month, { compact: false, showTitle: false })}
      <div className="pb-2">{footer({ compact: false })}</div>
    </MobilePickerSheet>
  );

  if (variant === "split") {
    return (
      <div ref={ref} className={`relative ${className}`}>
        <div className="grid grid-cols-2 divide-x divide-stone-200">
          <button
            type="button"
            onClick={() => {
              setPhase("in");
              setOpen(true);
            }}
            className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left transition hover:bg-white"
          >
            <CalendarIcon heroLayout={heroLayout} />
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-wide text-brand">
                Check-in
              </span>
              <span className="mt-0.5 block text-sm font-bold text-foreground">
                {checkIn ? formatShortDate(checkIn) : "Add date"}
              </span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase("out");
              setOpen(true);
            }}
            className="flex w-full items-center gap-2.5 px-4 py-3.5 text-left transition hover:bg-white"
          >
            <CalendarIcon heroLayout={heroLayout} />
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-wide text-brand">
                Check-out
              </span>
              <span className="mt-0.5 block text-sm font-bold text-foreground">
                {checkOut ? formatShortDate(checkOut) : "Add date"}
              </span>
            </span>
          </button>
        </div>
        {desktopPanel}
        {mobileSheet}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
        aria-expanded={open}
      >
        <CalendarIcon heroLayout={heroLayout} compactPopover={compactPopover} />
        <span className="min-w-0">
          <span
            className={`block font-bold uppercase tracking-wide text-brand ${
              compactPopover ? "text-[9px]" : "text-[10px]"
            }`}
          >
            Check-in — Check-out
          </span>
          <span
            className={`mt-0.5 block font-bold text-foreground ${
              compactPopover ? "text-xs" : "text-sm"
            }`}
          >
            {label}
          </span>
        </span>
      </button>
      {desktopPanel}
      {mobileSheet}
    </div>
  );
}

function NavButton({ dir, onClick, compact, dense = false }) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "Previous month" : "Next month"}
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center rounded-lg border border-stone-200 text-brand transition hover:border-brand/30 hover:bg-brand-muted active:scale-95 ${
        dense ? "h-6 w-6" : compact ? "h-7 w-7" : "h-10 w-10"
      }`}
    >
      <ChevronIcon dir={dir} compact={compact || dense} />
    </button>
  );
}

function ChevronIcon({ dir, compact }) {
  return (
    <svg
      className={compact ? "h-3.5 w-3.5" : "h-5 w-5"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden
    >
      {dir === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      )}
    </svg>
  );
}

function CalendarIcon({ heroLayout = false, compactPopover = false }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-brand-muted text-brand ${
        heroLayout
          ? "h-9 w-9 rounded-full"
          : compactPopover
            ? "h-7 w-7 rounded-lg"
            : "h-8 w-8 rounded-lg"
      }`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 012.25 2.25V18.75M3 18.75h18" />
      </svg>
    </span>
  );
}
