"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BulkStayEnquiryForm from "@/components/booking/BulkStayEnquiryForm";
import MobilePickerSheet, { useIsMobile } from "@/components/booking/MobilePickerSheet";
import { normalizeGuests } from "@/lib/bookingSearch";
import {
  applyMinimumRooms,
  canDecrementRooms,
  canIncrementAdults,
  canIncrementChildren,
  canIncrementRooms,
  MAX_SELF_SERVICE_SEARCH_ROOMS,
  CHILD_ADULT_AGE_THRESHOLD,
  DEFAULT_CHILD_AGE,
  getChildAgeChangeError,
  getDecrementRoomsError,
  getIncrementAdultsError,
  getIncrementChildrenError,
  getMinimumRoomsRequired,
  normalizeChildAges,
} from "@/lib/guestOccupancy";

export function formatGuestsRoomsLabel({ adults, children, rooms }) {
  const parts = [];
  parts.push(`${adults} Adult${adults !== 1 ? "s" : ""}`);
  if (children > 0) parts.push(`${children} Child${children !== 1 ? "ren" : ""}`);
  parts.push(`${rooms} Room${rooms !== 1 ? "s" : ""}`);
  return parts.join(" · ");
}

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

export default function GuestsRoomsPicker({
  value,
  onChange,
  className = "",
  label = "Guests & Rooms",
  compact = false,
  heroLayout = false,
  open: controlledOpen,
  onOpenChange,
  popoverClassName = "",
  compactPopover = false,
  defaultLocation = "",
}) {
  const [open, setOpen] = usePickerOpen(controlledOpen, onOpenChange);
  const [occupancyError, setOccupancyError] = useState("");
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [requestedBulkRooms, setRequestedBulkRooms] = useState(
    MAX_SELF_SERVICE_SEARCH_ROOMS + 1
  );
  const ref = useRef(null);
  const isMobile = useIsMobile();
  const guests = normalizeGuests(value);
  const { adults, children, rooms, childAges } = guests;
  const minRooms = useMemo(() => getMinimumRoomsRequired(guests), [guests]);

  const openBulkEnquiry = useCallback(
    (nextRoomCount) => {
      setRequestedBulkRooms(Math.max(MAX_SELF_SERVICE_SEARCH_ROOMS + 1, nextRoomCount));
      setOpen(false);
      setOccupancyError("");
      setEnquiryOpen(true);
    },
    [setOpen]
  );

  useEffect(() => {
    if (!open || enquiryOpen) return;
    if (rooms > MAX_SELF_SERVICE_SEARCH_ROOMS) {
      openBulkEnquiry(rooms);
    }
  }, [open, rooms, enquiryOpen, openBulkEnquiry]);

  useEffect(() => {
    if (!open || isMobile || enquiryOpen) return;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, isMobile, enquiryOpen, setOpen]);

  const emitChange = (nextGuests) => {
    const normalized = normalizeGuests(applyMinimumRooms(nextGuests));
    onChange(normalized);
  };

  const trySetAdults = (n) => {
    const next = applyMinimumRooms(normalizeGuests({ ...guests, adults: n }));
    if (!canIncrementAdults(guests) && n > adults) {
      setOccupancyError(getIncrementAdultsError(guests));
      return;
    }
    setOccupancyError("");
    emitChange(next);
  };

  const trySetChildren = (n) => {
    if (n > children) {
      if (!canIncrementChildren(guests)) {
        setOccupancyError(getIncrementChildrenError(guests));
        return;
      }
      const nextAges = normalizeChildAges(childAges, n);
      nextAges[n - 1] = DEFAULT_CHILD_AGE;
      setOccupancyError("");
      emitChange(applyMinimumRooms({ ...guests, children: n, childAges: nextAges }));
      return;
    }

    setOccupancyError("");
    emitChange({
      ...guests,
      children: n,
      childAges: normalizeChildAges(childAges, n),
    });
  };

  const setChildAge = (index, age) => {
    const err = getChildAgeChangeError(guests, index, age);
    if (err) {
      setOccupancyError(err);
      return;
    }
    const nextAges = [...normalizeChildAges(childAges, children)];
    nextAges[index] = age;
    setOccupancyError("");
    emitChange({ ...guests, childAges: nextAges });
  };

  const trySetRooms = (n) => {
    if (n > MAX_SELF_SERVICE_SEARCH_ROOMS) {
      openBulkEnquiry(n);
      return;
    }
    const nextRooms = Math.max(1, Math.min(MAX_SELF_SERVICE_SEARCH_ROOMS, n));
    if (nextRooms < rooms && nextRooms < minRooms) {
      setOccupancyError(getDecrementRoomsError(guests));
      return;
    }
    setOccupancyError("");
    emitChange({ ...guests, rooms: nextRooms });
  };

  const tryIncrementRooms = () => {
    if (rooms >= MAX_SELF_SERVICE_SEARCH_ROOMS) {
      openBulkEnquiry(rooms + 1);
      return;
    }
    trySetRooms(rooms + 1);
  };

  const display = formatGuestsRoomsLabel(guests);
  const canAddAdult = canIncrementAdults(guests);
  const canAddChild = canIncrementChildren(guests);
  const canAddRoom =
    rooms < MAX_SELF_SERVICE_SEARCH_ROOMS
      ? canIncrementRooms(guests)
      : true;
  const canRemoveRoom = canDecrementRooms(guests);

  const triggerClass = heroLayout
    ? "flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-stone-50 sm:rounded-none sm:px-5 sm:py-3"
    : compactPopover
      ? "flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left transition hover:bg-stone-50 sm:rounded-none sm:hover:bg-stone-50/80"
      : `flex w-full items-center gap-2.5 rounded-2xl text-left transition hover:bg-stone-50 sm:rounded-none sm:hover:bg-white ${
          compact ? "px-4 py-3.5" : "px-4 py-3 sm:px-4 sm:py-3"
        }`;

  const panelContent = (
    <>
      <CounterRow
        label="Adults"
        hint="Ages 13+"
        count={adults}
        onDec={() => trySetAdults(adults - 1)}
        onInc={() => trySetAdults(adults + 1)}
        min={1}
        disableInc={!canAddAdult}
        dense={compactPopover}
      />
      <CounterRow
        label="Children"
        hint={`Ages 0–12 · above ${CHILD_ADULT_AGE_THRESHOLD} count as adults`}
        count={children}
        onDec={() => trySetChildren(children - 1)}
        onInc={() => trySetChildren(children + 1)}
        min={0}
        disableInc={!canAddChild}
        dense={compactPopover}
      />

      {children > 0 && (
        <div
          className={`space-y-2 border-b border-stone-100 ${
            compactPopover ? "py-2" : "py-3"
          }`}
        >
          {normalizeChildAges(childAges, children).map((age, index) => (
            <ChildAgeRow
              key={index}
              index={index}
              age={age}
              onChange={(nextAge) => setChildAge(index, nextAge)}
              dense={compactPopover}
            />
          ))}
        </div>
      )}

      <CounterRow
        label="Rooms"
        hint={
          minRooms > 1
            ? `Min ${minRooms} rooms · max 3 guests/room · up to ${MAX_SELF_SERVICE_SEARCH_ROOMS} online`
            : `Max 3 guests per room · ${MAX_SELF_SERVICE_SEARCH_ROOMS + 1}+ rooms via enquiry`
        }
        count={rooms > MAX_SELF_SERVICE_SEARCH_ROOMS ? MAX_SELF_SERVICE_SEARCH_ROOMS : rooms}
        onDec={() => trySetRooms(rooms - 1)}
        onInc={tryIncrementRooms}
        min={minRooms}
        disableInc={!canAddRoom}
        disableDec={!canRemoveRoom}
        dense={compactPopover}
      />

      {occupancyError && (
        <p
          className={`rounded-lg bg-amber-50 px-2.5 py-2 font-medium text-amber-900 ring-1 ring-amber-200/80 ${
            compactPopover ? "text-[10px]" : "text-xs"
          }`}
          role="alert"
        >
          {occupancyError}
        </p>
      )}

      <button
        type="button"
        onClick={() => setOpen(false)}
        className={
          compactPopover
            ? "mt-2 w-full rounded-lg bg-brand py-2 text-xs font-bold text-white"
            : "mt-4 w-full rounded-xl bg-brand py-3 text-sm font-bold text-white"
        }
      >
        Done
      </button>
    </>
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
        aria-expanded={open}
      >
        <span
          className={`flex shrink-0 items-center justify-center bg-brand-muted text-brand ${
            heroLayout ? "h-9 w-9 rounded-full" : compactPopover ? "h-7 w-7 rounded-lg" : "h-8 w-8 rounded-lg"
          }`}
        >
          <GuestsIcon />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={`block font-bold uppercase tracking-wide text-brand ${
              compactPopover ? "text-[9px]" : "text-[10px]"
            }`}
          >
            {label}
          </span>
          <span
            className={`mt-0.5 block font-bold text-foreground ${
              compactPopover ? "text-xs" : "text-sm"
            }`}
          >
            {display}
          </span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-stone-400 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && !isMobile && (
        <div
          className={`absolute top-full z-[500] border border-stone-200 bg-white shadow-2xl ring-1 ring-stone-900/5 ${
            compactPopover
              ? "right-0 mt-1.5 w-[260px] rounded-lg p-2.5"
              : "left-0 right-0 mt-2 rounded-2xl p-4 sm:min-w-[300px]"
          } ${popoverClassName}`}
        >
          {panelContent}
        </div>
      )}

      <MobilePickerSheet open={open && isMobile} onClose={() => setOpen(false)} title={label}>
        {panelContent}
      </MobilePickerSheet>

      <BulkStayEnquiryForm
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        guests={guests}
        requestedRooms={requestedBulkRooms}
        defaultLocation={defaultLocation}
      />
    </div>
  );
}

