"use client";

import { useMemo, useState } from "react";
import { getCountrySearchOptions } from "@/lib/tourDestinations";
import { getDefaultBookingDates } from "@/lib/dates";
import PackageLocationCombobox from "@/components/packages/PackageLocationCombobox";
import PhoneNumberField from "@/components/booking/PhoneNumberField";
import { submitTourLeadFromClient } from "@/lib/tourLeadClient";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  parseStoredPhone,
} from "@/lib/phoneCountryCodes";
import {
  TOUR_ENQUIRY_TYPES,
  buildEnquiryDestination,
  resolveTourTypeLabel,
} from "@/lib/tourEnquiryTypes";

const HERO_POSTER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80";

const TABS = [
  { id: "country", label: "All Country" },
  { id: "state", label: "States" },
  { id: "city", label: "Cities" },
];

const HERO_PERKS = [
  "All-inclusive tour packages",
  "India & international destinations",
  "Custom itineraries on request",
];

const TOUR_TYPES = TOUR_ENQUIRY_TYPES;

function toDateInputValue(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function HeroBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-stone-900 bg-cover bg-center"
      style={{ backgroundImage: `url(${HERO_POSTER})` }}
      aria-hidden
    >
      <video
        className="h-full w-full object-cover motion-reduce:hidden"
        autoPlay
        muted
        loop
        playsInline
        poster={HERO_POSTER}
      >
        <source src="/videos/enquiry-hero.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

export default function PackagesHeroSearch({ states = [], cities = [] }) {
  const defaultDates = useMemo(() => getDefaultBookingDates(), []);
  const [tab, setTab] = useState("country");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [travelDate, setTravelDate] = useState(toDateInputValue(defaultDates.checkIn));
  const [tourType, setTourType] = useState("private");
  const [adults, setAdults] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryIso, setPhoneCountryIso] = useState(DEFAULT_PHONE_COUNTRY_ISO);
  const [phone, setPhone] = useState("");
  const [ticketBooked, setTicketBooked] = useState("no");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const countryOptions = useMemo(() => getCountrySearchOptions(), []);

  const locationOptions = useMemo(() => {
    if (tab === "country") return countryOptions;
    if (tab === "state") return states;
    return cities;
  }, [tab, states, cities, countryOptions]);

  const selectedValue =
    tab === "country" ? country : tab === "state" ? state : city;

  const locationPlaceholder =
    tab === "country"
      ? "Search country…"
      : tab === "state"
        ? "Search state…"
        : "Search city…";

  const onTabChange = (nextTab) => {
    setTab(nextTab);
    setState("");
    setCity("");
    setError("");
    if (nextTab === "country") setCountry("India");
  };

  const onLocationChange = (value) => {
    if (tab === "country") setCountry(value);
    else if (tab === "state") setState(value);
    else setCity(value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const location =
      tab === "country" ? country : tab === "state" ? state : city;

    if (!location?.trim()) {
      setError(`Please select a ${tab === "country" ? "country" : tab}`);
      return;
    }
    if (!travelDate) {
      setError("Please select a travel date");
      return;
    }
    if (!tourType) {
      setError("Please select a tour type");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    const phoneForApi = parseStoredPhone(phone, phoneCountryIso).local;
    if (!phoneForApi) {
      setError("Please enter your mobile number");
      return;
    }

    const tourTypeLabel = resolveTourTypeLabel(tourType);

    const leadCountry = tab === "country" ? location : "India";
    const leadState = tab === "state" ? location : "";
    const leadCity = tab === "city" ? location : "";
    const destination = buildEnquiryDestination({
      city: leadCity,
      state: leadState,
      country: leadCountry,
      location,
    });

    setError("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const result = await submitTourLeadFromClient({
        name: name.trim(),
        email: email.trim(),
        mobile: phoneForApi,
        adults: String(adults),
        city: leadCity,
        state: leadState,
        country: leadCountry,
        location,
        destination,
        tourType: tourTypeLabel,
        travelDate,
        flightTrainTicketBooked: ticketBooked,
      });

      setSuccessMessage(
        result.message ||
          "Enquiry submitted successfully! Our travel experts will contact you shortly."
      );
    } catch (submitError) {
      setError(submitError.message || "Failed to submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative isolate -mt-24 overflow-hidden bg-stone-950">
      <HeroBackground />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(12,10,9,0.88)_0%,rgba(12,10,9,0.58)_46%,rgba(12,10,9,0.38)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/30" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-32 lg:min-h-screen lg:grid-cols-[1fr_0.92fr] lg:gap-10 lg:pb-12 lg:pt-36">
          <div className="animate-hero-enter">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Tour packages
            </span>

            <h1 className="mt-5 font-serif text-5xl font-medium leading-[0.98] tracking-tight text-white sm:text-6xl">
              <span className="block">Every Country.</span>
              <span className="block">Every State.</span>
              <span className="block">Every City.</span>
            </h1>

            <p className="mt-5 font-serif text-3xl font-medium italic text-orange-100 sm:text-4xl">
              One Journey.
            </p>

            <ul className="mt-8 space-y-3">
              {HERO_PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-2 text-sm font-medium text-white/90">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand">
                    ✓
                  </span>
                  {perk}
                </li>
              ))}
            </ul>

          </div>

          <div className="w-full">
            <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-24px_rgba(0,0,0,0.55)]">
              <div className="flex flex-wrap items-end justify-between gap-2 border-b border-stone-100 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-xl font-semibold tracking-tight text-stone-950">Plan your trip</p>
                  <p className="mt-0.5 text-sm text-stone-500">Share the trip. We send the plan.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 p-5 sm:p-6">
                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">
                    Destination type
                  </span>
                  <div className="grid grid-cols-3 gap-1 rounded-2xl bg-stone-100 p-1">
                    {TABS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onTabChange(item.id)}
                        className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${
                          tab === item.id
                            ? "bg-white text-stone-950 shadow-sm"
                            : "text-stone-500 hover:text-stone-900"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Where to?">
                    <PackageLocationCombobox
                      key={tab}
                      options={locationOptions}
                      value={selectedValue}
                      onChange={onLocationChange}
                      placeholder={locationPlaceholder}
                      highlightFirst={tab === "country" ? "India" : null}
                      emptyMessage={
                        tab === "country"
                          ? "No matching country"
                          : tab === "state"
                            ? "No matching state"
                            : "No matching city"
                      }
                    />
                  </FormField>

                  <FormField label="Flight / Train Ticket Booked?">
                    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-stone-100 p-1">
                      {[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setTicketBooked(option.value);
                            if (error) setError("");
                          }}
                          className={`rounded-xl px-2 py-2.5 text-sm font-semibold transition ${
                            ticketBooked === option.value
                              ? "bg-white text-stone-950 shadow-sm"
                              : "text-stone-500 hover:text-stone-900"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </FormField>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Full name">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError("");
                      }}
                      className={inputClass}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </FormField>

                  <FormField label="Email">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className={inputClass}
                      placeholder="you@email.com"
                      autoComplete="email"
                    />
                  </FormField>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <PhoneNumberField
                    id="hero-enquiry-phone"
                    label="Mobile"
                    required
                    national
                    compact
                    className="min-w-0"
                    country={phoneCountryIso}
                    onCountryChange={setPhoneCountryIso}
                    value={phone}
                    onChange={(next) => {
                      setPhone(next);
                      if (error) setError("");
                    }}
                    placeholder="Phone number"
                  />

                  <FormField label="Adults" className="min-w-0">
                    <div className="flex h-11 items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-1.5">
                      <button
                        type="button"
                        onClick={() => setAdults((n) => Math.max(1, n - 1))}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-base font-bold text-stone-600 transition hover:border-brand hover:text-brand"
                        aria-label="Decrease adults"
                      >
                        −
                      </button>
                      <span className="truncate px-1 text-sm font-bold text-stone-900">
                        {adults}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAdults((n) => Math.min(50, n + 1))}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-base font-bold text-stone-600 transition hover:border-brand hover:text-brand"
                        aria-label="Increase adults"
                      >
                        +
                      </button>
                    </div>
                  </FormField>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label="Travel date">
                    <input
                      type="date"
                      required
                      value={travelDate}
                      min={toDateInputValue(new Date())}
                      onChange={(e) => {
                        setTravelDate(e.target.value);
                        if (error) setError("");
                      }}
                      className={inputClass}
                    />
                  </FormField>

                  <FormField label="Tour type">
                    <select
                      required
                      value={tourType}
                      onChange={(e) => {
                        setTourType(e.target.value);
                        if (error) setError("");
                      }}
                      className={inputClass}
                    >
                      {TOUR_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">
                    {error}
                  </p>
                )}

                {successMessage && (
                  <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700">
                    {successMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-brand py-3.5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? "Submitting…" : "Submit enquiry"}
                </button>

                <p className="text-center text-[11px] text-stone-400">
                  Free quote · No obligation · Response within a few hours
                </p>
              </form>
            </div>
          </div>
      </div>
    </section>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-base font-medium text-stone-950 outline-none transition focus:border-brand focus:bg-white focus:ring-2 focus:ring-brand/20";

function FormField({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500">{label}</span>
      {children}
    </label>
  );
}
