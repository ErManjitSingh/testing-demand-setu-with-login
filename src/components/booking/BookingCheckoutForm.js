"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatGuestsRoomsLabel } from "@/components/booking/GuestsRoomsPicker";
import BookingPriceBreakdown from "@/components/booking/BookingPriceBreakdown";
import CheckoutGoogleAuthPopup from "@/components/booking/CheckoutGoogleAuthPopup";
import PhoneNumberField from "@/components/booking/PhoneNumberField";
import { useTripSearch } from "@/hooks/useTripSearch";
import { formatPrice, getCategoryLabel } from "@/lib/listings";
import {
  daysUntil,
  formatBookingDate,
  nightsBetween,
  toDateParam,
} from "@/lib/dates";
import {
  applyPropertyPriceMarkup,
  calculateBookingPrice,
  fetchPropertyPriceMarkupMultiplier,
  formatGstSummaryLabel,
  setRuntimePriceMarkupMultiplier,
} from "@/lib/bookingPricing";
import { buildPropertyUrl, normalizeGuests } from "@/lib/bookingSearch";
import { serializeChildAgesParam } from "@/lib/guestOccupancy";
import { useGuestAuth } from "@/hooks/useGuestAuth";
import { buildCheckoutApiPayload, generateWebsiteBookingId } from "@/lib/checkoutPayload";
import { createHotelBooking } from "@/lib/hotelBookingApi";
import { buildHotelBookingCreatePayload } from "@/lib/hotelBookingPayload";
import {
  createInventoryBooking,
  extractInventoryBookingId,
  getGuestProfileFromSession,
  isCheckoutProfileComplete,
} from "@/lib/inventoryBookingApi";
import {
  createDemandOrder,
  openDemandRazorpayCheckout,
} from "@/lib/razorpayDemandApi";
import {
  mergeBookingForEmail,
  sendBookingConfirmationEmail,
  sendNewBookingAdminEmail,
} from "@/lib/bookingEmail";
import { loadRoomSelection } from "@/lib/roomSelectionStorage";
import {
  sendBookingWelcomeWhatsApp,
  sendPaymentConfirmWhatsApp,
} from "@/lib/whatsappApi";
import {
  DEFAULT_PHONE_COUNTRY_ISO,
  parseStoredPhone,
  phoneIsoForCountryName,
} from "@/lib/phoneCountryCodes";

const AMENITY_ICONS = {
  "Free WiFi": "📶",
  Pool: "🏊",
  Breakfast: "🍳",
  Parking: "🅿️",
  Kitchen: "🍴",
  AC: "❄️",
  Spa: "💆",
  "Pet friendly": "🐾",
};

