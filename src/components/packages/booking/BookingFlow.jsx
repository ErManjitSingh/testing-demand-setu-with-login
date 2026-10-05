"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Lock,
  Send,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import BookingSuccess from "@/components/packages/booking/BookingSuccess";
import BookingSummary from "@/components/packages/booking/BookingSummary";
import {
  ReviewStep,
  TravellersStep,
  TripStep,
  listCoTravellers,
} from "@/components/packages/booking/BookingSteps";
import AnimatedPrice from "@/components/packages/shared/AnimatedPrice";
import { PAYMENT_METHODS, PAYMENT_PLANS, createBookingRef } from "@/lib/packageBooking";
import { DEFAULT_PHONE_COUNTRY_ISO, parseStoredPhone } from "@/lib/phoneCountryCodes";
import { submitTourLeadFromClient } from "@/lib/tourLeadClient";
import { calculateTripPrice } from "@/lib/tourPackageDetails";
import { buildEnquiryDestination, resolveTourTypeLabel } from "@/lib/tourEnquiryTypes";
import { formatPackagePrice } from "@/lib/tourPackages";
import { buildTripNotes, getRoomsNeeded, totalTravellers } from "@/lib/tourTravellers";

const STEPS = [
  { id: "trip", label: "Trip details", short: "Trip" },
  { id: "travellers", label: "Traveller details", short: "Travellers" },
  { id: "review", label: "Review & confirm", short: "Confirm" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const roundTo10 = (n) => Math.round(n / 10) * 10;

function Stepper({ step, onJump }) {
  return (
    <ol className="flex items-center" aria-label="Booking progress">
      {STEPS.map((item, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={item.id} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => done && onJump(i)}
              disabled={!done}
              aria-current={active ? "step" : undefined}
              className="group flex items-center gap-2.5 text-left disabled:cursor-default"
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold transition-all duration-300 sm:h-10 sm:w-10 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-brand text-white shadow-lg shadow-brand/40 ring-4 ring-brand/15"
                      : "bg-white text-stone-400 ring-1 ring-stone-200"
                }`}
              >
                {done ? <Check className="pk-pop h-4 w-4" strokeWidth={3.5} /> : i + 1}
              </span>
              <span className="hidden sm:block">
                <span className={`block text-[10px] font-extrabold uppercase tracking-[0.14em] ${active ? "text-brand" : "text-stone-400"}`}>
                  Step {i + 1}
                </span>
                <span className={`block text-sm font-extrabold ${active || done ? "text-stone-900" : "text-stone-400"}`}>{item.label}</span>
              </span>
              <span className={`text-xs font-extrabold sm:hidden ${active ? "text-stone-900" : "text-stone-400"}`}>{active ? item.short : ""}</span>
            </button>
            {i < STEPS.length - 1 ? (
              <span aria-hidden className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-stone-200 sm:mx-5">
                <span className={`block h-full rounded-full bg-emerald-500 transition-all duration-500 ${done ? "w-full" : "w-0"}`} />
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function BookingFlow({ pkg, departures, initialBooking }) {
  const topRef = useRef(null);
  const refCode = useRef("");

  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState(initialBooking);
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    phoneIso: DEFAULT_PHONE_COUNTRY_ISO,
    city: "",
  });
  const [guests, setGuests] = useState({});
  const [requests, setRequests] = useState([]);
  const [notes, setNotes] = useState("");
  const [plan, setPlan] = useState("part");
  const [method, setMethod] = useState("upi");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | done
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState({ ref: "", message: "" });
  const [summaryOpen, setSummaryOpen] = useState(false);

  const departure = useMemo(() => departures.find((d) => d.date === booking.date) ?? null, [departures, booking.date]);
  const dateFactor = departure?.factor ?? 1;

  const pricing = useMemo(
    () =>
      calculateTripPrice({
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        adults: booking.travellers.adults,
        childAges: booking.travellers.childAges,
        infants: booking.travellers.infants,
        hotelCategory: booking.hotel,
        dateFactor,
      }),
    [pkg.price, pkg.originalPrice, booking.travellers, booking.hotel, dateFactor]
  );

  const amounts = useMemo(
    () =>
      Object.fromEntries(
        PAYMENT_PLANS.map((p) => [p.id, p.share >= 1 ? pricing.total : Math.min(pricing.total, roundTo10(pricing.total * p.share))])
      ),
    [pricing.total]
  );
  const payNow = amounts[plan];
  const balance = Math.max(0, pricing.total - payNow);

  const patchBooking = useCallback((patch) => {
    setBooking((b) => ({ ...b, ...patch }));
    if (patch.date) setErrors((e) => ({ ...e, date: undefined }));
  }, []);
  const patchContact = useCallback((patch) => {
    setContact((c) => ({ ...c, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  const toggleRequest = useCallback(
    (item) => setRequests((list) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item])),
    []
  );

  const scrollTop = useCallback(() => {
    requestAnimationFrame(() => {
      const el = topRef.current;
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    });
  }, []);

  const validate = useCallback(
    (target) => {
      const next = {};
      if (target === 0 && !booking.date) next.date = "Choose a travel date to continue";
      if (target === 1) {
        if (contact.name.trim().length < 2) next.name = "Please enter the lead traveller's full name";
        if (!EMAIL_RE.test(contact.email.trim())) next.email = "Enter a valid email so we can send your confirmation";
        if (!parseStoredPhone(contact.phone, contact.phoneIso).local) next.phone = "Enter a phone number our expert can call";
      }
      if (target === 2 && !agree) next.agree = "Please accept the terms to continue";
      setErrors(next);
      if (Object.keys(next).length) {
        const id = next.date ? "booking-date" : next.name ? "booking-name" : next.email ? "booking-email" : next.phone ? "booking-phone" : "booking-agree";
        requestAnimationFrame(() => document.getElementById(id)?.focus({ preventScroll: false }));
      }
      return Object.keys(next).length === 0;
    },
    [booking.date, contact, agree]
  );

  const submit = useCallback(async () => {
    if (status === "submitting") return;
    setStatus("submitting");
    setSubmitError("");

    if (!refCode.current) refCode.current = createBookingRef();
    const bookingRef = refCode.current;
    const { travellers } = booking;
    const rooms = getRoomsNeeded(travellers.adults);
    const planInfo = PAYMENT_PLANS.find((p) => p.id === plan);
    const methodInfo = PAYMENT_METHODS.find((m) => m.id === method);

    const coTravellers = listCoTravellers(travellers)
      .map((p) => ({ label: p.label, name: (guests[p.key] ?? "").trim() }))
      .filter((p) => p.name)
      .map((p) => `${p.label}: ${p.name}`)
      .join(", ");
    const specialRequests = [...requests, notes.trim()].filter(Boolean).join("; ");

    const tripNotes = [
      `BOOKING ${bookingRef}`,
      buildTripNotes({ ...travellers, rooms, hotelCategory: pricing.hotel.label, departureCity: booking.departureCity }),
      `${planInfo?.label}: ${formatPackagePrice(payNow)} now of ${formatPackagePrice(pricing.total)}`,
      `Pay via ${methodInfo?.label}`,
      contact.city.trim() ? `Lives in ${contact.city.trim()}` : "",
      coTravellers ? `Co-travellers - ${coTravellers}` : "",
      specialRequests ? `Requests - ${specialRequests}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      await submitTourLeadFromClient({
        name: contact.name.trim(),
        email: contact.email.trim(),
        mobile: parseStoredPhone(contact.phone, contact.phoneIso).local,
        adults: String(travellers.adults),
        children: String(travellers.children),
        infants: String(travellers.infants),
        childAges: travellers.childAges.join(","),
        rooms: String(rooms),
        hotelCategory: pricing.hotel.label,
        departureCity: booking.departureCity,
        estimatedTotal: formatPackagePrice(pricing.total),
        bookingRef,
        paymentPlan: `${planInfo?.label} (${formatPackagePrice(payNow)} now)`,
        paymentMethod: methodInfo?.label,
        coTravellers,
        specialRequests,
        tripNotes,
        state: pkg.state,
        country: pkg.country,
        location: pkg.location,
        destination: buildEnquiryDestination({
          state: pkg.state,
          country: pkg.country,
          location: pkg.location,
          title: pkg.title,
        }),
        title: `Booking request: ${pkg.title} (${pkg.duration})`,
        tourType: resolveTourTypeLabel(booking.tourType),
        travelDate: booking.date || null,
        flightTrainTicketBooked: booking.ticketBooked,
      });
      setResult({
        ref: bookingRef,
        message: "Our travel experts will contact you shortly to confirm availability and share your secure payment link.",
      });
      setStatus("done");
      scrollTop();
    } catch (err) {
      setSubmitError(err.message || "Something went wrong while submitting. Please try again.");
      setStatus("idle");
    }
  }, [status, booking, plan, method, guests, requests, notes, contact, pricing, payNow, pkg, scrollTop]);

  const next = useCallback(() => {
    if (!validate(step)) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      scrollTop();
    } else {
      submit();
    }
  }, [step, validate, submit, scrollTop]);

  const back = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
    setErrors({});
    scrollTop();
  }, [scrollTop]);

  const jump = useCallback(
    (target) => {
      setStep(target);
      setErrors({});
      scrollTop();
    },
    [scrollTop]
  );

  const submitting = status === "submitting";
  const last = step === STEPS.length - 1;
  const ctaLabel = last ? "Confirm booking request" : step === 0 ? "Continue to traveller details" : "Review booking";

  const ctaShort = last ? "Confirm" : step === 0 ? "Continue" : "Review";

  const primaryButton = (extra = "", compact = false) => (
    <button
      type="button"
      onClick={next}
      disabled={submitting}
      className={`pk-sweep group inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${extra}`}
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Submitting…
        </>
      ) : (
        <>
          {last ? <Send className="h-4 w-4" /> : null}
          {compact ? ctaShort : ctaLabel}
          {!last ? <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /> : null}
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f6f3ee] pb-32 lg:pb-16">
      <div ref={topRef} className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-7">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-bold text-stone-500">
          <Link href="/" className="transition hover:text-brand">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
          <Link href="/packages" className="transition hover:text-brand">Packages</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
          <Link href={`/packages/${pkg.slug}`} className="transition hover:text-brand">{pkg.title}</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
          <span className="text-stone-900">Book</span>
        </nav>

        {status === "done" ? (
          <BookingSuccess
            pkg={pkg}
            booking={booking}
            pricing={pricing}
            contact={contact}
            bookingRef={result.ref}
            amounts={amounts}
            plan={plan}
            message={result.message}
          />
        ) : (
          <>
            <header className="pk-fade-up flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-serif text-lg italic text-brand">Almost there</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">Book {pkg.title}</h1>
                <p className="mt-1 text-sm font-medium text-stone-500">
                  {pkg.duration} · {pkg.location} · {totalTravellers(booking.travellers)} traveller
                  {totalTravellers(booking.travellers) > 1 ? "s" : ""}
                </p>
              </div>
              <Link
                href={`/packages/${pkg.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-stone-800 shadow-sm ring-1 ring-stone-200 transition hover:ring-brand/40"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to trip
              </Link>
            </header>

            <div className="pk-fade-up mt-6 rounded-3xl bg-white/80 px-4 py-4 shadow-sm ring-1 ring-stone-200/80 backdrop-blur sm:px-8 sm:py-5" style={{ animationDelay: "80ms" }}>
              <Stepper step={step} onJump={jump} />
            </div>

            {/* Mobile summary */}
            <div className="mt-4 lg:hidden">
              <button
                type="button"
                onClick={() => setSummaryOpen((v) => !v)}
                aria-expanded={summaryOpen}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm ring-1 ring-stone-200/80"
              >
                <span>
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-stone-400">Trip summary</span>
                  <span className="block text-sm font-extrabold text-stone-900">{pkg.title}</span>
                </span>
                <span className="flex items-center gap-2">
                  <AnimatedPrice value={pricing.total} className="text-base font-extrabold text-stone-900" />
                  <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform duration-300 ${summaryOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
              <div className="pk-collapse" data-open={summaryOpen} inert={!summaryOpen}>
                <div>
                  <div className="pt-3">
                    <BookingSummary pkg={pkg} booking={booking} pricing={pricing} payNow={payNow} balance={balance} departure={departure} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-10">
              <div className="min-w-0">
                <div key={step} className="pk-fade-up">
                  {step === 0 ? (
                    <TripStep
                      pkg={pkg}
                      departures={departures}
                      booking={booking}
                      onChange={patchBooking}
                      errors={errors}
                      dateFactor={dateFactor}
                    />
                  ) : null}
                  {step === 1 ? (
                    <TravellersStep
                      booking={booking}
                      contact={contact}
                      onContact={patchContact}
                      guests={guests}
                      onGuests={(patch) => setGuests((g) => ({ ...g, ...patch }))}
                      requests={requests}
                      onToggleRequest={toggleRequest}
                      notes={notes}
                      onNotes={setNotes}
                      errors={errors}
                    />
                  ) : null}
                  {step === 2 ? (
                    <ReviewStep
                      pkg={pkg}
                      booking={booking}
                      pricing={pricing}
                      contact={contact}
                      guests={guests}
                      requests={requests}
                      notes={notes.trim()}
                      plan={plan}
                      onPlan={setPlan}
                      method={method}
                      onMethod={setMethod}
                      agree={agree}
                      onAgree={(value) => {
                        setAgree(value);
                        if (value) setErrors((e) => ({ ...e, agree: undefined }));
                      }}
                      onEdit={jump}
                      errors={errors}
                      amounts={amounts}
                    />
                  ) : null}
                </div>

                {submitError ? (
                  <p role="alert" className="pk-fade mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                    {submitError}
                  </p>
                ) : null}

                {/* Desktop actions */}
                <div className="mt-6 hidden items-center justify-between gap-4 lg:flex">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={back}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-stone-200 bg-white px-6 py-3 text-sm font-extrabold text-stone-800 transition hover:border-brand hover:text-brand active:scale-95"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-4">
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                      <Lock className="h-3.5 w-3.5 text-emerald-600" />
                      No payment taken on this page
                    </p>
                    {primaryButton("min-w-[16rem]")}
                  </div>
                </div>
              </div>

              <aside className="hidden lg:block">
                <div className="no-scrollbar sticky top-24 -m-3 max-h-[calc(100vh-7rem)] overflow-y-auto p-3">
                  <BookingSummary pkg={pkg} booking={booking} pricing={pricing} payNow={payNow} balance={balance} departure={departure} />
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      {/* Mobile action bar */}
      {status !== "done" ? (
        <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-stone-200 bg-white/95 px-4 pb-[max(0.75rem,var(--safe-bottom))] pt-3 shadow-[0_-12px_40px_-12px_rgba(28,25,23,0.25)] backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                aria-label="Back"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-stone-200 bg-white text-stone-800 active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                {last ? "Pay now" : "Trip total"}
              </p>
              <AnimatedPrice value={last ? payNow : pricing.total} className="text-lg font-extrabold text-stone-900" />
            </div>
            {primaryButton("px-6", true)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
