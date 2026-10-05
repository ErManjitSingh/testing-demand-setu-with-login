"use client";

import Image from "next/image";
import {
  BedDouble,
  CalendarDays,
  Check,
  Loader2,
  MapPin,
  PartyPopper,
  Send,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PhoneNumberField from "@/components/booking/PhoneNumberField";
import { DEFAULT_PHONE_COUNTRY_ISO, parseStoredPhone } from "@/lib/phoneCountryCodes";
import { buildEnquiryDestination, resolveTourTypeLabel } from "@/lib/tourEnquiryTypes";
import { submitTourLeadFromClient } from "@/lib/tourLeadClient";
import { formatPackagePrice } from "@/lib/tourPackages";
import {
  buildTripNotes,
  formatDisplayDate,
  formatTravellerSummary,
  getRoomsNeeded,
} from "@/lib/tourTravellers";

const inputClass =
  "input-no-ios-zoom w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm font-semibold text-stone-900 outline-none transition placeholder:font-medium placeholder:text-stone-400 hover:border-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/25";

function SummaryRow({ icon: Icon, children }) {
  return (
    <li className="flex items-start gap-3 text-sm font-semibold text-stone-700">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-white text-brand shadow-sm">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <span className="pt-0.5">{children}</span>
    </li>
  );
}

export default function LeadDialog({ open, onClose, pkg, booking, pricing }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneIso, setPhoneIso] = useState(DEFAULT_PHONE_COUNTRY_ISO);
  const [status, setStatus] = useState("idle"); // idle | submitting | done
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const { travellers } = booking;
  const rooms = getRoomsNeeded(travellers.adults);
  const hotelLabel = pricing.hotel.label;

  const submit = async (e) => {
    e.preventDefault();
    if (status === "submitting") return;

    const mobile = parseStoredPhone(phone, phoneIso).local;
    if (!mobile) {
      setError("Please enter your phone number so our expert can call you.");
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      const destination = buildEnquiryDestination({
        state: pkg.state,
        country: pkg.country,
        location: pkg.location,
        title: pkg.title,
      });
      const result = await submitTourLeadFromClient({
        name: name.trim(),
        email: email.trim(),
        mobile,
        adults: String(travellers.adults),
        children: String(travellers.children),
        infants: String(travellers.infants),
        childAges: travellers.childAges.join(","),
        rooms: String(rooms),
        hotelCategory: hotelLabel,
        departureCity: booking.departureCity,
        estimatedTotal: formatPackagePrice(pricing.total),
        tripNotes: buildTripNotes({
          ...travellers,
          rooms,
          hotelCategory: hotelLabel,
          departureCity: booking.departureCity,
        }),
        state: pkg.state,
        country: pkg.country,
        location: pkg.location,
        destination,
        title: `${pkg.title} (${pkg.duration})`,
        tourType: resolveTourTypeLabel(booking.tourType),
        travelDate: booking.date || null,
        flightTrainTicketBooked: booking.ticketBooked,
      });
      setMessage(result.message || "Enquiry submitted successfully! Our travel experts will contact you shortly.");
      setStatus("done");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Request your quote">
      <button type="button" aria-label="Close" onClick={onClose} className="pk-fade absolute inset-0 bg-stone-950/60 backdrop-blur-sm" />

      <div className="pk-slide-up relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem] md:grid md:max-h-[88vh] md:grid-cols-[0.9fr_1.1fr]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-stone-700 shadow-md transition hover:bg-white md:bg-stone-100"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Summary */}
        <div className="relative hidden bg-[#fbf3ea] md:block">
          <div className="relative h-44">
            <Image src={pkg.image} alt="" fill sizes="400px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-orange-200">Your trip</p>
              <p className="font-serif text-2xl leading-tight">{pkg.title}</p>
            </div>
          </div>
          <div className="p-5">
            <ul className="space-y-3">
              <SummaryRow icon={MapPin}>
                {pkg.subtitle} · {pkg.duration}
              </SummaryRow>
              <SummaryRow icon={CalendarDays}>
                {booking.date ? formatDisplayDate(booking.date, { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : "Date to be decided"}
              </SummaryRow>
              <SummaryRow icon={Users}>
                {formatTravellerSummary(travellers)}
                {travellers.children > 0 ? ` (ages ${travellers.childAges.join(", ")})` : ""}
              </SummaryRow>
              <SummaryRow icon={BedDouble}>
                {rooms} room{rooms > 1 ? "s" : ""} · {hotelLabel} hotels · Ex {booking.departureCity}
              </SummaryRow>
            </ul>
            <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-orange-100">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-stone-400">Estimated total</p>
              <p className="text-3xl font-extrabold tracking-tight text-stone-900">{formatPackagePrice(pricing.total)}</p>
              <p className="text-xs font-semibold text-stone-500">Includes 5% GST · final quote confirmed by our desk</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="min-h-0 overflow-y-auto p-5 sm:p-8">
          {status === "done" ? (
            <div className="pk-zoom-in flex h-full min-h-[360px] flex-col items-center justify-center text-center">
              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <span className="pk-ping absolute inset-0 text-emerald-400" />
                <PartyPopper className="relative h-9 w-9" />
              </span>
              <h3 className="mt-6 text-2xl font-extrabold text-stone-900">You&apos;re all set, {name.split(" ")[0] || "traveller"}!</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-stone-600">{message}</p>
              <p className="mt-3 text-xs font-semibold text-stone-500">
                Expect a call within a few hours with your itinerary and best price.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-7 rounded-full bg-stone-900 px-8 py-3.5 text-sm font-extrabold text-white transition hover:bg-stone-800 active:scale-95"
              >
                Back to the trip
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="pr-10">
                <p className="font-serif text-lg italic text-brand">Almost there</p>
                <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-3xl">
                  Where should we send your quote?
                </h3>
                <p className="mt-1 text-sm text-stone-500">A travel expert will share a day-wise plan and confirm the best price.</p>
              </div>

              {/* compact summary on mobile */}
              <p className="rounded-2xl bg-brand-muted px-4 py-3 text-xs font-bold leading-relaxed text-brand-dark md:hidden">
                {pkg.title} · {booking.date ? formatDisplayDate(booking.date, { day: "numeric", month: "short" }) : "date TBD"} ·{" "}
                {formatTravellerSummary(travellers)} · {formatPackagePrice(pricing.total)}
              </p>

              <label className="block">
                <span className="mb-1.5 block text-xs font-extrabold text-stone-700">Full name</span>
                <input
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={inputClass}
                />
              </label>

              <PhoneNumberField
                id="detail-lead-phone"
                label="Phone / WhatsApp"
                required
                national
                country={phoneIso}
                onCountryChange={setPhoneIso}
                value={phone}
                onChange={setPhone}
                placeholder="Enter phone number"
              />

              <label className="block">
                <span className="mb-1.5 block text-xs font-extrabold text-stone-700">Email</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={inputClass}
                />
              </label>

              {error ? (
                <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="pk-sweep flex w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-base font-extrabold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send me the itinerary &amp; price
                  </>
                )}
              </button>

              <ul className="grid gap-2 text-xs font-semibold text-stone-500 sm:grid-cols-2">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  No payment needed now
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} />
                  Your details are never shared
                </li>
              </ul>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