function BookingCheckoutFormClient({
  listing,
  initialTrip,
  propertyHref,
  priceMarkupMultiplier,
}) {
  const urlParams = useSearchParams();
  const trip = useTripSearch(initialTrip);
  const [roomBooking, setRoomBooking] = useState(null);
  const [markupMultiplier, setMarkupMultiplier] = useState(
    Number(priceMarkupMultiplier) > 0 ? Number(priceMarkupMultiplier) : null
  );

  const checkIn = trip.checkIn;
  const checkOut = trip.checkOut;
  const { adults, children, rooms } = trip.guests;
  const markedListingPrice = applyPropertyPriceMarkup(
    listing.price,
    markupMultiplier || undefined
  );
  const nightly = Number(urlParams.get("price")) || markedListingPrice;
  const isInventoryBooking = urlParams.get("inventory") === "1";

  const inventoryQueryKey = [
    urlParams.get("inventory"),
    urlParams.get("total"),
    urlParams.get("checkIn"),
    urlParams.get("checkOut"),
    urlParams.get("rooms"),
  ].join("|");

  useEffect(() => {
    let cancelled = false;
    async function loadMarkup() {
      if (Number(priceMarkupMultiplier) > 0) {
        setRuntimePriceMarkupMultiplier(priceMarkupMultiplier);
        setMarkupMultiplier(Number(priceMarkupMultiplier));
        return;
      }
      const multiplier = await fetchPropertyPriceMarkupMultiplier();
      if (cancelled) return;
      setRuntimePriceMarkupMultiplier(multiplier);
      setMarkupMultiplier(multiplier);
    }
    loadMarkup();
    return () => {
      cancelled = true;
      setRuntimePriceMarkupMultiplier(null);
    };
  }, [priceMarkupMultiplier]);

  useEffect(() => {
    setRoomBooking(loadRoomSelection(listing.slug));
  }, [listing.slug, inventoryQueryKey]);

  const nights = useMemo(
    () => nightsBetween(checkIn, checkOut, 1),
    [checkIn, checkOut]
  );

  const datesMatchSelection = useMemo(() => {
    if (!roomBooking?.checkIn || !roomBooking?.checkOut || !checkIn || !checkOut) {
      return false;
    }
    return (
      roomBooking.checkIn === toDateParam(checkIn) &&
      roomBooking.checkOut === toDateParam(checkOut)
    );
  }, [roomBooking, checkIn, checkOut]);

  const guestsMatchSelection = useMemo(() => {
    if (!roomBooking?.guests || !trip.guests) return false;
    const saved = normalizeGuests(roomBooking.guests);
    const current = normalizeGuests(trip.guests);
    return (
      saved.adults === current.adults &&
      saved.children === current.children &&
      saved.rooms === current.rooms &&
      serializeChildAgesParam(saved.childAges) ===
        serializeChildAgesParam(current.childAges)
    );
  }, [roomBooking, trip.guests]);

  const hasSavedLineItems =
    Array.isArray(roomBooking?.lineItems) && roomBooking.lineItems.length > 0;

  const hasInventorySelection = useMemo(() => {
    if (!hasSavedLineItems || !datesMatchSelection) return false;
    if (isInventoryBooking) return true;
    return guestsMatchSelection;
  }, [
    hasSavedLineItems,
    datesMatchSelection,
    isInventoryBooking,
    guestsMatchSelection,
  ]);

  const pricing = useMemo(() => {
    if (hasInventorySelection) {
      return {
        subtotal: Number(roomBooking.subtotal) || 0,
        gst: Number(roomBooking.gst) || 0,
        total: Number(roomBooking.total) || 0,
        lineItems: roomBooking.lineItems,
      };
    }
    const fallback = calculateBookingPrice(nightly, nights);
    return { ...fallback, lineItems: [] };
  }, [hasInventorySelection, roomBooking, nightly, nights]);

  const { subtotal, gst, total, lineItems } = pricing;
  const backToProperty = propertyHref || buildPropertyUrl(listing);
  const daysAway = daysUntil(checkIn);
  const locationScore = (listing.rating * 2).toFixed(1);
  const guestLabel = formatGuestsRoomsLabel({ adults, children, rooms });
  const { session, isLoggedIn, ready: authReady } = useGuestAuth();
  const loggedInProfile = isLoggedIn ? getGuestProfileFromSession(session) : null;
  const hasCompleteCheckoutProfile = isCheckoutProfileComplete(loggedInProfile);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("India");
  const [phoneCountryIso, setPhoneCountryIso] = useState(DEFAULT_PHONE_COUNTRY_ISO);
  const [phone, setPhone] = useState("");
  const [showFormHint, setShowFormHint] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookError, setBookError] = useState("");
  const formWasEmptyRef = useRef(true);
  const formHintShownRef = useRef(false);
  const guestFormRef = useRef(null);

  const fullName = `${firstName} ${lastName}`.trim();
  const fullMobile = String(phone || "").trim();
  const phoneForApi = parseStoredPhone(fullMobile, phoneCountryIso).local;

  const isGuestFormEmpty =
    !firstName.trim() &&
    !lastName.trim() &&
    !email.trim() &&
    !phoneForApi;

  useEffect(() => {
    if (!authReady || !isLoggedIn || !session) return;
    const profile = getGuestProfileFromSession(session);
    if (!profile) return;
    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
    setEmail(profile.email || "");
    setCountry(profile.country || "India");
    const parsedPhone = parseStoredPhone(
      profile.mobile,
      phoneIsoForCountryName(profile.country)
    );
    setPhoneCountryIso(parsedPhone.iso);
    setPhone(parsedPhone.e164 || "");
  }, [authReady, isLoggedIn, session]);

  useEffect(() => {
    if (isLoggedIn && hasCompleteCheckoutProfile) return;
    if (formWasEmptyRef.current && !isGuestFormEmpty && !formHintShownRef.current) {
      setShowFormHint(true);
      formHintShownRef.current = true;
    }
    if (!isGuestFormEmpty) {
      formWasEmptyRef.current = false;
    }
  }, [isGuestFormEmpty, isLoggedIn, hasCompleteCheckoutProfile]);

  const buildApiPayload = (guestOverrides = {}, websiteid = "") =>
    buildCheckoutApiPayload({
      listing,
      checkIn,
      checkOut,
      guests: trip.guests,
      nights,
      hasInventorySelection,
      roomBooking,
      lineItems,
      subtotal,
      gst,
      total,
      nightly,
      websiteid,
      markupMultiplier,
      guest: {
        firstName,
        lastName,
        fullName,
        email,
        country,
        mobile: phoneForApi,
        ...guestOverrides,
      },
    });

  const scrollToGuestForm = () => {
    guestFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const focusFirstMissingGuestField = () => {
    if (isLoggedIn && hasCompleteCheckoutProfile) return;

    const missingFields = isLoggedIn
      ? [{ filled: Boolean(phoneForApi), id: "mobile" }]
      : [
          { filled: Boolean(firstName.trim()), id: "firstName" },
          { filled: Boolean(lastName.trim()), id: "lastName" },
          { filled: Boolean(email.trim()), id: "email" },
          { filled: Boolean(phoneForApi), id: "mobile" },
        ];
    const firstMissing = missingFields.find((field) => !field.filled);
    if (!firstMissing) return;

    window.setTimeout(() => {
      document.getElementById(firstMissing.id)?.focus({ preventScroll: true });
    }, 350);
  };

  const sendBookingNotifications = async (bookingForNotifications, { paidOnline = false } = {}) => {
    try {
      await sendBookingWelcomeWhatsApp({ mobile: phoneForApi });
    } catch (whatsappError) {
      console.warn("[Checkout] WhatsApp welcome template failed:", whatsappError);
    }

    if (paidOnline) {
      try {
        await sendPaymentConfirmWhatsApp({ mobile: phoneForApi });
      } catch (whatsappError) {
        console.warn("[Checkout] WhatsApp payment_confirm template failed:", whatsappError);
      }
    }

    try {
      await sendBookingConfirmationEmail(bookingForNotifications);
    } catch (emailError) {
      console.warn("[Checkout] Booking confirmation email failed:", emailError);
    }

    try {
      await sendNewBookingAdminEmail(bookingForNotifications);
    } catch (emailError) {
      console.warn("[Checkout] Admin booking notification email failed:", emailError);
    }
  };

  const handleBook = async (paymentMethod = "pay_now") => {
    const hasGuestDetails =
      firstName.trim() && lastName.trim() && email.trim() && phoneForApi;
    const canSubmit = hasGuestDetails;

    if (!canSubmit) {
      setBookError(
        isLoggedIn && !hasCompleteCheckoutProfile
          ? "Please add your mobile number and country to continue."
          : "Please complete all required details before continuing."
      );
      if (!isLoggedIn || !hasCompleteCheckoutProfile) {
        setShowFormHint(true);
      }
      scrollToGuestForm();
      focusFirstMissingGuestField();
      return;
    }

    const websiteid = generateWebsiteBookingId();
    const submitPayload = buildApiPayload({}, websiteid);

    setBookError("");
    setLoading(true);

    try {
      const bookingResponse = await createInventoryBooking({
        ...submitPayload,
        paymentMethod,
      });

      const inventoryBookingId = extractInventoryBookingId(bookingResponse);
      const createdBooking = bookingResponse?.data ?? bookingResponse?.booking ?? bookingResponse;
      let verifyResult = null;

      if (inventoryBookingId) {
        try {
          const hotelBookingPayload = buildHotelBookingCreatePayload({
            inventoryBookingId,
            listing,
            submitPayload,
            lineItems,
            nightly,
          });
          await createHotelBooking(hotelBookingPayload);
        } catch (hotelBookingError) {
          console.warn("[Checkout] Hotel booking create failed:", hotelBookingError);
        }
      }

      if (paymentMethod === "pay_now") {
        if (!inventoryBookingId) {
          throw new Error("Booking created but payment could not be started. Please contact support.");
        }

        const payableTotal =
          submitPayload.pricing?.payableTotal ?? submitPayload.pricing?.total ?? total;

        const orderResponse = await createDemandOrder({
          amount: payableTotal,
          inventoryBookingId,
          customerDetails: {
            name: fullName,
            email: email.trim(),
            phone: phoneForApi,
          },
          packageDetails: {
            property: submitPayload.property,
            stay: submitPayload.stay,
            pricing: submitPayload.pricing,
          },
          notes: `Booking for ${listing.title}`,
        });

        const keyId = orderResponse.key_id;
        const order = orderResponse.order;

        if (!keyId || !order?.id) {
          throw new Error("Could not start payment. Please try again.");
        }

        setLoading(false);
        verifyResult = await openDemandRazorpayCheckout({
          keyId,
          order,
          customer: {
            name: fullName,
            email: email.trim(),
            phone: phoneForApi,
          },
          description: `Booking · ${listing.title}`,
        });
        setLoading(true);
      }

      const serverBooking =
        paymentMethod === "pay_now" ? verifyResult?.booking ?? createdBooking : createdBooking;

      const bookingForNotifications = mergeBookingForEmail(
        { ...submitPayload, paymentMethod },
        serverBooking,
        {
          paymentMethod,
          bookingId: inventoryBookingId,
          razorpayPaymentId: verifyResult?.payment?.paymentId,
          razorpayOrderId: verifyResult?.payment?.orderId,
          guestPassword: "",
        }
      );

      await sendBookingNotifications(bookingForNotifications, {
        paidOnline: paymentMethod === "pay_now" && Boolean(verifyResult?.success ?? verifyResult?.booking),
      });
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      const message = error?.message || "Booking failed. Please try again.";
      setBookError(
        message === "Payment cancelled"
          ? "Payment was cancelled. Your booking may still be saved — check My Bookings or try Pay at property."
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-brand/30 bg-white p-8 text-center shadow-lg sm:p-10">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand text-3xl text-white shadow-lg">
          ✓
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-foreground">Successfully booked!</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Thank you, <span className="font-bold text-foreground">{fullName}</span>. Your stay at{" "}
          <span className="font-bold text-foreground">{listing.title}</span> is confirmed. You
          will shortly receive a call on{" "}
          <span className="font-bold text-brand">{fullMobile}</span>.
        </p>
        <p className="mt-2 text-xs text-muted">Confirmation sent to {email}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={backToProperty}
            className="rounded-xl border border-stone-200 px-6 py-3 text-sm font-bold transition hover:border-brand"
          >
            Back to property
          </Link>
          <Link
            href="/listings"
            className="rounded-xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-md"
          >
            Explore more stays
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <CheckoutGoogleAuthPopup />

      <div className="grid gap-6 pb-44 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-8 lg:pb-0">
      {/* Left — property card & guest form */}
      <div className="min-w-0 space-y-4">
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="relative aspect-[16/10] w-full bg-stone-100 sm:aspect-[21/9]">
            <Image
              src={listing.image}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 65vw"
              priority
            />
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StarRating rating={listing.rating} />
              <span className="rounded bg-brand-muted px-2 py-0.5 text-[10px] font-bold uppercase text-brand-dark">
                {getCategoryLabel(listing.category)}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-extrabold leading-snug text-foreground sm:text-xl">
              {listing.title}
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
              {listing.location}, {listing.region}, India
            </p>
            <p className="mt-2 text-xs font-semibold text-brand-dark">
              Excellent location — {locationScore}
            </p>
            {listing.reviews > 0 && (
              <div className="mt-3 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-extrabold text-white">
                  {listing.rating}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">Exceptional</p>
                  <p className="text-xs text-muted">{listing.reviews} reviews</p>
                </div>
              </div>
            )}
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-stone-100 pt-4">
              {(listing.amenities ?? []).slice(0, 5).map((a) => (
                <li key={a} className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                  <span aria-hidden>{AMENITY_ICONS[a] ?? "✓"}</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isLoggedIn ? (
          <div className="rounded-xl border border-brand/25 bg-gradient-to-r from-brand-muted to-orange-50 px-4 py-3.5 text-sm text-stone-700">
            Signed in as{" "}
            <span className="font-bold text-brand-dark">{loggedInProfile?.fullName}</span>.{" "}
            <Link href="/my-bookings" className="font-bold text-brand underline">
              View My Bookings
            </Link>
          </div>
        ) : null}

        <div
          ref={guestFormRef}
          id="checkout-guest-form"
          className="scroll-mt-24 rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7"
        >
          {hasInventorySelection ? (
            <div className="border-b border-stone-100 pb-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-orange-500 text-base shadow-md shadow-brand/25">
                  🛏️
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-foreground sm:text-lg">Selected rooms</h3>
                  <p className="text-xs font-medium text-muted">
                    {lineItems.length} room type{lineItems.length !== 1 ? "s" : ""} in your booking
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-4">
                {lineItems.map((item, index) => (
                  <SelectedRoomCard key={`${item.roomId}-${item.mealPlan}-${index}`} item={item} index={index} />
                ))}
              </ul>
            </div>
          ) : null}

          <h2
            className={`text-xl font-extrabold text-foreground sm:text-2xl ${
              hasInventorySelection ? "mt-5" : ""
            }`}
          >
            {hasCompleteCheckoutProfile
              ? "Your details"
              : isLoggedIn
                ? "Complete your details"
                : "Enter your details"}
          </h2>

          {isLoggedIn && hasCompleteCheckoutProfile ? (
            <LoggedInGuestSummary
              profile={loggedInProfile}
              email={email}
              mobile={fullMobile}
              country={country}
            />
          ) : (
            <>
              <div className="mt-4 flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-bold text-stone-600">
                  i
                </span>
                <p className="text-sm text-muted">
                  {isLoggedIn ? (
                    <>
                      Signed in with Google — your{" "}
                      <span className="font-bold text-foreground">name</span> and{" "}
                      <span className="font-bold text-foreground">email</span> are already saved.
                      Add your <span className="font-bold text-brand">mobile</span> and{" "}
                      <span className="font-bold text-brand">country</span> below to complete booking.
                    </>
                  ) : (
                    <>
                      Almost done! Just fill in the <span className="font-bold text-brand">*</span>{" "}
                      required info
                    </>
                  )}
                </p>
              </div>

              {showFormHint ? (
                <div
                  role="status"
                  className="animate-drop-from-top mt-4 overflow-hidden rounded-xl border border-brand/25 bg-gradient-to-r from-brand-muted to-orange-50 px-4 py-3.5 shadow-sm shadow-brand/10"
                >
                  <p className="text-sm font-semibold leading-relaxed text-brand-dark">
                    {isLoggedIn
                      ? "Please add your mobile number and country to complete your booking."
                      : "Please fill all the required details to complete your booking."}
                  </p>
                </div>
              ) : null}

              {isLoggedIn ? (
                <GooglePrefilledDetails
                  firstName={firstName}
                  lastName={lastName}
                  email={email}
                />
              ) : (
                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <Field
                      label="First name"
                      id="firstName"
                      required
                      value={firstName}
                      onChange={setFirstName}
                    />
                    <Field
                      label="Last name"
                      id="lastName"
                      required
                      value={lastName}
                      onChange={setLastName}
                    />
                  </div>

                  <div className="mt-4">
                    <Field
                      label="Email address"
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={setEmail}
                      hint="Confirmation email will be sent to this address"
                    />
                  </div>
                </>
              )}

              <div className="mt-4">
                <label htmlFor="country" className="block text-sm font-bold text-foreground">
                  Country/region <span className="text-brand">*</span>
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => {
                    const nextCountry = e.target.value;
                    setCountry(nextCountry);
                    setPhoneCountryIso(phoneIsoForCountryName(nextCountry));
                  }}
                  className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                >
                  {["India", "United States", "United Kingdom", "UAE", "Singapore", "Australia"].map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="mt-4">
                <PhoneNumberField
                  id="mobile"
                  required
                  hint="Needed by the property to validate your booking"
                  country={phoneCountryIso}
                  onCountryChange={setPhoneCountryIso}
                  value={phone}
                  onChange={setPhone}
                />
              </div>
            </>
          )}

          {bookError ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {bookError}
            </p>
          ) : null}

          <BookingActionButtons loading={loading} onBook={handleBook} className="mt-8 hidden lg:grid" />
          <p className="mt-3 hidden text-center text-xs text-muted lg:block">
            Free cancellation up to 48 hours before check-in · Best price guarantee
          </p>
        </div>
      </div>

      <BookingActionButtons
        loading={loading}
        onBook={handleBook}
        fixed
        total={total}
      />

      {/* Right — booking details & price summary */}
      <aside className="space-y-4 lg:sticky lg:top-24">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-extrabold text-foreground">Your booking details</h3>
          <div className="mt-4 grid grid-cols-2 gap-4 border-b border-stone-100 pb-4">
            <div>
              <p className="text-xs font-bold text-muted">Check-in</p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {formatBookingDate(checkIn)}
              </p>
              <p className="mt-0.5 text-xs text-muted">From 14:00</p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted">Check-out</p>
              <p className="mt-1 text-sm font-bold text-foreground">
                {formatBookingDate(checkOut)}
              </p>
              <p className="mt-0.5 text-xs text-muted">Until 12:00</p>
            </div>
          </div>
          {daysAway !== null && daysAway <= 7 && (
            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-brand-dark">
              <span className="text-base">⚠</span>
              {daysAway === 0
                ? "Checking in today!"
                : daysAway === 1
                  ? "Just 1 day away!"
                  : `Just ${daysAway} days away!`}
            </p>
          )}
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Total length of stay</dt>
              <dd className="font-bold">
                {nights} night{nights !== 1 ? "s" : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted">Guests & rooms</dt>
              <dd className="text-right font-bold">{guestLabel}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h3 className="text-base font-extrabold text-foreground">Price summary</h3>

          {hasInventorySelection ? (
            <div className="mt-3">
              <BookingPriceBreakdown
                lineItems={lineItems}
                subtotal={subtotal}
                gst={gst}
                total={total}
                nights={nights}
                summaryOnly
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              <PriceRow
                label={`${formatPrice(nightly)} × ${nights} nights`}
                value={formatPrice(subtotal)}
              />
              <PriceRow
                label={formatGstSummaryLabel({ subtotal, gst, nights })}
                value={formatPrice(gst)}
              />
            </ul>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-stone-200 pt-3">
            <span className="font-extrabold text-foreground">Total</span>
            <span className="text-xl font-extrabold text-brand">
              {formatPrice(total)}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted">Includes GST as applicable · INR</p>
        </div>
      </aside>
    </div>
    </>
  );
}

export default function BookingCheckoutForm(props) {
  return (
    <Suspense
      fallback={
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="h-[640px] animate-pulse rounded-xl bg-stone-200" />
          <div className="h-[520px] animate-pulse rounded-xl bg-stone-200" />
        </div>
      }
    >
      <BookingCheckoutFormClient {...props} />
    </Suspense>
  );
}

function GooglePrefilledDetails({ firstName, lastName, email }) {
  const displayName = `${firstName} ${lastName}`.trim() || "Guest";

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
      <div className="flex items-center gap-3 border-b border-stone-200 bg-white px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-base shadow-sm ring-1 ring-stone-200">
          G
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">From Google</p>
          <p className="truncate text-sm font-extrabold text-foreground">{displayName}</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
          Verified
        </span>
      </div>
      <dl className="grid gap-3 px-4 py-4 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">First name</dt>
          <dd className="mt-0.5 text-sm font-semibold text-foreground">{firstName || "—"}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Last name</dt>
          <dd className="mt-0.5 text-sm font-semibold text-foreground">{lastName || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Email</dt>
          <dd className="mt-0.5 break-all text-sm font-semibold text-foreground">{email || "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

function LoggedInGuestSummary({ profile, email, mobile, country }) {
  const displayName = profile?.fullName || "Guest";

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-muted/80 to-orange-50/60">
      <div className="flex items-center gap-3 border-b border-brand/10 bg-white/60 px-4 py-3 sm:px-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-orange-500 text-lg font-extrabold text-white shadow-md">
          {displayName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-base font-extrabold text-foreground">{displayName}</p>
          <p className="text-xs font-semibold text-brand-dark">Signed in · details auto-filled</p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase text-white">
          ✓
        </span>
      </div>
      <dl className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-5">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Email</dt>
          <dd className="mt-0.5 break-all text-sm font-semibold text-foreground">{email}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Mobile</dt>
          <dd className="mt-0.5 text-sm font-semibold text-foreground">{mobile}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Country</dt>
          <dd className="mt-0.5 text-sm font-semibold text-foreground">{country}</dd>
        </div>
      </dl>
      <p className="border-t border-brand/10 px-4 py-3 text-xs text-muted sm:px-5">
        Booking will be placed under your account. Confirmation will be sent to your email and
        WhatsApp.
      </p>
    </div>
  );
}

function Field({ label, id, value, onChange, placeholder, type = "text", required, hint }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-foreground">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-lg border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}

function PriceRow({ label, value, accent }) {
  return (
    <li className={`flex justify-between gap-2 ${accent ? "text-brand-dark" : ""}`}>
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </li>
  );
}
function StarRating({ rating }) {
  const full = Math.min(5, Math.round(rating));
  return (
    <span className="flex gap-0.5 text-brand" aria-label={`${rating} stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-sm">
          {i < full ? "★" : "☆"}
        </span>
      ))}
    </span>
  );
}

const ROOM_CARD_ACCENTS = [
  "from-brand via-orange-500 to-orange-400",
  "from-orange-600 via-brand to-orange-500",
  "from-brand-dark via-orange-500 to-orange-400",
  "from-orange-500 via-brand to-orange-600",
  "from-orange-700 via-brand-dark to-orange-500",
];

function getMealPlanStyle(label = "") {
  const lower = label.toLowerCase();
  if (lower.includes("lunch") || lower.includes("dinner") || lower.includes("full")) {
    return {
      pill: "bg-orange-50 text-orange-900 ring-1 ring-orange-200",
      inclusion: "text-brand-dark",
      icon: "🍽️",
    };
  }
  if (lower.includes("breakfast")) {
    return {
      pill: "bg-brand-muted text-brand-dark ring-1 ring-brand/20",
      inclusion: "text-brand-dark",
      icon: "🌅",
    };
  }
  return {
    pill: "bg-orange-50/80 text-orange-800 ring-1 ring-orange-100",
    inclusion: "text-orange-700",
    icon: "🛏️",
  };
}

function SelectedRoomCard({ item, index }) {
  const meal = getMealPlanStyle(item.mealPlanLabel);
  const accent = ROOM_CARD_ACCENTS[index % ROOM_CARD_ACCENTS.length];

  return (
    <li className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-md shadow-stone-200/60">
      <div className={`bg-gradient-to-r ${accent} px-4 py-3`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-base font-extrabold text-white">{item.roomName}</p>
            <p className="mt-0.5 text-xs font-medium text-white/80">{item.categoryLabel}</p>
          </div>
          {item.isComboPart ? (
            <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              Combo
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meal.pill}`}>
            <span aria-hidden>{meal.icon}</span>
            {item.mealPlanLabel}
          </span>
        </div>

        {item.inclusion ? (
          <p className={`flex items-center gap-1.5 text-xs font-semibold ${meal.inclusion}`}>
            <span className="text-sm" aria-hidden>
              ✓
            </span>
            {item.inclusion}
          </p>
        ) : null}

        {item.occupancyLabel ? (
          <p className="inline-flex items-center gap-1.5 rounded-lg bg-brand-muted px-2.5 py-1.5 text-[11px] font-bold text-brand-dark">
            <span aria-hidden>👥</span>
            {item.occupancyLabel}
          </p>
        ) : null}

        <div className="rounded-xl bg-gradient-to-br from-stone-50 to-orange-50/60 p-3 ring-1 ring-stone-100">
          <p className="flex justify-between gap-2 text-xs text-muted">
            <span>Base rate</span>
            <span className="font-bold text-foreground">
              {formatPrice(item.baseSubtotal ?? item.subtotal)}
            </span>
          </p>
          {(item.extraAdultSubtotal ?? 0) > 0 ? (
            <p className="mt-1 flex justify-between gap-2 text-xs text-brand">
              <span>Extra adult</span>
              <span className="font-bold">{formatPrice(item.extraAdultSubtotal)}</span>
            </p>
          ) : null}
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-stone-200/80 pt-2">
            <span className="text-xs font-semibold text-muted">
              {item.roomCount} room{item.roomCount !== 1 ? "s" : ""} · {item.nights} night
              {item.nights !== 1 ? "s" : ""}
            </span>
            <span className="rounded-lg bg-gradient-to-r from-brand to-orange-500 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">
              {formatPrice(item.total)} incl. GST
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

function BookingActionButtons({ loading, onBook, className = "", fixed = false, total }) {
  const buttons = (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => onBook("pay_now")}
        className="rounded-xl bg-gradient-to-r from-brand to-orange-500 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/30 transition hover:from-brand-dark hover:to-orange-600 disabled:opacity-70 lg:py-4"
      >
        {loading ? "Processing…" : "Pay now"}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => onBook("pay_at_property")}
        className="rounded-xl border-2 border-brand bg-white py-3.5 text-sm font-extrabold text-brand transition hover:bg-brand-muted disabled:opacity-70 lg:py-4"
      >
        {loading ? "Booking…" : fixed ? "Pay at property" : "Book now — pay at property"}
      </button>
    </>
  );

  if (fixed) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 px-4 pt-3 shadow-[0_-8px_30px_rgba(28,25,23,0.12)] backdrop-blur-xl lg:hidden pb-[max(0.75rem,var(--safe-bottom))]">
        {total != null ? (
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted">Total payable</span>
            <span className="text-lg font-extrabold text-brand">{formatPrice(total)}</span>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">{buttons}</div>
        <p className="mt-2 text-center text-[10px] leading-snug text-muted">
          Free cancellation up to 48h before check-in
        </p>
      </div>
    );
  }

  return <div className={`grid gap-3 sm:grid-cols-2 ${className}`}>{buttons}</div>;
}

