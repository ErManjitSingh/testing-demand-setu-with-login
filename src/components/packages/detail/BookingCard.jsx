"use client";

import {
  AlertCircle,
  ArrowRight,
  CreditCard,
  BadgePercent,
  CalendarDays,
  Check,
  ChevronDown,
  Hotel,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  ShieldCheck,
  Tag,
  Wallet,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import AnimatedPrice from "@/components/packages/shared/AnimatedPrice";
import TravellersPicker from "@/components/packages/shared/TravellersPicker";
import { HOTEL_CATEGORIES, DEPARTURE_CITIES } from "@/lib/tourPackageMeta";
import { TOUR_ENQUIRY_TYPES } from "@/lib/tourEnquiryTypes";
import { formatPackagePrice } from "@/lib/tourPackages";
import { formatDisplayDate, getRoomsNeeded, todayInputValue } from "@/lib/tourTravellers";

const selectClass =
  "input-no-ios-zoom w-full cursor-pointer appearance-none rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-9 text-sm font-bold text-stone-900 outline-none transition hover:border-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/25";

function FieldLabel({ children }) {
  return <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.14em] text-stone-500">{children}</span>;
}

export default function BookingCard({
  pkg,
  booking,
  onChange,
  pricing,
  departure,
  onReserve,
  onQuote,
  dateError,
  compact = false,
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const minDate = useMemo(() => todayInputValue(), []);
  const rooms = getRoomsNeeded(booking.travellers.adults);
  const wa = `https://wa.me/918353056000?text=${encodeURIComponent(
    `Hi, I'm interested in the ${pkg.title} (${pkg.duration}) package.`
  )}`;

  return (
    <div className={compact ? "" : "rounded-[2rem] bg-white p-5 shadow-[0_24px_60px_-24px_rgba(28,25,23,0.35)] ring-1 ring-stone-200/80 sm:p-6"}>
      {/* Price header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-stone-400">Starting from</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="text-3xl font-extrabold tracking-tight text-stone-900">
              {formatPackagePrice(pkg.price)}
            </span>
            {pkg.originalPrice ? (
              <span className="text-base font-semibold text-stone-400 line-through">
                {formatPackagePrice(pkg.originalPrice)}
              </span>
            ) : null}
          </div>
          <p className="text-xs font-semibold text-stone-500">per person · twin sharing</p>
        </div>
        {pkg.meta.discount > 0 ? (
          <span className="pk-sweep inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
            <BadgePercent className="h-4 w-4" />
            {pkg.meta.discount}% off
          </span>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        {/* Date */}
        <div>
          <FieldLabel>Travel date</FieldLabel>
          <label
            className={`relative flex items-center rounded-xl border bg-white transition focus-within:ring-2 ${
              dateError
                ? "border-red-400 ring-2 ring-red-100"
                : "border-stone-200 focus-within:border-brand focus-within:ring-brand/25 hover:border-stone-300"
            }`}
          >
            <CalendarDays className="pointer-events-none absolute left-3 h-4 w-4 text-brand" />
            <input
              id="booking-date"
              type="date"
              min={minDate}
              value={booking.date}
              onChange={(e) => onChange({ date: e.target.value })}
              aria-invalid={Boolean(dateError)}
              className="input-no-ios-zoom w-full rounded-xl bg-transparent py-2.5 pl-10 pr-3 text-sm font-bold text-stone-900 outline-none"
            />
          </label>
          {dateError ? (
            <p className="pk-fade mt-1.5 flex items-center gap-1.5 text-xs font-bold text-red-600">
              <AlertCircle className="h-3.5 w-3.5" />
              Choose a travel date to continue
            </p>
          ) : departure ? (
            <p className="pk-fade mt-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <Zap className="h-3.5 w-3.5" />
              Fixed departure · {departure.label} · {departure.seatsLeft} seats left
            </p>
          ) : booking.date ? (
            <p className="mt-1.5 text-xs font-medium text-stone-500">
              Custom date · {formatDisplayDate(booking.date, { weekday: "short", day: "numeric", month: "short" })}. We
              confirm availability with your quote.
            </p>
          ) : null}
        </div>

        {/* Travellers */}
        {compact ? (
          <div>
            <FieldLabel>Adults &amp; children</FieldLabel>
            <TravellersPicker inline value={booking.travellers} onChange={(travellers) => onChange({ travellers })} />
          </div>
        ) : (
          <div>
            <FieldLabel>Adults &amp; children</FieldLabel>
            <TravellersPicker
              mode="accordion"
              label={`${rooms} room${rooms > 1 ? "s" : ""} suggested`}
              value={booking.travellers}
              onChange={(travellers) => onChange({ travellers })}
            />
          </div>
        )}

        {/* Departure city */}
        <div>
          <FieldLabel>Travelling from</FieldLabel>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
            <select
              value={booking.departureCity}
              onChange={(e) => onChange({ departureCity: e.target.value })}
              className={selectClass}
            >
              {DEPARTURE_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          </div>
        </div>

        {/* Hotel category */}
        <div>
          <FieldLabel>Hotel category</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {HOTEL_CATEGORIES.map((h) => {
              const active = booking.hotel === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => onChange({ hotel: h.id })}
                  aria-pressed={active}
                  title={h.blurb}
                  className={`relative rounded-xl border px-2 py-2.5 text-center transition active:scale-95 ${
                    active
                      ? "border-brand bg-brand-muted shadow-sm"
                      : "border-stone-200 bg-white hover:border-brand/40"
                  }`}
                >
                  {active ? (
                    <span className="pk-pop absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-white shadow">
                      <Check className="h-3 w-3" strokeWidth={3.5} />
                    </span>
                  ) : null}
                  <Hotel className={`mx-auto h-4 w-4 ${active ? "text-brand" : "text-stone-400"}`} />
                  <span className="mt-1 block text-xs font-extrabold text-stone-900">{h.label}</span>
                  <span className="block text-[10px] font-bold text-amber-600">{"★".repeat(h.stars)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tour type + tickets */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Tour type</FieldLabel>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              <select
                value={booking.tourType}
                onChange={(e) => onChange({ tourType: e.target.value })}
                className={selectClass}
              >
                {TOUR_ENQUIRY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
          </div>
          <div>
            <FieldLabel>Tickets booked?</FieldLabel>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1">
              {["yes", "no"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ ticketBooked: v })}
                  aria-pressed={booking.ticketBooked === v}
                  className={`rounded-lg py-2 text-xs font-extrabold capitalize transition ${
                    booking.ticketBooked === v ? "bg-white text-brand shadow-sm" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Price summary */}
      <div className="mt-5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 p-4 text-white">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/55">Estimated total</p>
            <AnimatedPrice value={pricing.total} className="text-3xl font-extrabold tracking-tight" />
            <p className="mt-0.5 text-[11px] font-semibold text-white/60">
              ≈ {formatPackagePrice(pricing.perPerson)} per person · incl. 5% GST
            </p>
          </div>
          {pricing.savings > 0 ? (
            <p className="rounded-lg bg-emerald-400/15 px-2.5 py-1.5 text-right text-[11px] font-extrabold leading-tight text-emerald-300">
              You save
              <span className="block text-sm">{formatPackagePrice(pricing.savings)}</span>
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setShowBreakdown((v) => !v)}
          aria-expanded={showBreakdown}
          className="mt-3 flex w-full items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-white/80 transition hover:text-white"
        >
          Price breakdown
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showBreakdown ? "rotate-180" : ""}`} />
        </button>
        <div className="pk-collapse" data-open={showBreakdown}>
          <div>
            <dl className="space-y-2 pt-3 text-xs">
              {pricing.lines.map((line) => (
                <div key={line.key} className="flex items-start justify-between gap-3">
                  <dt className="text-white/70">
                    {line.label}
                    <span className="block text-[10px] text-white/45">{line.detail}</span>
                  </dt>
                  <dd className="font-bold tabular-nums">{line.free ? "Free" : formatPackagePrice(line.amount)}</dd>
                </div>
              ))}
              {pricing.groupDiscount > 0 ? (
                <div className="flex justify-between gap-3 text-emerald-300">
                  <dt>Group discount ({Math.round(pricing.groupRate * 100)}%)</dt>
                  <dd className="font-bold tabular-nums">−{formatPackagePrice(pricing.groupDiscount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3 text-white/70">
                <dt>GST (5%)</dt>
                <dd className="font-bold tabular-nums">{formatPackagePrice(pricing.gst)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onReserve}
        className="pk-sweep group mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-base font-extrabold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark active:scale-[0.98]"
      >
        <CreditCard className="h-5 w-5 transition group-hover:-translate-y-0.5" />
        Book this trip
        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
      </button>
      <button
        type="button"
        onClick={onQuote}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border-2 border-stone-200 bg-white py-3 text-sm font-extrabold text-stone-800 transition hover:border-brand hover:text-brand active:scale-[0.98]"
      >
        <Plane className="h-4 w-4" />
        Get a free quote first
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <a
          href="tel:+918353056000"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 py-3 text-sm font-bold text-stone-800 transition hover:border-brand hover:text-brand"
        >
          <Phone className="h-4 w-4" />
          Call us
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>

      <ul className="mt-4 space-y-2 border-t border-dashed border-stone-200 pt-4 text-xs font-semibold text-stone-600">
        <li className="flex items-center gap-2.5">
          <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
          Free itinerary changes before you pay
        </li>
        <li className="flex items-center gap-2.5">
          <Wallet className="h-4 w-4 shrink-0 text-brand" />
          Pay just 25% to confirm · balance 15 days before
        </li>
        <li className="flex items-center gap-2.5">
          <Check className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
          No hidden charges · GST invoice provided
        </li>
      </ul>
    </div>
  );
}
