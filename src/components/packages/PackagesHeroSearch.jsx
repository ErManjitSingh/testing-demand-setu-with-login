"use client";

import Link from "next/link";
import { BadgeCheck, Headset, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { useMemo, useState } from "react";
import TripSearchBar from "@/components/packages/shared/TripSearchBar";
import { buildListingHref } from "@/lib/packageBooking";
import { getCountrySearchOptions } from "@/lib/tourDestinations";
import { getDefaultBookingDates } from "@/lib/dates";
import {
  CHILD_AGE_MAX,
  CHILD_AGE_MIN,
  buildTripNotes,
  getRoomsNeeded,
  syncChildAges,
} from "@/lib/tourTravellers";
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

const MODES = [
  { id: "search", label: "Find a trip" },
  { id: "plan", label: "Get a free plan" },
];

const POPULAR_SEARCHES = ["Ladakh", "Kerala", "Rajasthan", "Maldives", "Dubai", "Bali", "Kashmir"];

const HERO_STATS = [
  { icon: Users, value: "12,500+", label: "Happy travellers" },
  { icon: Star, value: "4.8", label: "Average rating" },
  { icon: BadgeCheck, value: "100+", label: "Curated packages" },
  { icon: Headset, value: "24x7", label: "Trip support" },
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

function ExpertPlanForm({ states = [], cities = [] }) {
  const defaultDates = useMemo(() => getDefaultBookingDates(), []);
  const [tab, setTab] = useState("country");
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [travelDate, setTravelDate] = useState(toDateInputValue(defaultDates.checkIn));
  const [tourType, setTourType] = useState("private");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [childAges, setChildAges] = useState([]);
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
        children: String(children),
        infants: String(infants),
        childAges: childAges.join(","),
        rooms: String(getRoomsNeeded(adults)),
        tripNotes:
          children > 0 || infants > 0
            ? buildTripNotes({ adults, children, infants, childAges, rooms: getRoomsNeeded(adults) })
            : "",
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
    <form onSubmit={handleSubmit} className="space-y-3">
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
                    <MiniStepper
                      value={adults}
                      min={1}
                      max={50}
                      label="adults"
                      onChange={setAdults}
                    />
                  </FormField>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <FormField label={`Children (${CHILD_AGE_MIN}–${CHILD_AGE_MAX} yrs)`} className="min-w-0">
                    <MiniStepper
                      value={children}
                      min={0}
                      max={8}
                      label="children"
                      onChange={(n) => {
                        setChildren(n);
                        setChildAges((ages) => syncChildAges(ages, n));
                      }}
                    />
                  </FormField>
                  <FormField label="Infants (under 2)" className="min-w-0">
                    <MiniStepper value={infants} min={0} max={4} label="infants" onChange={setInfants} />
                  </FormField>
                </div>

                {children > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {childAges.map((age, i) => (
                      <select
                        key={i}
                        aria-label={`Age of child ${i + 1}`}
                        value={age}
                        onChange={(e) =>
                          setChildAges((ages) => ages.map((a, idx) => (idx === i ? Number(e.target.value) : a)))
                        }
                        className={inputClass}
                      >
                        {Array.from({ length: CHILD_AGE_MAX - CHILD_AGE_MIN + 1 }, (_, k) => CHILD_AGE_MIN + k).map(
                          (a) => (
                            <option key={a} value={a}>
                              Child {i + 1}: {a} yrs
                            </option>
                          )
                        )}
                      </select>
                    ))}
                  </div>
                )}

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
  );
}

