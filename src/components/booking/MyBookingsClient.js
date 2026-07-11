"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/listings";
import { buildPropertyUrl } from "@/lib/bookingSearch";
import { formatBookingDate } from "@/lib/dates";
import { useGuestAuth } from "@/hooks/useGuestAuth";
import {
  cancelInventoryBooking,
  canCustomerCancelBooking,
  getGuestProfileFromSession,
  getMyBookings,
  isBookingCancellationRequested,
} from "@/lib/inventoryBookingApi";
import { cancelHotelBookingByWebsiteId } from "@/lib/hotelBookingApi";
import {
  mergeBookingForEmail,
  sendBookingConfirmationEmail,
} from "@/lib/bookingEmail";
import { sendPaymentConfirmWhatsApp } from "@/lib/whatsappApi";
import {
  canPayBookingOnline,
  getBookingAmountDue,
  payInventoryBookingOnline,
} from "@/lib/razorpayDemandApi";

function parseApiDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatStatusLabel(value) {
  const label = String(value || "pending").replace(/_/g, " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getPaymentBadgeClass(payment) {
  const status = String(payment || "pending").toLowerCase();
  if (status === "completed") return "bg-emerald-100 text-emerald-800";
  if (status === "partially_paid") return "bg-amber-100 text-amber-900";
  if (status === "rejected") return "bg-red-100 text-red-800";
  return "bg-white text-brand-dark";
}

function getRoomSummary(rooms = []) {
  if (!rooms.length) return "Standard booking";
  if (rooms.length === 1) {
    const room = rooms[0];
    return `${room.roomName} · ${room.mealPlanLabel || room.mealPlan}`;
  }
  return `${rooms.length} room types · ${rooms.reduce((sum, r) => sum + (r.roomCount || 0), 0)} rooms`;
}

function getGuestsLabel(guests) {
  if (!guests) return "—";
  const adults = guests.adults ?? 0;
  const children = guests.children ?? 0;
  const rooms = guests.rooms ?? 1;
  const childPart = children > 0 ? `, ${children} child${children !== 1 ? "ren" : ""}` : "";
  return `${adults} adult${adults !== 1 ? "s" : ""}${childPart} · ${rooms} room${rooms !== 1 ? "s" : ""}`;
}

function formatCustomerResponseLabel(status) {
  const value = String(status || "").toLowerCase();
  if (value === "cancel") return "Cancelled";
  if (value === "accepted") return "Accepted";
  return formatStatusLabel(status);
}

function getCustomerResponseBadgeClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "cancel") return "bg-red-100 text-red-800";
  if (value === "accepted") return "bg-emerald-100 text-emerald-800";
  return "bg-stone-100 text-stone-700";
}

