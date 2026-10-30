"use client";

import Image from "next/image";
import { BedDouble, Car, Luggage, MapPin, Snowflake, Check, ChevronLeft, ChevronRight, Coffee, Hotel, Moon, Sun, Users, UtensilsCrossed, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AnimatedPrice from "@/components/packages/shared/AnimatedPrice";
import CabStage, { CabIllustration } from "@/components/packages/shared/CabIllustration";
import {
  CAB_OPTIONS,
  MEAL_BY_ID,
  MEAL_PLANS,
  ROOM_BY_ID,
  ROOM_TYPES,
  cabPassengers,
  categoryStars,
  planCab,
  resolveMealId,
  stopMealDelta,
  stopStayDelta,
} from "@/lib/tourCustomize";
import { HOTEL_CATEGORIES } from "@/lib/tourPackageMeta";
import { formatPackagePrice } from "@/lib/tourPackages";

function deltaLabel(amount, suffix = "") {
  if (!amount) return "Same price";
  return `${amount > 0 ? "+" : "−"}${formatPackagePrice(Math.abs(amount))}${suffix}`;
}

function DeltaPill({ amount, suffix, selected }) {
  if (selected) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[11px] font-extrabold text-white">
        <Check className="h-3 w-3" strokeWidth={3.5} />
        Selected
      </span>
    );
  }
  const tone = !amount ? "bg-stone-100 text-stone-600" : amount > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold tabular-nums ${tone}`}>{deltaLabel(amount, suffix)}</span>;
}

function OptionRow({ selected, onSelect, thumb, title, subtitle, children, right }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-2.5 text-left transition active:scale-[0.99] ${
        selected ? "border-brand bg-brand-muted" : "border-stone-200 bg-white hover:border-brand/40"
      }`}
    >
      {thumb}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold leading-tight text-stone-900">{title}</span>
        {subtitle ? <span className="mt-0.5 block text-xs font-medium text-stone-500">{subtitle}</span> : null}
        {children}
      </span>
      <span className="shrink-0">{right}</span>
    </button>
  );
}