function MiniStepper({ value, min, max, label, onChange }) {
  return (
    <div className="flex h-11 items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-base font-bold text-stone-600 transition hover:border-brand hover:text-brand disabled:opacity-40"
        aria-label={`Decrease ${label}`}
      >
        −
      </button>
      <span className="truncate px-1 text-sm font-bold text-stone-900">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-base font-bold text-stone-600 transition hover:border-brand hover:text-brand disabled:opacity-40"
        aria-label={`Increase ${label}`}
      >
        +
      </button>
    </div>
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

export default function PackagesHeroSearch({ states = [], cities = [] }) {
  const [mode, setMode] = useState("search");

  return (
    <section className="relative isolate -mt-20 overflow-hidden bg-stone-950 sm:-mt-24">
      <HeroBackground />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(12,10,9,0.9)_0%,rgba(12,10,9,0.6)_46%,rgba(12,10,9,0.35)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/30" />
      <div aria-hidden className="pointer-events-none absolute -left-24 top-1/3 hidden h-72 w-72 rounded-full bg-orange-500/20 blur-3xl pk-drift lg:block" />
      <div aria-hidden className="pointer-events-none absolute -right-20 bottom-10 hidden h-80 w-80 rounded-full bg-amber-400/15 blur-3xl pk-drift lg:block" style={{ animationDelay: "-4s" }} />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-28 sm:gap-10 sm:px-6 sm:pb-16 sm:pt-36 lg:min-h-screen lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-14 lg:pt-40">
        <div className="animate-hero-enter">
          <span className="pk-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Tour packages · India &amp; the world
          </span>

          <h1 className="mt-5 font-serif text-[2.7rem] font-medium leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl">
            <span className="block">Every Country.</span>
            <span className="block">Every State.</span>
            <span className="block">Every City.</span>
            <span className="text-shimmer mt-2 block italic">One Journey.</span>
          </h1>

          <ul className="mt-7 space-y-3">
            {HERO_PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-2.5 text-sm font-semibold text-white/90 sm:text-base">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand">
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>

          <div className="mt-8 hidden grid-cols-4 gap-4 sm:grid">
            {HERO_STATS.map((item) => (
              <div key={item.label} className="flex flex-col items-start gap-2.5 border-l border-white/15 pl-4 first:border-l-0 first:pl-0">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/12 text-orange-200 ring-1 ring-white/15">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-lg font-extrabold leading-none text-white">{item.value}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/60">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full animate-hero-enter" style={{ animationDelay: "120ms" }}>
          <div className="rounded-[2rem] bg-white shadow-[0_40px_90px_-28px_rgba(0,0,0,0.65)] ring-1 ring-white/40">
            <div className="p-2">
              <div role="tablist" aria-label="How would you like to start?" className="grid grid-cols-2 gap-1 rounded-[1.4rem] bg-stone-100 p-1">
                {MODES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={mode === item.id}
                    onClick={() => setMode(item.id)}
                    className={`rounded-[1.1rem] px-3 py-3 text-sm font-extrabold transition duration-300 ${
                      mode === item.id ? "bg-white text-stone-950 shadow-md" : "text-stone-500 hover:text-stone-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-5 pb-6 pt-3 sm:px-7 sm:pb-7">
              {mode === "search" ? (
                <div key="search" className="pk-fade">
                  <div className="mb-4">
                    <p className="text-xl font-extrabold tracking-tight text-stone-950">Where to next?</p>
                    <p className="mt-0.5 text-sm text-stone-500">
                      Pick a place, your dates and your people — we show every matching trip with live prices.
                    </p>
                  </div>
                  <TripSearchBar layout="stack" showBudget />

                  <div className="mt-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">Popular searches</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {POPULAR_SEARCHES.map((place) => (
                        <Link
                          key={place}
                          href={buildListingHref({ q: place })}
                          className="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-700 transition hover:-translate-y-0.5 hover:border-brand hover:bg-brand-muted hover:text-brand-dark"
                        >
                          {place}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div key="plan" className="pk-fade">
                  <div className="mb-4">
                    <p className="text-xl font-extrabold tracking-tight text-stone-950">Plan your trip</p>
                    <p className="mt-0.5 text-sm text-stone-500">Share the trip. We send the plan.</p>
                  </div>
                  <ExpertPlanForm states={states} cities={cities} />
                </div>
              )}

              <p className="mt-5 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-stone-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Free itinerary changes · Pay 25% to confirm · No hidden charges
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