function BookingCard({ booking, onPayNow, paying, payError, onCancelRequest }) {
  const checkInDate = parseApiDate(booking.stay?.checkIn);
  const checkOutDate = parseApiDate(booking.stay?.checkOut);
  const property = booking.property || {};
  const total = booking.pricing?.payableTotal ?? booking.pricing?.total ?? 0;
  const amountPaid = Number(booking.amountPaid) || 0;
  const amountDue = getBookingAmountDue(booking);
  const cancellationRequested = isBookingCancellationRequested(booking);
  const showPayNow =
    canPayBookingOnline(booking) && amountDue > 0 && !cancellationRequested;
  const showCancel = canCustomerCancelBooking(booking);
  const customerResponse = booking.customerResponse || {};
  const bookingRef = String(booking._id || "").slice(-8).toUpperCase();
  const isPartial = String(booking.payment || "").toLowerCase() === "partially_paid";

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="bg-gradient-to-r from-brand via-orange-500 to-orange-400 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">
            Booking #{bookingRef}
          </p>
          <div className="flex flex-wrap gap-2">
          <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase "
            >
           Check in : 
            </span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur-sm">
               {formatStatusLabel(booking.tourCompleted)}
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase "
            >
            Payment status : 
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${getPaymentBadgeClass(booking.payment)}`}
            >
             {formatStatusLabel(booking.payment)}
            </span>
            {customerResponse.status ? (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${getCustomerResponseBadgeClass(customerResponse.status)}`}
              >
                {formatCustomerResponseLabel(customerResponse.status)}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-extrabold leading-snug text-foreground sm:text-xl">
            {property.title || "Hotel stay"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {property.location}
            {property.region ? ` · ${property.region}` : ""}
          </p>
          {property.slug ? (
            <Link
              href={buildPropertyUrl({
                slug: property.slug,
                title: property.title,
                category: property.category || "hotel",
                region: property.region,
                location: property.location,
              })}
              className="mt-2 inline-block text-xs font-bold text-brand hover:underline"
            >
              View property →
            </Link>
          ) : null}
        </div>

        <div className="mt-5 grid grid-cols-3 overflow-hidden rounded-xl border border-stone-200 bg-gradient-to-r from-stone-50 via-brand-muted/30 to-orange-50/50">
          <div className="border-r border-stone-200/80  text-center sm:px-5 sm:py-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted sm:text-xs">
              Total
            </p>
            <p className="mt-1 text-xl font-extrabold text-foreground sm:text-2xl">
              {formatPrice(total)}
            </p>
          </div>
          <div className="border-r border-stone-200/80 px-3 py-4 text-center sm:px-5 sm:py-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted sm:text-xs">
              Amount paid
            </p>
            <p className="mt-1 text-xl font-extrabold text-emerald-600 sm:text-2xl">
              {formatPrice(amountPaid)}
            </p>
          </div>
          <div className="px-3 py-4 text-center sm:px-5 sm:py-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted sm:text-xs">
              Due
            </p>
            <p className="mt-1 text-xl font-extrabold text-brand sm:text-2xl">
              {formatPrice(amountDue)}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
           <div className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Check-in</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">
              {checkInDate ? formatBookingDate(checkInDate) : booking.stay?.checkIn}
            </p>
          </div>
          <div className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Check-out</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">
              {checkOutDate ? formatBookingDate(checkOutDate) : booking.stay?.checkOut}
            </p>
          </div>
          <div className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Guests</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">
              {getGuestsLabel(booking.guests)}
            </p>
          </div>
          <div className="rounded-xl border border-stone-100 bg-stone-50 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Nights</p>
            <p className="mt-0.5 text-sm font-bold text-foreground">
              {booking.stay?.nights ?? "—"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-brand/15 bg-brand-muted/40 px-3 py-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-dark">Rooms</p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {getRoomSummary(booking.rooms)}
          </p>
          {booking.rooms?.length ? (
            <ul className="mt-2 space-y-1.5">
              {booking.rooms.map((room, index) => (
                <li
                  key={`${room.roomId}-${room.mealPlan}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted"
                >
                  <span>
                    {room.roomName} × {room.roomCount}
                    {room.isComboPart ? " (combo)" : ""}
                  </span>
                  <span className="font-bold text-foreground">
                    {formatPrice(room.pricing?.total ?? room.total)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {showPayNow ? (
          <div className="mt-4 rounded-xl border border-brand/25 bg-gradient-to-r from-brand-muted/80 to-orange-50/70 px-4 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">
                  {isPartial ? "Balance due" : "Payment required"}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Pay online now to confirm your booking
                </p>
                <p className="mt-1 text-lg font-extrabold text-brand">
                  {formatPrice(amountDue)}
                </p>
              </div>
              <button
                type="button"
                disabled={paying}
                onClick={() => onPayNow(booking)}
                className="shrink-0 rounded-xl bg-gradient-to-r from-brand to-orange-500 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand/25 transition hover:from-brand-dark hover:to-orange-600 disabled:opacity-70"
              >
                {paying ? "Opening payment…" : "Pay now"}
              </button>
            </div>
            {payError ? (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                {payError}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
          <div className="text-xs text-muted">
            <span>
              Booked on{" "}
              {booking.createdAt
                ? new Date(booking.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
            <span className="mx-2">·</span>
            <span className="font-semibold text-foreground">
              {booking.bookingType === "inventory" ? "Inventory booking" : "Standard booking"}
            </span>
          </div>
          {showCancel ? (
            <button
              type="button"
              onClick={() => onCancelRequest(booking)}
              className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700 transition hover:border-red-300 hover:bg-red-50"
            >
              Cancel booking
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function CancelBookingDialog({
  booking,
  note,
  onNoteChange,
  onClose,
  onConfirm,
  loading,
  error,
}) {
  if (!booking) return null;

  const propertyTitle = booking.property?.title || "this booking";
  const bookingRef = String(booking._id || "").slice(-8).toUpperCase();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-booking-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
        <h2 id="cancel-booking-title" className="text-lg font-extrabold text-foreground">
          Cancel booking?
        </h2>
        <p className="mt-2 text-sm text-muted">
          You are about to request cancellation for{" "}
          <span className="font-semibold text-foreground">{propertyTitle}</span> (#
          {bookingRef}).
        </p>
        <label className="mt-4 block">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">
            Reason (optional)
          </span>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={3}
            placeholder="Tell us why you want to cancel..."
            className="mt-2 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm text-foreground outline-none ring-brand/30 focus:border-brand focus:ring-2"
          />
        </label>
        {error ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-bold text-foreground hover:bg-stone-50 disabled:opacity-70"
          >
            Keep booking
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-70"
          >
            {loading ? "Submitting…" : "Confirm cancellation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyBookingsClient() {
  const router = useRouter();
  const { session, isLoggedIn, ready } = useGuestAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payingId, setPayingId] = useState(null);
  const [payErrorById, setPayErrorById] = useState({});
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelNote, setCancelNote] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const profile = getGuestProfileFromSession(session);
  const guestName = profile?.fullName || "Guest";
  const mobile = profile?.mobile || session?.mobile || "";
  const guestToken = session?.token || "";

  const loadBookings = useCallback(async () => {
    const response = await getMyBookings();
    setBookings(Array.isArray(response?.data) ? response.data : []);
  }, []);

  useEffect(() => {
    if (ready && (!isLoggedIn || !guestToken)) {
      router.replace("/signin");
    }
  }, [ready, isLoggedIn, guestToken, router]);

  useEffect(() => {
    if (!ready || !isLoggedIn || !guestToken) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        await loadBookings();
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Could not load your bookings.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, isLoggedIn, guestToken, loadBookings]);

  const handlePayNow = async (booking) => {
    const bookingId = booking._id;
    setPayingId(bookingId);
    setPayErrorById((prev) => ({ ...prev, [bookingId]: "" }));

    try {
      const verifyResult = await payInventoryBookingOnline(booking);
      const updatedBooking = verifyResult?.booking ?? booking;
      const emailPayload = mergeBookingForEmail(booking, updatedBooking, {
        paymentMethod: "pay_now",
        razorpayPaymentId: verifyResult?.payment?.paymentId,
        razorpayOrderId: verifyResult?.payment?.orderId,
      });

      try {
        await sendBookingConfirmationEmail(emailPayload);
      } catch (emailError) {
        console.warn("[My Bookings] Payment confirmation email failed:", emailError);
      }

      try {
        await sendPaymentConfirmWhatsApp({ mobile });
      } catch (whatsappError) {
        console.warn("[My Bookings] WhatsApp payment_confirm template failed:", whatsappError);
      }

      await loadBookings();
    } catch (err) {
      const message = err?.message || "Payment failed. Please try again.";
      setPayErrorById((prev) => ({
        ...prev,
        [bookingId]:
          message === "Payment cancelled"
            ? "Payment was cancelled. You can try again anytime."
            : message,
      }));
    } finally {
      setPayingId(null);
    }
  };

  const handleCancelRequest = (booking) => {
    setCancelTarget(booking);
    setCancelNote("");
    setCancelError("");
  };

  const handleCloseCancelDialog = () => {
    if (cancelling) return;
    setCancelTarget(null);
    setCancelNote("");
    setCancelError("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget?._id) return;

    setCancelling(true);
    setCancelError("");

    try {
      await cancelInventoryBooking(cancelTarget._id, cancelNote);
      if (cancelTarget.websiteid) {
        try {
          await cancelHotelBookingByWebsiteId(cancelTarget.websiteid, cancelNote);
        } catch (hotelBookingError) {
          console.warn("[MyBookings] Hotel booking cancel update failed:", hotelBookingError);
        }
      }
      setCancelTarget(null);
      setCancelNote("");
      await loadBookings();
    } catch (err) {
      setCancelError(err?.message || "Could not cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (!ready || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-100">
        <div className="mx-auto max-w-4xl space-y-4 px-4 py-16 sm:px-6">
          <div className="h-24 animate-pulse rounded-2xl bg-stone-200" />
          <div className="h-48 animate-pulse rounded-2xl bg-stone-200" />
          <div className="h-48 animate-pulse rounded-2xl bg-stone-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            My Bookings
          </h1>
          <p className="mt-2 text-sm text-muted">
            Welcome back, <span className="font-semibold text-foreground">{guestName}</span>.
            {mobile ? (
              <>
                {" "}
                Showing bookings for{" "}
                <span className="font-semibold text-foreground">+91 {mobile}</span>
              </>
            ) : null}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-stone-200" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center shadow-sm">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-muted text-2xl">
              🛏️
            </span>
            <h2 className="mt-4 text-lg font-extrabold text-foreground">No bookings yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              When you complete a stay booking, it will appear here.
            </p>
            <Link
              href="/listings"
              className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-brand to-orange-500 px-6 py-3 text-sm font-extrabold text-white shadow-md"
            >
              Explore stays
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-muted">
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
            </p>
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onPayNow={handlePayNow}
                paying={payingId === booking._id}
                payError={payErrorById[booking._id]}
                onCancelRequest={handleCancelRequest}
              />
            ))}
          </div>
        )}

        <CancelBookingDialog
          booking={cancelTarget}
          note={cancelNote}
          onNoteChange={setCancelNote}
          onClose={handleCloseCancelDialog}
          onConfirm={handleConfirmCancel}
          loading={cancelling}
          error={cancelError}
        />

        <p className="mt-8 text-center text-xs text-muted">
          Need help?{" "}
          <a href="tel:+918353056000" className="font-semibold text-brand hover:underline">
            Call +91 8353056000
          </a>
        </p>
      </div>
    </div>
  );
}