/** Right-hand drawer: one set of options at a time, with the live trip total in the footer. */
function Drawer({ title, subtitle, note, total, onClose, headerExtra, children }) {
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[130]" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="pk-fade absolute inset-0 bg-stone-950/55 backdrop-blur-sm" />
      <aside className="pk-slide-in-right absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl sm:rounded-l-[2rem]">
        <header className="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand">{subtitle}</p>
            <h3 className="text-xl font-extrabold leading-tight text-stone-900">{title}</h3>
            {note ? <p className="mt-0.5 text-xs font-medium text-stone-500">{note}</p> : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-700 transition hover:bg-stone-200 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        {headerExtra}

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-stone-100 bg-white px-5 py-4 pb-[max(1rem,var(--safe-bottom))] sm:px-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">Trip total</p>
            {typeof total === "number" ? <AnimatedPrice value={total} className="text-xl font-extrabold text-stone-900" /> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pk-sweep rounded-full bg-brand px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark active:scale-95"
          >
            Done
          </button>
        </footer>
      </aside>
    </div>,
    document.body
  );
}

function ActionButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-extrabold transition active:scale-95 ${
        active
          ? "bg-brand text-white shadow-md shadow-brand/30"
          : "bg-white text-stone-800 ring-1 ring-stone-200 hover:text-brand hover:ring-brand/40"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/* ------------------------------- image slider ------------------------------- */

function ImageSlider({ images, alt, compact = false }) {
  const ref = useRef(null);
  const [index, setIndex] = useState(0);
  const arrow = compact ? "h-6 w-6" : "h-8 w-8";
  const go = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth, behavior: "smooth" });
  const onScroll = () => {
    const el = ref.current;
    if (el) setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-stone-100">
      <div ref={ref} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth">
        {images.map((src, i) => (
          <div key={src} className={`relative w-full shrink-0 snap-center ${compact ? "aspect-[4/5]" : "aspect-[5/2]"}`}>
            <Image src={src} alt={`${alt} — photo ${i + 1}`} fill sizes={compact ? "144px" : "400px"} className="object-cover" />
          </div>
        ))}
      </div>
      {images.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(-1)}
            className={`absolute left-1.5 top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-white/90 text-stone-800 shadow transition hover:bg-white active:scale-90 ${arrow}`}
          >
            <ChevronLeft className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(1)}
            className={`absolute right-1.5 top-1/2 grid -translate-y-1/2 place-items-center rounded-full bg-white/90 text-stone-800 shadow transition hover:bg-white active:scale-90 ${arrow}`}
          >
            <ChevronRight className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {images.map((src, i) => (
              <span key={src} className={`h-1.5 rounded-full bg-white shadow transition-all ${i === index ? "w-5" : "w-1.5 opacity-60"}`} />
            ))}
          </div>
          {!compact ? (
            <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-stone-950/60 px-2 py-0.5 text-[10px] font-extrabold text-white">
              {index + 1}/{images.length}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------ hotel for a night ------------------------------ */

function SelectButton({ selected, delta, onClick }) {
  return (
    <div className="space-y-1.5">
      {!selected ? (
        <p className="text-[11px] font-extrabold tabular-nums text-stone-500">{deltaLabel(delta, " /pp")}</p>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        aria-pressed={selected}
        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold transition active:scale-[0.98] ${
          selected ? "bg-brand text-white shadow-md shadow-brand/30" : "bg-stone-900 text-white hover:bg-brand"
        }`}
      >
        {selected ? <Check className="h-4 w-4" strokeWidth={3.5} /> : null}
        {selected ? "Selected" : "Select"}
      </button>
    </div>
  );
}

function MealRow({ selected, onClick, plan, delta }) {
  const Icon = plan.id === "breakfast" ? Coffee : plan.id === "half" ? Moon : Sun;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2 text-left transition active:scale-[0.99] ${
        selected ? "border-brand bg-white shadow-sm" : "border-transparent bg-white/70 hover:border-brand/30"
      }`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${selected ? "bg-brand text-white" : "bg-stone-100 text-stone-500"}`}>
        {selected ? <Check className="h-4 w-4" strokeWidth={3.5} /> : <Icon className="h-4 w-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-extrabold leading-tight text-stone-900">{plan.label}</span>
        <span className="block text-[11px] font-medium text-stone-500">{plan.meals.join(" · ")}</span>
      </span>
      <DeltaPill amount={delta} suffix=" /pp" selected={selected} />
    </button>
  );
}

export function StayCard({ pkg, hotel, stay, booking, onChange, dateFactor, totalNights, pricing, day }) {
  const [panel, setPanel] = useState(null); // null | "hotel" | "room" (which button opened the drawer)
  const { meta } = pkg;
  const baseStars = meta.stars;
  const price = pkg.price * dateFactor;

  const globalMealId = resolveMealId(meta, booking.meal);
  const mealId = stay.meal && MEAL_BY_ID[stay.meal] ? stay.meal : globalMealId;
  const mealPlan = MEAL_BY_ID[mealId];
  const room = ROOM_BY_ID[stay.room] ?? ROOM_TYPES[0];
  const chosen = hotel.options[stay.category];
  const grade = HOTEL_CATEGORIES.find((c) => c.id === stay.category);

  const close = () => setPanel(null);
  const current = { category: stay.category, room: stay.room };

  const pickHotel = (category) => {
    if (category === stay.category) return;
    const next = { ...booking.stays };
    if (category === booking.hotel) delete next[stay.index];
    else next[stay.index] = category;
    onChange({ stays: next });
  };

  /** Select a room and/or meal plan for this night in one update. */
  const pickRoom = (roomId, planId) => {
    const patch = {};
    if (roomId !== stay.room) {
      const next = { ...booking.rooms };
      if (roomId === "standard") delete next[stay.index];
      else next[stay.index] = roomId;
      patch.rooms = next;
    }
    if (planId !== undefined && planId !== mealId) {
      const next = { ...booking.meals };
      if (planId === globalMealId) delete next[stay.index];
      else next[stay.index] = planId;
      patch.meals = next;
    }
    if (Object.keys(patch).length) onChange(patch);
  };

  return (
    <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/70 to-white p-3.5 sm:p-4">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-700">
        Night {stay.index + 1} · Your hotel in {hotel.place}
      </p>
      <h4 className="mt-0.5 text-base font-extrabold leading-tight text-stone-900 sm:text-lg">{chosen.name}</h4>
      <p className="text-xs font-bold tracking-widest text-amber-500">{"★".repeat(chosen.stars)}</p>
      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-stone-500">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" />
        {chosen.area}, {hotel.place} · {chosen.distance}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-stone-700 ring-1 ring-stone-200">{grade?.label}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-stone-700 ring-1 ring-stone-200">{room.label}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-stone-700 ring-1 ring-stone-200">{mealPlan.label}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <ActionButton icon={Hotel} label="Change hotel" active={panel === "hotel"} onClick={() => setPanel("hotel")} />
        <ActionButton icon={BedDouble} label="Change room" active={panel === "room"} onClick={() => setPanel("room")} />
      </div>

      {panel === "hotel" ? (
        <Drawer
          title={`Hotels in ${hotel.place}`}
          subtitle={`Day ${day} · Change hotel`}
          note="Price changes are per adult, for this night"
          total={pricing?.total}
          onClose={close}
        >
          {HOTEL_CATEGORIES.map((cat) => {
            const option = hotel.options[cat.id];
            const selected = stay.category === cat.id;
            const delta = stopStayDelta(price, 1, totalNights, current, { category: cat.id, room: stay.room });
            return (
              <article
                key={cat.id}
                className={`flex gap-3 rounded-3xl border-2 p-2.5 transition ${selected ? "border-brand bg-brand-muted/50" : "border-stone-200 bg-white"}`}
              >
                <div className="w-[8.5rem] shrink-0 sm:w-36">
                  <ImageSlider images={option.images?.length ? option.images : [option.image]} alt={option.name} compact />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <h4 className="text-base font-extrabold leading-tight text-stone-900">{option.name}</h4>
                  <p className="mt-0.5 text-xs font-bold text-stone-500">
                    {cat.label} · <span className="tracking-widest text-amber-500">{"★".repeat(categoryStars(baseStars, cat.id))}</span>
                  </p>
                  <p className="mt-1.5 flex items-start gap-1 text-xs font-bold text-stone-700">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                    <span>
                      {option.area}, {hotel.place}
                      <span className="block text-[11px] font-semibold text-stone-400">{option.distance}</span>
                    </span>
                  </p>
                  <ul className="mt-1.5 flex flex-wrap gap-1">
                    {option.amenities.slice(0, 3).map((a) => (
                      <li key={a} className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold text-stone-600">
                        {a}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-2.5">
                    <SelectButton selected={selected} delta={delta} onClick={() => pickHotel(cat.id)} />
                  </div>
                </div>
              </article>
            );
          })}
        </Drawer>
      ) : null}

      {panel === "room" ? (
        <Drawer
          title={`Rooms at ${chosen.name}`}
          subtitle={`Day ${day} · Change room`}
          note="Pick a room, then its meal plan. Price changes are per adult, for this night"
          total={pricing?.total}
          onClose={close}
        >
          {ROOM_TYPES.map((type) => {
            const selected = stay.room === type.id;
            const roomDelta = stopStayDelta(price, 1, totalNights, current, { category: stay.category, room: type.id });
            return (
              <article
                key={type.id}
                className={`rounded-3xl border-2 p-3 transition ${selected ? "border-brand bg-brand-muted/50" : "border-stone-200 bg-white"}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${selected ? "bg-brand text-white" : "bg-brand-muted text-brand"}`}>
                    <BedDouble className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-extrabold leading-tight text-stone-900">{type.label}</h4>
                    <p className="text-[11px] font-bold text-stone-400">{type.bed}</p>
                    <p className="mt-0.5 text-xs font-medium text-stone-500">{type.blurb}</p>
                  </div>
                  <div className="w-24 shrink-0">
                    <SelectButton selected={selected} delta={roomDelta} onClick={() => pickRoom(type.id)} />
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 rounded-2xl bg-stone-50 p-2">
                  <p className="px-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-stone-400">Meal plan with this room</p>
                  {MEAL_PLANS.map((plan) => {
                    const planSelected = selected && mealId === plan.id;
                    const delta =
                      stopStayDelta(price, 1, totalNights, current, { category: stay.category, room: type.id }) +
                      stopMealDelta(meta, 1, totalNights, mealId, plan.id);
                    return <MealRow key={plan.id} plan={plan} selected={planSelected} delta={delta} onClick={() => pickRoom(type.id, plan.id)} />;
                  })}
                </div>
              </article>
            );
          })}
        </Drawer>
      ) : null}
    </div>
  );
}

/* ----------------------------------- cab ----------------------------------- */

export function CabCard({ pkg, booking, onChange, pricing }) {
  const [open, setOpen] = useState(false);
  const { meta } = pkg;
  const pax = cabPassengers({ adults: booking.travellers.adults, childAges: booking.travellers.childAges });
  const plan = planCab({ meta, cabId: booking.cab, pax });

  return (
    <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-3.5 sm:p-4">
      <div className="flex items-center gap-3.5">
        <CabStage type={plan.option.id} className="h-20 w-28 shrink-0 sm:h-24 sm:w-36" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sky-700">Your cab · all {plan.days} days</p>
          <h4 className="text-base font-extrabold leading-tight text-stone-900 sm:text-lg">
            {plan.vehicles > 1 ? `${plan.vehicles} × ` : ""}
            {plan.option.label}
          </h4>
          <p className="text-xs font-medium text-stone-500">
            {plan.option.models} · {plan.option.capacity} seats · AC · driver, fuel &amp; tolls
          </p>
        </div>
      </div>

      <div className="mt-3">
        <ActionButton icon={Car} label="Change cab" active={open} onClick={() => setOpen(true)} />
      </div>

      {open ? (
        <Drawer
          title="Choose your cab"
          subtitle="Day 1 · Change cab"
          note={`${pax} traveller${pax > 1 ? "s" : ""} · price change is for the whole group`}
          total={pricing?.total}
          onClose={() => setOpen(false)}
        >
          {CAB_OPTIONS.map((option) => {
            const selected = option.id === plan.option.id;
            const optionPlan = planCab({ meta, cabId: option.id, pax });
            const isRecommended = option.id === plan.recommended.option.id;
            const delta = optionPlan.delta - plan.delta;
            return (
              <article
                key={option.id}
                className={`flex gap-3 rounded-3xl border-2 p-3 transition ${selected ? "border-brand bg-brand-muted/50" : "border-stone-200 bg-white"}`}
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-stone-600">
                      {option.tag}
                    </span>
                    {isRecommended ? (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-white">
                        Recommended
                      </span>
                    ) : null}
                  </div>
                  <h4 className="mt-1.5 text-base font-extrabold leading-tight text-stone-900">
                    {optionPlan.vehicles > 1 ? `${optionPlan.vehicles} × ` : ""}
                    {option.label}
                  </h4>
                  <p className="text-xs font-semibold text-stone-500">{option.models}</p>
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-bold text-stone-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-1.5 py-1">
                      <Users className="h-3 w-3" />
                      {option.capacity} seats
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-1.5 py-1">
                      <Luggage className="h-3 w-3" />
                      {option.bags} bag{option.bags > 1 ? "s" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-1.5 py-1">
                      <Snowflake className="h-3 w-3" />
                      AC
                    </span>
                  </div>
                  {optionPlan.vehicles > 1 ? (
                    <p className="mt-1.5 text-[11px] font-bold text-amber-700">
                      {optionPlan.vehicles} vehicles needed for {pax}
                    </p>
                  ) : null}
                  <p className="mt-1.5 text-xs font-medium leading-snug text-stone-500">{option.blurb}</p>
                  <p className={`mt-2 text-sm font-extrabold tabular-nums ${delta > 0 ? "text-amber-700" : delta < 0 ? "text-emerald-700" : "text-stone-700"}`}>
                    {selected ? "Your cab" : deltaLabel(delta)}
                  </p>
                </div>

                <div className="flex w-36 shrink-0 flex-col gap-2.5 sm:w-40">
                  <CabStage type={option.id} className="h-28 flex-1" />
                  <button
                    type="button"
                    onClick={() => onChange({ cab: isRecommended ? "auto" : option.id })}
                    aria-pressed={selected}
                    className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold transition active:scale-[0.98] ${
                      selected ? "bg-brand text-white shadow-md shadow-brand/30" : "bg-stone-900 text-white hover:bg-brand"
                    }`}
                  >
                    {selected ? <Check className="h-4 w-4" strokeWidth={3.5} /> : null}
                    {selected ? "Selected" : "Select"}
                  </button>
                </div>
              </article>
            );
          })}
        </Drawer>
      ) : null}
    </div>
  );
}