function ChildAgeRow({ index, age, onChange, dense = false }) {
  return (
    <div className={`flex items-center justify-between gap-2 ${dense ? "px-0.5" : ""}`}>
      <p className={`font-semibold text-foreground ${dense ? "text-[11px]" : "text-xs"}`}>
        Child {index + 1} age
      </p>
      <select
        value={age}
        onChange={(e) => onChange(Number.parseInt(e.target.value, 10))}
        className={`rounded-lg border border-stone-200 bg-white font-semibold text-foreground ${
          dense ? "px-2 py-1 text-[11px]" : "px-2.5 py-1.5 text-xs"
        }`}
        aria-label={`Child ${index + 1} age`}
      >
        {Array.from({ length: 18 }, (_, i) => (
          <option key={i} value={i}>
            {i} yr{i !== 1 ? "s" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

function CounterRow({
  label,
  hint,
  count,
  onDec,
  onInc,
  min,
  disableInc = false,
  disableDec = false,
  dense = false,
}) {
  return (
    <div
      className={`flex items-center justify-between border-b border-stone-100 last:border-0 ${
        dense ? "gap-2 py-2" : "gap-4 py-3"
      }`}
    >
      <div className="min-w-0">
        <p className={`font-bold text-foreground ${dense ? "text-xs" : "text-sm"}`}>{label}</p>
        <p className={`text-muted ${dense ? "text-[10px]" : "text-xs"}`}>{hint}</p>
      </div>
      <div className={`flex items-center ${dense ? "gap-2" : "gap-3"}`}>
        <button
          type="button"
          onClick={onDec}
          disabled={count <= min || disableDec}
          className={`flex items-center justify-center rounded-full border border-stone-200 font-bold disabled:opacity-40 ${
            dense ? "h-7 w-7 text-base" : "h-9 w-9 text-lg"
          }`}
        >
          −
        </button>
        <span className={`text-center font-extrabold ${dense ? "w-5 text-xs" : "w-6 text-sm"}`}>
          {count}
        </span>
        <button
          type="button"
          onClick={onInc}
          disabled={disableInc}
          className={`flex items-center justify-center rounded-full border border-brand bg-brand-muted font-bold text-brand disabled:opacity-40 ${
            dense ? "h-7 w-7 text-base" : "h-9 w-9 text-lg"
          }`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function GuestsIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}
