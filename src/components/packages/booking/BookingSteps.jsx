"use client";

import Link from "next/link";
import {
  AlertCircle,
  Baby,
  Check,
  ChevronDown,
  CreditCard,
  Hotel,
  Landmark,
  Mail,
  MapPin,
  Pencil,
  Smartphone,
  Sparkles,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { DepartureStrip } from "@/components/packages/detail/DetailSections";
import PhoneNumberField from "@/components/booking/PhoneNumberField";
import TravellersPicker from "@/components/packages/shared/TravellersPicker";
import { PAYMENT_METHODS, PAYMENT_PLANS, SPECIAL_REQUESTS } from "@/lib/packageBooking";
import { TOUR_ENQUIRY_TYPES } from "@/lib/tourEnquiryTypes";
import { DEPARTURE_CITIES, HOTEL_CATEGORIES } from "@/lib/tourPackageMeta";
import { calculateTripPrice } from "@/lib/tourPackageDetails";
import { formatPackagePrice } from "@/lib/tourPackages";
import {
  formatDisplayDate,
  formatTravellerSummary,
  getRoomsNeeded,
  todayInputValue,
} from "@/lib/tourTravellers";

export const inputClass =
  "input-no-ios-zoom w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm font-semibold text-stone-900 outline-none transition placeholder:font-medium placeholder:text-stone-400 hover:border-stone-300 focus:border-brand focus:ring-2 focus:ring-brand/25";

const selectClass = `${inputClass} cursor-pointer appearance-none pr-10`;

export function Panel({ eyebrow, title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-stone-200/80 sm:p-7 ${className}`}>
      {eyebrow ? <p className="font-serif text-lg italic text-brand">{eyebrow}</p> : null}
      <h2 className="text-xl font-extrabold tracking-tight text-stone-900 sm:text-2xl">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-stone-500">{subtitle}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, error, optional = false, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-extrabold text-stone-700">
        <span>
          {label}
          {optional ? <span className="ml-1.5 font-semibold text-stone-400">optional</span> : null}
        </span>
      </span>
      {children}
      {error ? (
        <span role="alert" className="pk-fade mt-1.5 flex items-center gap-1.5 text-xs font-bold text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs font-medium text-stone-500">{hint}</span>
      ) : null}
    </label>
  );
}

function SelectWrap({ children }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
    </div>
  );
}

/* ----------------------------- step 1: trip ----------------------------- */

export function TripStep({ pkg, departures, booking, onChange, errors, dateFactor }) {
  const minDate = todayInputValue();
  const rooms = getRoomsNeeded(booking.travellers.adults);

  return (
    <div className="space-y-6">
      <Panel eyebrow="When" title="Choose your dates" subtitle="Fixed departures carry the best rates — or pick any custom date.">
        <DepartureStrip departures={departures} selected={booking.date} onSelect={(date) => onChange({ date })} />
        <Field label="Or choose a custom date" error={errors.date} className="mt-3 max-w-xs">
          <input
            id="booking-date"
            type="date"
            min={minDate}
            value={booking.date}
            onChange={(e) => onChange({ date: e.target.value })}
            aria-invalid={Boolean(errors.date)}
            className={`${inputClass} ${errors.date ? "border-red-400 ring-2 ring-red-100" : ""}`}
          />
        </Field>
      </Panel>

      <Panel eyebrow="Who" title="Travellers & rooms" subtitle={`${rooms} room${rooms > 1 ? "s" : ""} suggested · 2 adults per room, kids share with parents`}>
        <div className="max-w-md">
          <TravellersPicker inline value={booking.travellers} onChange={(travellers) => onChange({ travellers })} />
        </div>
      </Panel>

      <Panel eyebrow="How" title="Stay & preferences">
        <p className="mb-2 text-xs font-extrabold text-stone-700">Hotel category</p>
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Hotel category">
          {HOTEL_CATEGORIES.map((h) => {
            const active = booking.hotel === h.id;
            const total = calculateTripPrice({
              price: pkg.price,
              originalPrice: pkg.originalPrice,
              adults: booking.travellers.adults,
              childAges: booking.travellers.childAges,
              infants: booking.travellers.infants,
              hotelCategory: h.id,
              dateFactor,
            }).total;
            return (
              <button
                key={h.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ hotel: h.id })}
                className={`relative rounded-2xl border-2 p-4 text-left transition active:scale-[0.98] ${
                  active ? "border-brand bg-brand-muted shadow-md shadow-brand/10" : "border-stone-200 bg-white hover:border-brand/40"
                }`}
              >
                {active ? (
                  <span className="pk-pop absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </span>
                ) : null}
                <Hotel className={`h-6 w-6 ${active ? "text-brand" : "text-stone-400"}`} />
                <p className="mt-2 text-base font-extrabold text-stone-900">{h.label}</p>
                <p className="text-xs font-bold text-amber-600">{"★".repeat(h.stars)}</p>
                <p className="mt-1 text-xs text-stone-500">{h.blurb}</p>
                <p className="mt-3 text-sm font-extrabold text-stone-900">{formatPackagePrice(total)}</p>
                <p className="text-[11px] font-semibold text-stone-400">trip total incl. GST</p>
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="Travelling from">
            <SelectWrap>
              <select value={booking.departureCity} onChange={(e) => onChange({ departureCity: e.target.value })} className={selectClass}>
                {DEPARTURE_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </Field>
          <Field label="Tour type">
            <SelectWrap>
              <select value={booking.tourType} onChange={(e) => onChange({ tourType: e.target.value })} className={selectClass}>
                {TOUR_ENQUIRY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </Field>
          <div>
            <span className="mb-1.5 block text-xs font-extrabold text-stone-700">Flight / train tickets booked?</span>
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-stone-200 bg-stone-50 p-1">
              {["yes", "no"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ ticketBooked: v })}
                  aria-pressed={booking.ticketBooked === v}
                  className={`rounded-lg py-2.5 text-sm font-extrabold capitalize transition ${
                    booking.ticketBooked === v ? "bg-white text-brand shadow-sm" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* -------------------------- step 2: traveller details -------------------------- */

/** Everyone travelling except the lead traveller, with stable keys for the name inputs. */
export function listCoTravellers(travellers) {
  const list = [];
  for (let i = 2; i <= travellers.adults; i += 1) list.push({ key: `a${i}`, label: `Adult ${i}`, kind: "adult" });
  travellers.childAges.forEach((age, i) => list.push({ key: `c${i + 1}`, label: `Child ${i + 1}`, kind: "child", age }));
  for (let i = 1; i <= travellers.infants; i += 1) list.push({ key: `i${i}`, label: `Infant ${i}`, kind: "infant" });
  return list;
}

export function TravellersStep({
  booking,
  contact,
  onContact,
  guests,
  onGuests,
  requests,
  onToggleRequest,
  notes,
  onNotes,
  errors,
}) {
  const coTravellers = listCoTravellers(booking.travellers);

  return (
    <div className="space-y-6">
      <Panel eyebrow="Lead traveller" title="Who should we contact?" subtitle="Confirmation, payment link and trip documents are sent here.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name (as on ID)" error={errors.name} className="sm:col-span-2">
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              <input
                id="booking-name"
                autoComplete="name"
                value={contact.name}
                onChange={(e) => onContact({ name: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                aria-invalid={Boolean(errors.name)}
                className={`${inputClass} pl-10 ${errors.name ? "border-red-400" : ""}`}
              />
            </div>
          </Field>
          <div>
            <PhoneNumberField
              id="booking-phone"
              label="Phone / WhatsApp"
              required
              national
              country={contact.phoneIso}
              onCountryChange={(phoneIso) => onContact({ phoneIso })}
              value={contact.phone}
              onChange={(phone) => onContact({ phone })}
              placeholder="Enter phone number"
            />
            {errors.phone ? (
              <p role="alert" className="pk-fade mt-1.5 flex items-center gap-1.5 text-xs font-bold text-red-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.phone}
              </p>
            ) : null}
          </div>
          <Field label="Email" error={errors.email}>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              <input
                id="booking-email"
                type="email"
                autoComplete="email"
                value={contact.email}
                onChange={(e) => onContact({ email: e.target.value })}
                placeholder="you@email.com"
                aria-invalid={Boolean(errors.email)}
                className={`${inputClass} pl-10 ${errors.email ? "border-red-400" : ""}`}
              />
            </div>
          </Field>
          <Field label="City of residence" optional className="sm:col-span-2">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand" />
              <input
                autoComplete="address-level2"
                value={contact.city}
                onChange={(e) => onContact({ city: e.target.value })}
                placeholder="Helps us plan pick-ups and flights"
                className={`${inputClass} pl-10`}
              />
            </div>
          </Field>
        </div>
      </Panel>

      {coTravellers.length > 0 ? (
        <Panel
          eyebrow="Fellow travellers"
          title="Who is travelling with you?"
          subtitle="Names are needed for hotel and ticket vouchers. You can also share them later on WhatsApp."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {coTravellers.map((person) => {
              const Icon = person.kind === "infant" ? Baby : person.kind === "child" ? Users : User;
              return (
                <Field
                  key={person.key}
                  label={`${person.label}${person.kind === "child" ? ` · ${person.age} yrs` : person.kind === "infant" ? " · under 2" : ""}`}
                  optional
                >
                  <div className="relative">
                    <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                    <input
                      value={guests[person.key] ?? ""}
                      onChange={(e) => onGuests({ [person.key]: e.target.value })}
                      placeholder="Full name"
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </Field>
              );
            })}
          </div>
        </Panel>
      ) : null}

      <Panel eyebrow="Make it yours" title="Special requests" subtitle="Tick anything that applies — we pass it straight to the hotels and your coordinator.">
        <div className="flex flex-wrap gap-2">
          {SPECIAL_REQUESTS.map((item) => {
            const active = requests.includes(item);
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleRequest(item)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition active:scale-95 ${
                  active ? "border-brand bg-brand text-white shadow-md shadow-brand/25" : "border-stone-200 bg-white text-stone-700 hover:border-brand/50"
                }`}
              >
                {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Sparkles className="h-3.5 w-3.5 text-brand" />}
                {item}
              </button>
            );
          })}
        </div>
        <Field label="Anything else we should know?" optional className="mt-4">
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
            maxLength={400}
            placeholder="Allergies, mobility needs, must-see places, preferred hotels…"
            className={`${inputClass} resize-y`}
          />
        </Field>
      </Panel>
    </div>
  );
}

/* ----------------------------- step 3: review ----------------------------- */

function ReviewCard({ title, onEdit, children }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-stone-400">{title}</p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold text-brand transition hover:bg-brand-muted"
        >
          <Pencil className="h-3 w-3" />
          Edit
        </button>
      </div>
      <div className="mt-2 space-y-1 text-sm font-semibold text-stone-800">{children}</div>
    </div>
  );
}

const METHOD_ICONS = { upi: Smartphone, card: CreditCard, netbanking: Landmark, bank: Landmark };

export function ReviewStep({
  pkg,
  booking,
  pricing,
  contact,
  guests,
  requests,
  notes,
  plan,
  onPlan,
  method,
  onMethod,
  agree,
  onAgree,
  onEdit,
  errors,
  amounts,
}) {
  const coTravellers = listCoTravellers(booking.travellers)
    .map((p) => ({ ...p, name: (guests[p.key] ?? "").trim() }))
    .filter((p) => p.name);

  return (
    <div className="space-y-6">
      <Panel eyebrow="Double-check" title="Review your booking" subtitle="Everything look right? You can edit any section before submitting.">
        <div className="grid gap-3 sm:grid-cols-2">
          <ReviewCard title="Trip" onEdit={() => onEdit(0)}>
            <p>{pkg.title}</p>
            <p className="text-stone-500">
              {booking.date ? formatDisplayDate(booking.date, { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : "Date to be decided"}
            </p>
            <p className="text-stone-500">
              {pricing.hotel.label} hotels · Ex {booking.departureCity}
            </p>
          </ReviewCard>
          <ReviewCard title="Travellers" onEdit={() => onEdit(0)}>
            <p>{formatTravellerSummary(booking.travellers)}</p>
            <p className="text-stone-500">
              {getRoomsNeeded(booking.travellers.adults)} room{getRoomsNeeded(booking.travellers.adults) > 1 ? "s" : ""}
              {booking.travellers.children > 0 ? ` · child ages ${booking.travellers.childAges.join(", ")}` : ""}
            </p>
          </ReviewCard>
          <ReviewCard title="Contact" onEdit={() => onEdit(1)}>
            <p>{contact.name}</p>
            <p className="break-all text-stone-500">{contact.email}</p>
            <p className="text-stone-500">{contact.phone}</p>
          </ReviewCard>
          <ReviewCard title="Requests & guests" onEdit={() => onEdit(1)}>
            {coTravellers.length ? <p>{coTravellers.map((p) => p.name).join(", ")}</p> : <p className="text-stone-500">No co-traveller names yet</p>}
            {requests.length || notes ? (
              <p className="text-stone-500">{[...requests, notes].filter(Boolean).join(" · ")}</p>
            ) : (
              <p className="text-stone-500">No special requests</p>
            )}
          </ReviewCard>
        </div>
      </Panel>

      <Panel eyebrow="Payment" title="How would you like to pay?" subtitle="Nothing is charged on this page. Our desk sends a secure payment link right after you submit.">
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Payment plan">
          {PAYMENT_PLANS.map((p) => {
            const active = plan === p.id;
            const due = amounts[p.id];
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onPlan(p.id)}
                className={`relative rounded-2xl border-2 p-4 text-left transition active:scale-[0.98] ${
                  active ? "border-brand bg-brand-muted shadow-md shadow-brand/10" : "border-stone-200 bg-white hover:border-brand/40"
                }`}
              >
                {active ? (
                  <span className="pk-pop absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-brand text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </span>
                ) : null}
                <Wallet className={`h-6 w-6 ${active ? "text-brand" : "text-stone-400"}`} />
                <p className="mt-2 text-sm font-extrabold text-stone-900">{p.label}</p>
                <p className="text-xs text-stone-500">{p.blurb}</p>
                <p className="mt-3 text-lg font-extrabold text-stone-900">{formatPackagePrice(due)}</p>
                <p className="text-[11px] font-semibold text-stone-400">to pay now</p>
              </button>
            );
          })}
        </div>

        <p className="mb-2 mt-5 text-xs font-extrabold text-stone-700">Preferred payment method</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Payment method">
          {PAYMENT_METHODS.map((m) => {
            const Icon = METHOD_ICONS[m.id] ?? CreditCard;
            const active = method === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onMethod(m.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition active:scale-95 ${
                  active ? "border-brand bg-brand text-white shadow-md shadow-brand/25" : "border-stone-200 bg-white text-stone-700 hover:border-brand/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </Panel>

      <div className={`rounded-2xl border bg-white p-4 ${errors.agree ? "border-red-300 ring-2 ring-red-100" : "border-stone-200"}`}>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            id="booking-agree"
            type="checkbox"
            checked={agree}
            onChange={(e) => onAgree(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[#ea580c]"
          />
          <span className="text-sm font-medium leading-relaxed text-stone-700">
            I have reviewed the trip details and agree to the{" "}
            <Link href="/terms-of-service" target="_blank" className="font-bold text-brand underline-offset-2 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/cancellation-policy" target="_blank" className="font-bold text-brand underline-offset-2 hover:underline">
              Cancellation Policy
            </Link>
            .
          </span>
        </label>
        {errors.agree ? (
          <p role="alert" className="pk-fade mt-2 flex items-center gap-1.5 pl-8 text-xs font-bold text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.agree}
          </p>
        ) : null}
      </div>
    </div>
  );
}
