"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Check, Compass, FileText, MessageCircle, Phone, Printer, Users } from "lucide-react";
import { tripEndDate } from "@/components/packages/booking/BookingSummary";
import { formatPackagePrice } from "@/lib/tourPackages";
import { formatDisplayDate, formatTravellerSummary } from "@/lib/tourTravellers";

const NEXT_STEPS = [
  { icon: Phone, title: "Expert call", text: "A travel expert calls within a few hours to confirm availability and finalise the plan." },
  { icon: FileText, title: "Payment link", text: "You get a secure payment link on WhatsApp and email — pay the amount you selected." },
  { icon: Check, title: "Vouchers & documents", text: "Hotel vouchers, itinerary and contacts arrive once your payment is confirmed." },
];

const CONFETTI = ["#ea580c", "#f59e0b", "#10b981", "#0ea5e9", "#f43f5e", "#8b5cf6"];

export default function BookingSuccess({ pkg, booking, pricing, contact, bookingRef, amounts, plan, message }) {
  const first = contact.name.trim().split(" ")[0] || "traveller";
  const end = tripEndDate(booking.date, pkg.meta.days);
  const wa = `https://wa.me/918353056000?text=${encodeURIComponent(
    `Hi, I just submitted booking ${bookingRef} for ${pkg.title}.`
  )}`;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 text-center shadow-[0_30px_80px_-30px_rgba(28,25,23,0.35)] ring-1 ring-stone-200/80 sm:p-10">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 overflow-hidden">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="pk-confetti absolute top-0 h-2.5 w-1.5 rounded-sm"
              style={{
                left: `${(i * 37) % 100}%`,
                backgroundColor: CONFETTI[i % CONFETTI.length],
                animationDelay: `${(i % 6) * 120}ms`,
                animationDuration: `${1800 + (i % 5) * 260}ms`,
              }}
            />
          ))}
        </div>

        <span className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <span className="pk-ping absolute inset-0 text-emerald-400" />
          <Check className="pk-pop relative h-12 w-12" strokeWidth={3} />
        </span>

        <p className="mt-6 font-serif text-xl italic text-brand">Booking request received</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">You&apos;re going, {first}!</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-600">
          {message || "Our travel experts will contact you shortly to confirm everything."}
        </p>

        <div className="mx-auto mt-6 inline-flex flex-col items-center rounded-2xl border-2 border-dashed border-brand/40 bg-brand-muted px-8 py-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-dark">Booking reference</p>
          <p className="mt-1 select-all font-mono text-3xl font-extrabold tracking-[0.12em] text-stone-900">{bookingRef}</p>
        </div>
        <p className="mt-2 text-xs font-semibold text-stone-500">Quote this reference when you talk to us.</p>

        <div className="mt-8 grid gap-4 text-left sm:grid-cols-[160px_1fr]">
          <div className="relative hidden h-full min-h-[150px] overflow-hidden rounded-2xl sm:block">
            <Image src={pkg.image} alt="" fill sizes="160px" className="object-cover" />
          </div>
          <div className="space-y-2.5 rounded-2xl bg-stone-50 p-4 text-sm font-semibold text-stone-800">
            <p className="font-serif text-xl leading-tight text-stone-900">{pkg.title}</p>
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-brand" />
              {booking.date ? formatDisplayDate(booking.date, { day: "numeric", month: "short" }) : "Date TBD"}
              {end ? ` → ${formatDisplayDate(end, { day: "numeric", month: "short", year: "numeric" })}` : ""}
            </p>
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-brand" />
              {formatTravellerSummary(booking.travellers)}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200 pt-2.5">
              <span className="text-xs font-bold text-stone-500">Trip total {formatPackagePrice(pricing.total)}</span>
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-extrabold text-white">
                {plan === "full" ? "Pay in full" : "Pay"} {formatPackagePrice(amounts[plan])} to confirm
              </span>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-200/80 sm:p-8" aria-labelledby="what-next">
        <h2 id="what-next" className="text-xl font-extrabold text-stone-900">
          What happens next
        </h2>
        <ol className="mt-5 space-y-5">
          {NEXT_STEPS.map((step, i) => (
            <li key={step.title} className="relative flex gap-4">
              {i < NEXT_STEPS.length - 1 ? <span aria-hidden className="absolute left-5 top-11 h-[calc(100%-1rem)] w-px bg-stone-200" /> : null}
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-white shadow-md shadow-brand/30">
                <step.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-stone-900">{step.title}</p>
                <p className="text-sm text-stone-600">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp us
        </a>
        <a
          href="tel:+918353056000"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-stone-200 bg-white py-3.5 text-sm font-extrabold text-stone-800 transition hover:border-brand hover:text-brand"
        >
          <Phone className="h-4 w-4" />
          Call the desk
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-stone-200 bg-white py-3.5 text-sm font-extrabold text-stone-800 transition hover:border-brand hover:text-brand"
        >
          <Printer className="h-4 w-4" />
          Print summary
        </button>
        <Link
          href="/packages"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand"
        >
          <Compass className="h-4 w-4" />
          Explore more trips
        </Link>
      </div>
    </div>
  );
}
