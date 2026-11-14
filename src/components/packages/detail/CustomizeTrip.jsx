"use client";

import Image from "next/image";
import {
  BedDouble,
  Bus,
  Car,
  CarFront,
  Check,
  CircleParking,
  Coffee,
  Fuel,
  Hotel,
  Luggage,
  MapPin,
  Moon,
  Plane,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sun,
  UserRound,
  Users,
  Utensils,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import {
  CAB_OPTIONS,
  MEAL_PLANS,
  baseMealId,
  cabOptionDelta,
  cabPassengers,
  categoryBlurb,
  categoryStars,
  mealOptionDelta,
  planCab,
  resolveMealId,
  resolveStays,
} from "@/lib/tourCustomize";
import { HOTEL_CATEGORIES } from "@/lib/tourPackageMeta";
import { CabIllustration } from "@/components/packages/shared/CabIllustration";
import { formatPackagePrice } from "@/lib/tourPackages";

const AMENITY_ICON = { "Free Wi-Fi": Wifi, Restaurant: Utensils, Breakfast: Coffee, "Room service": BedDouble };

const CAB_ICON = { hatchback: Car, sedan: Car, suv: CarFront, innova: CarFront, tempo: Bus, coach: Bus };

const roundTo10 = (n) => Math.round(n / 10) * 10;

function deltaText(amount, suffix = "") {
  if (!amount) return "Included";
  return `${amount > 0 ? "+" : "−"}${formatPackagePrice(Math.abs(amount))}${suffix}`;
}

function DeltaBadge({ amount, suffix, active }) {
  const tone = !amount
    ? active
      ? "bg-white/25 text-white"
      : "bg-stone-100 text-stone-600"
    : amount > 0
      ? active
        ? "bg-white/25 text-white"
        : "bg-amber-50 text-amber-700"
      : active
        ? "bg-white/25 text-white"
        : "bg-emerald-50 text-emerald-700";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold tabular-nums ${tone}`}>
      {deltaText(amount, suffix)}
    </span>
  );
}

function Tick({ className = "" }) {
  return (
    <span className={`pk-pop grid h-6 w-6 place-items-center rounded-full bg-brand text-white shadow ${className}`}>
      <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
    </span>
  );
}

/* --------------------------------- hotels --------------------------------- */

function StayPanel({ pkg, hotels, booking, onChange, dateFactor }) {
  const baseStars = pkg.meta.stars;
  const stays = useMemo(() => resolveStays(hotels, booking.hotel, booking.stays), [hotels, booking.hotel, booking.stays]);
  const totalNights = stays.reduce((s, x) => s + x.nights, 0) || 1;
  const allSame = stays.every((s) => s.category === stays[0]?.category);

  const setAll = (category) => onChange({ hotel: category, stays: {} });
  const setStop = (index, category) => {
    const next = { ...booking.stays };
    if (category === booking.hotel) delete next[index];
    else next[index] = category;
    onChange({ stays: next });
  };

  return (
    <div>
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-stone-500">Hotel grade for the whole trip</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Hotel grade for every stop">
        {HOTEL_CATEGORIES.map((cat) => {
          const active = allSame && stays[0]?.category === cat.id;
          const delta = roundTo10(pkg.price * dateFactor * (cat.factor - 1));
          return (
            <button
              key={cat.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setAll(cat.id)}
              className={`relative overflow-hidden rounded-2xl border-2 p-3.5 text-left transition duration-300 active:scale-[0.98] ${
                active
                  ? "border-transparent bg-gradient-to-br from-brand to-orange-500 text-white shadow-lg shadow-brand/30"
                  : "border-stone-200 bg-white hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between">
                <Hotel className={`h-5 w-5 ${active ? "text-white" : "text-brand"}`} />
                {active ? <Tick className="!bg-white !text-brand" /> : null}
              </div>
              <p className="mt-2 text-base font-extrabold">{cat.label}</p>
              <p className={`text-xs font-bold ${active ? "text-white/90" : "text-amber-500"}`}>
                {"★".repeat(categoryStars(baseStars, cat.id))}
              </p>
              <p className={`mt-1 text-xs ${active ? "text-white/80" : "text-stone-500"}`}>{categoryBlurb(baseStars, cat.id)}</p>
              <div className="mt-2">
                <DeltaBadge amount={delta} suffix=" /person" active={active} />
              </div>
            </button>
          );
        })}
      </div>

      <p className="mb-2 mt-6 text-xs font-extrabold uppercase tracking-[0.14em] text-stone-500">
        Or choose a hotel for each night
      </p>
      <ol className="space-y-4">
        {stays.map((stay) => {
          const hotel = hotels[stay.stop];
          const chosen = hotel.options[stay.category];
          return (
            <li key={stay.index} className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-40 w-full shrink-0 bg-stone-200 sm:h-auto sm:w-52">
                  {chosen.image ? (
                    <Image
                      key={chosen.image}
                      src={chosen.image}
                      alt={chosen.name}
                      fill
                      sizes="(min-width:640px) 208px, 100vw"
                      className="pk-fade object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-stone-900">
                    <MapPin className="h-3 w-3 text-brand" />
                    {hotel.place}
                  </span>
                  <span className="absolute bottom-3 left-3 rounded-full bg-brand px-2.5 py-1 text-[11px] font-extrabold text-white">
                    Night {stay.index + 1}
                  </span>
                </div>

                <div className="min-w-0 flex-1 p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-stone-400">Your stay</p>
                  <h4 className="text-lg font-extrabold leading-tight text-stone-900">{chosen.name}</h4>
                  <p className="text-xs font-bold tracking-widest text-amber-500">{"★".repeat(chosen.stars)}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {chosen.amenities.map((a) => {
                      const Icon = AMENITY_ICON[a] ?? Sparkles;
                      return (
                        <li key={a} className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2 py-1 text-[10px] font-bold text-stone-600">
                          <Icon className="h-3 w-3" />
                          {a}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label={`Hotel grade in ${hotel.place}`}>
                    {HOTEL_CATEGORIES.map((cat) => {
                      const active = stay.category === cat.id;
                      const delta = roundTo10(
                        pkg.price * dateFactor * (cat.factor - 1) * (stay.nights / totalNights)
                      );
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setStop(stay.index, cat.id)}
                          className={`rounded-xl border-2 px-2 py-2 text-center transition active:scale-95 ${
                            active ? "border-brand bg-brand-muted" : "border-stone-200 hover:border-brand/40"
                          }`}
                        >
                          <span className="block text-xs font-extrabold text-stone-900">{cat.label}</span>
                          <span className="block text-[10px] font-bold text-amber-500">
                            {"★".repeat(categoryStars(baseStars, cat.id))}
                          </span>
                          <span className={`mt-0.5 block text-[10px] font-extrabold tabular-nums ${active ? "text-brand-dark" : "text-stone-500"}`}>
                            {deltaText(delta, " /pp")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-xs font-medium text-stone-500">
        Prices show the change versus the listed package. Hotel names are indicative — we confirm an equivalent property of the same grade in your final voucher.
      </p>
    </div>
  );
}

/* ---------------------------------- meals ---------------------------------- */

const MEAL_ICON = { breakfast: Coffee, half: Moon, full: UtensilsCrossed };

function MealPanel({ pkg, booking, onChange }) {
  const { meta } = pkg;
  const selectedId = resolveMealId(meta, booking.meal);
  const baseId = baseMealId(meta.mealPlan);

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Meal plan">
        {MEAL_PLANS.map((plan) => {
          const active = plan.id === selectedId;
          const Icon = MEAL_ICON[plan.id];
          const delta = mealOptionDelta(meta, plan.id);
          return (
            <button
              key={plan.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ meal: plan.id === baseId ? "auto" : plan.id, meals: {} })}
              className={`relative flex flex-col overflow-hidden rounded-3xl border-2 p-4 text-left transition duration-300 active:scale-[0.98] ${
                active
                  ? "border-transparent bg-gradient-to-br from-brand to-orange-500 text-white shadow-xl shadow-brand/30"
                  : "border-stone-200 bg-white hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
              }`}
            >
              {plan.id === baseId ? (
                <span
                  className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                    active ? "bg-white text-brand" : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  In package
                </span>
              ) : null}
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${active ? "bg-white/20" : "bg-brand-muted text-brand"}`}>
                <Icon className="h-6 w-6" />
              </span>
              <p className="mt-3 text-lg font-extrabold leading-tight">{plan.label}</p>
              <p className={`mt-1 text-xs leading-relaxed ${active ? "text-white/85" : "text-stone-500"}`}>{plan.blurb}</p>

              <ul className="mt-3 grid grid-cols-3 gap-1.5">
                {["Breakfast", "Lunch", "Dinner"].map((meal) => {
                  const has = plan.meals.includes(meal);
                  const MealIcon = meal === "Breakfast" ? Coffee : meal === "Lunch" ? Sun : Moon;
                  return (
                    <li
                      key={meal}
                      className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-extrabold ${
                        has
                          ? active
                            ? "bg-white/20 text-white"
                            : "bg-emerald-50 text-emerald-700"
                          : active
                            ? "bg-black/10 text-white/50 line-through"
                            : "bg-stone-100 text-stone-400 line-through"
                      }`}
                    >
                      <MealIcon className="h-4 w-4" />
                      {meal}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <DeltaBadge amount={delta} suffix=" /person" active={active} />
                  <p className={`mt-1 text-[11px] font-semibold ${active ? "text-white/75" : "text-stone-400"}`}>
                    for {meta.nights} night{meta.nights > 1 ? "s" : ""} · vs. package
                  </p>
                </div>
                {active ? <Tick className="!bg-white !text-brand" /> : null}
              </div>
            </button>
          );
        })}
      </div>
      {Object.keys(booking.meals ?? {}).length ? (
        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
          Some hotels have their own meal plan (set in your itinerary). Choosing a plan here applies it to every hotel.
        </p>
      ) : null}
      <p className="mt-3 flex items-start gap-2 text-xs font-medium text-stone-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        Meals are served at your hotel or partner restaurants. Vegetarian, Jain and allergy-friendly options on request —
        just tell us at booking.
      </p>
    </div>
  );
}

/* ----------------------------------- cab ----------------------------------- */

const CAB_PERKS = [
  { icon: Snowflake, label: "Private AC vehicle" },
  { icon: UserRound, label: "Experienced driver" },
  { icon: Fuel, label: "Fuel, tolls & permits" },
  { icon: CircleParking, label: "Parking & driver allowance" },
  { icon: Plane, label: "Airport / station pick-up & drop" },
  { icon: MapPin, label: "All sightseeing as per itinerary" },
];

function CabPanel({ pkg, booking, onChange }) {
  const { meta } = pkg;
  const pax = cabPassengers({ adults: booking.travellers.adults, childAges: booking.travellers.childAges });
  const plan = planCab({ meta, cabId: booking.cab, pax });
  const recommended = plan.recommended;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 p-4 text-white">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/15 text-orange-200">
          <Users className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold">
            {pax} traveller{pax > 1 ? "s" : ""} · {plan.days} day{plan.days > 1 ? "s" : ""} on the road
          </p>
          <p className="text-xs font-medium text-white/70">
            We recommend {recommended.vehicles > 1 ? `${recommended.vehicles} × ` : "a "}
            <strong className="text-orange-200">{recommended.option.label}</strong> — already included in your price.
          </p>
        </div>
        <span className="hidden rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-orange-200 sm:inline">
          {meta.international ? "Private transfers" : "Private cab"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Vehicle">
        {CAB_OPTIONS.map((option) => {
          const selectedId = plan.option.id;
          const active = option.id === selectedId;
          const isRecommended = option.id === recommended.option.id;
          const Icon = CAB_ICON[option.id] ?? Car;
          const delta = cabOptionDelta(meta, pax, option.id);
          const vehicles = Math.max(1, Math.ceil(pax / option.capacity));
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ cab: isRecommended ? "auto" : option.id })}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 p-4 text-left transition duration-300 active:scale-[0.98] ${
                active
                  ? "border-transparent bg-gradient-to-br from-brand to-orange-500 text-white shadow-xl shadow-brand/30"
                  : "border-stone-200 bg-white hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`grid h-16 w-28 place-items-center rounded-2xl px-1 transition group-hover:scale-105 ${
                    active ? "bg-white/90" : "bg-sky-50"
                  }`}
                >
                  <CabIllustration type={option.id} className="h-full w-full" />
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                    isRecommended
                      ? active
                        ? "bg-white text-brand"
                        : "bg-emerald-50 text-emerald-700"
                      : active
                        ? "bg-white/20 text-white"
                        : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {isRecommended ? "Recommended" : option.tag}
                </span>
              </div>

              <p className="mt-3 text-lg font-extrabold leading-tight">{option.label}</p>
              <p className={`text-xs font-semibold ${active ? "text-white/80" : "text-stone-500"}`}>{option.models}</p>

              <div className={`mt-3 flex flex-wrap gap-2 text-[11px] font-bold ${active ? "text-white/90" : "text-stone-600"}`}>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {option.capacity} seats
                </span>
                <span className="inline-flex items-center gap-1">
                  <Luggage className="h-3.5 w-3.5" />
                  {option.bags} bag{option.bags > 1 ? "s" : ""}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Snowflake className="h-3.5 w-3.5" />
                  AC
                </span>
              </div>

              <p className={`mt-2 text-xs leading-relaxed ${active ? "text-white/80" : "text-stone-500"}`}>{option.blurb}</p>

              <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                <div>
                  <DeltaBadge amount={delta} suffix=" total" active={active} />
                  {vehicles > 1 ? (
                    <p className={`mt-1 text-[11px] font-bold ${active ? "text-white" : "text-amber-700"}`}>
                      {vehicles} vehicles needed for {pax}
                    </p>
                  ) : null}
                </div>
                {active ? <Tick className="!bg-white !text-brand" /> : null}
              </div>
            </button>
          );
        })}
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CAB_PERKS.map((perk) => (
          <li key={perk.label} className="flex items-center gap-2.5 rounded-2xl bg-stone-50 px-3 py-2.5 text-xs font-bold text-stone-700">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-sm">
              <perk.icon className="h-4 w-4" />
            </span>
            {perk.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------- wrapper --------------------------------- */

const TABS = [
  { id: "stays", label: "Hotels", icon: Hotel },
  { id: "meals", label: "Meals", icon: UtensilsCrossed },
  { id: "cab", label: "Cab", icon: Car },
];

/** Tabbed customiser: hotel grade per stop, meal plan and private vehicle. */
export default function CustomizeTrip({ pkg, hotels, booking, onChange, pricing, dateFactor = 1, tab: controlledTab, onTabChange, className = "" }) {
  const [innerTab, setInnerTab] = useState("stays");
  const tab = controlledTab ?? innerTab;
  const setTab = (next) => {
    setInnerTab(next);
    onTabChange?.(next);
  };
  const uid = useId();

  const summary = {
    stays: `${pricing.hotel.label} · ${pricing.hotel.stars}★`,
    meals: pricing.meal?.plan.short ?? "—",
    cab: pricing.cab ? `${pricing.cab.vehicles > 1 ? `${pricing.cab.vehicles}× ` : ""}${pricing.cab.option.label}` : "—",
  };

  const mealCustom = pricing.meal && !pricing.meal.isBase;
  const cabCustom = pricing.cab && !pricing.cab.isRecommended;
  const stayCustom = pricing.hotel.id !== "standard";
  const customised = { stays: stayCustom, meals: mealCustom, cab: cabCustom };

  const onKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.id === tab);
    if (e.key === "ArrowRight") setTab(TABS[(i + 1) % TABS.length].id);
    if (e.key === "ArrowLeft") setTab(TABS[(i - 1 + TABS.length) % TABS.length].id);
  };

  return (
    <div className={`rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-stone-200/80 sm:p-5 ${className}`}>
      <div role="tablist" aria-label="Customise your trip" onKeyDown={onKeyDown} className="grid grid-cols-3 gap-2 rounded-2xl bg-stone-100 p-1.5">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              id={`${uid}-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${uid}-panel-${t.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(t.id)}
              className={`relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-center transition duration-300 sm:flex-row sm:justify-center sm:gap-3 sm:py-3 ${
                active ? "bg-white shadow-md" : "hover:bg-white/60"
              }`}
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-xl transition ${
                  active ? "bg-brand text-white shadow-lg shadow-brand/30" : "bg-white text-stone-500"
                }`}
              >
                <t.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 sm:text-left">
                <span className={`block text-sm font-extrabold ${active ? "text-stone-900" : "text-stone-600"}`}>{t.label}</span>
                <span className="block max-w-[7rem] truncate text-[10px] font-bold text-stone-400 sm:max-w-[9rem]">{summary[t.id]}</span>
              </span>
              {customised[t.id] ? (
                <span className="pk-pop absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-white" aria-label="Customised" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        key={tab}
        id={`${uid}-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${tab}`}
        className="pk-fade-up px-1 pb-1 pt-5 sm:px-2"
      >
        {tab === "stays" ? <StayPanel pkg={pkg} hotels={hotels} booking={booking} onChange={onChange} dateFactor={dateFactor} /> : null}
        {tab === "meals" ? <MealPanel pkg={pkg} booking={booking} onChange={onChange} /> : null}
        {tab === "cab" ? <CabPanel pkg={pkg} booking={booking} onChange={onChange} /> : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-muted px-4 py-3">
        <p className="text-xs font-bold text-brand-dark">
          <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
          Changes update your price instantly — nothing is charged until you confirm.
        </p>
        <p className="text-sm font-extrabold tabular-nums text-stone-900">Trip total {formatPackagePrice(pricing.total)}</p>
      </div>
    </div>
  );
}
