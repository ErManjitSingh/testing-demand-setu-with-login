"use client";

import Image from "next/image";
import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  Hotel,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import AnimatedPrice from "@/components/packages/shared/AnimatedPrice";
import { formatPackagePrice } from "@/lib/tourPackages";
import {
  formatDisplayDate,
  formatTravellerSummary,
  getRoomsNeeded,
  toDateInputValue,
} from "@/lib/tourTravellers";

export function tripEndDate(date, days) {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Math.max(0, days - 1));
  return toDateInputValue(d);
}

function Row({ icon: Icon, label, children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-muted text-brand">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-stone-400">{label}</p>
        <p className="text-sm font-bold leading-snug text-stone-900">{children}</p>
      </div>
    </li>
  );
}

/** Sticky order summary: trip, who/when, live price breakdown and what to pay now. */
export default function BookingSummary({ pkg, booking, pricing, payNow, balance, departure }) {
  const [showLines, setShowLines] = useState(true);
  const { travellers } = booking;
  const rooms = getRoomsNeeded(travellers.adults);
  const end = tripEndDate(booking.date, pkg.meta.days);

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_-24px_rgba(28,25,23,0.35)] ring-1 ring-stone-200/80">
      <div className="relative h-40 sm:h-44">
        <Image src={pkg.image} alt="" fill sizes="400px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-200">
            <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
            {pkg.rating} · {pkg.reviews} reviews
          </p>
          <h2 className="font-serif text-2xl leading-tight">{pkg.title}</h2>
          <p className="text-xs font-semibold text-white/75">
            {pkg.duration} · {pkg.location}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <ul className="space-y-3.5">
          <Row icon={CalendarDays} label="Travel dates">
            {booking.date ? (
              <>
                {formatDisplayDate(booking.date, { weekday: "short", day: "numeric", month: "short" })}
                {end ? ` → ${formatDisplayDate(end, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}` : ""}
                {departure ? (
                  <span className="mt-1 block text-xs font-bold text-emerald-700">
                    Fixed departure · {departure.seatsLeft} seats left
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-red-600">Pick a date to continue</span>
            )}
          </Row>
          <Row icon={Users} label="Travellers">
            {formatTravellerSummary(travellers)}
            {travellers.children > 0 ? (
              <span className="block text-xs font-semibold text-stone-500">Child ages: {travellers.childAges.join(", ")}</span>
            ) : null}
          </Row>
          <Row icon={BedDouble} label="Rooms">
            {rooms} room{rooms > 1 ? "s" : ""} · twin sharing
          </Row>
          <Row icon={Hotel} label="Stay">
            {pricing.hotel.label} · {pricing.hotel.stars}★ hotels
          </Row>
          <Row icon={MapPin} label="Travelling from">
            {booking.departureCity}
          </Row>
        </ul>

        <div className="rounded-2xl bg-stone-900 p-4 text-white">
          <button
            type="button"
            onClick={() => setShowLines((v) => !v)}
            aria-expanded={showLines}
            className="flex w-full items-center justify-between text-xs font-extrabold uppercase tracking-[0.14em] text-white/70 transition hover:text-white"
          >
            Price details
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showLines ? "rotate-180" : ""}`} />
          </button>
          <div className="pk-collapse" data-open={showLines}>
            <div>
              <dl className="space-y-2.5 pt-3 text-xs">
                {pricing.lines.map((line) => (
                  <div key={line.key} className="flex items-start justify-between gap-3">
                    <dt className="text-white/75">
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
                <div className="flex justify-between gap-3 text-white/75">
                  <dt>GST (5%)</dt>
                  <dd className="font-bold tabular-nums">{formatPackagePrice(pricing.gst)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/10 pt-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/55">Trip total</p>
              <AnimatedPrice value={pricing.total} className="text-3xl font-extrabold tracking-tight" />
            </div>
            {pricing.savings > 0 ? (
              <p className="rounded-lg bg-emerald-400/15 px-2.5 py-1.5 text-right text-[11px] font-extrabold leading-tight text-emerald-300">
                You save
                <span className="block text-sm">{formatPackagePrice(pricing.savings)}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-brand/40 bg-brand-muted/60 p-4">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em] text-brand-dark">
            <Wallet className="h-4 w-4" />
            To pay now
          </div>
          <p className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900">{formatPackagePrice(payNow)}</p>
          <p className="text-xs font-semibold text-stone-600">
            {balance > 0 ? `Balance ${formatPackagePrice(balance)} due 15 days before departure` : "Fully paid — nothing due later"}
          </p>
        </div>

        <p className="flex items-start gap-2 text-xs font-semibold text-stone-500">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          Secure payment link shared by our desk after you submit. Free itinerary changes before you pay.
        </p>
      </div>
    </div>
  );
}
