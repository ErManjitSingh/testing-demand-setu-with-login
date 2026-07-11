import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { formatGstSummaryLabel } from "@/lib/bookingPricing";

function formatInr(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateLabel(value) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function paymentLabel(method) {
  if (method === "pay_at_property") return "Pay at property";
  if (method === "pay_now") return "Pay now (online)";
  return method || "—";
}

function paymentStatusLabel(status) {
  return String(status || "pending")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function mergeBookingForEmail(basePayload, serverBooking, extras = {}) {
  const pricing = serverBooking?.pricing || basePayload?.pricing || {};
  const total = Number(pricing.payableTotal ?? pricing.total ?? 0);
  const amountPaid =
    serverBooking?.amountPaid !== undefined && serverBooking?.amountPaid !== null
      ? Number(serverBooking.amountPaid)
      : extras.paymentMethod === "pay_at_property"
        ? 0
        : 0;

  const paymentStatus = serverBooking?.payment || "pending";
  const amountDue = Math.max(0, total - amountPaid);

  const paymentHistory = Array.isArray(serverBooking?.paymentHistory)
    ? serverBooking.paymentHistory
    : [];
  const lastPayment = paymentHistory.length ? paymentHistory[paymentHistory.length - 1] : null;

  const baseGuest = basePayload?.guest || {};
  const serverGuest = serverBooking?.guest || {};
  const guestPassword =
    extras.guestPassword ||
    baseGuest.password ||
    serverGuest.password ||
    "";

  return {
    property: serverBooking?.property || basePayload?.property,
    stay: serverBooking?.stay || basePayload?.stay,
    guests: serverBooking?.guests || basePayload?.guests,
    rooms: serverBooking?.rooms || basePayload?.rooms,
    guest: {
      ...baseGuest,
      ...serverGuest,
      password: guestPassword,
    },
    pricing,
    totalRooms: serverBooking?.totalRooms ?? basePayload?.totalRooms,
    bookingType: serverBooking?.bookingType || basePayload?.bookingType,
    paymentMethod: extras.paymentMethod || basePayload?.paymentMethod,
    paymentStatus,
    amountPaid,
    amountDue,
    bookingId: serverBooking?._id || extras.bookingId || null,
    razorpayPaymentId: extras.razorpayPaymentId || lastPayment?.paymentId || "",
    razorpayOrderId: extras.razorpayOrderId || lastPayment?.orderId || "",
  };
}

function buildPaymentSummaryHtml(booking) {
  const total = booking.pricing?.payableTotal ?? booking.pricing?.total ?? 0;
  const amountPaid = Number(booking.amountPaid) || 0;
  const amountDue = Number(booking.amountDue) ?? Math.max(0, total - amountPaid);

  return `
          <tr>
            <td style="padding:18px 32px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-radius:16px;border:1px solid #ffedd5;overflow:hidden;">
                <tr>
                  <td width="33.33%" style="padding:18px 12px;text-align:center;background:#fafaf9;border-right:1px solid #e7e5e4;">
                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;color:#78716c;">Total</p>
                    <p style="margin:8px 0 0;font-size:22px;font-weight:800;color:#1c1917;">${formatInr(total)}</p>
                  </td>
                  <td width="33.33%" style="padding:18px 12px;text-align:center;background:#ecfdf5;border-right:1px solid #e7e5e4;">
                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;color:#78716c;">Amount paid</p>
                    <p style="margin:8px 0 0;font-size:22px;font-weight:800;color:#059669;">${formatInr(amountPaid)}</p>
                  </td>
                  <td width="33.33%" style="padding:18px 12px;text-align:center;background:#fff7ed;">
                    <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;color:#78716c;">Balance due</p>
                    <p style="margin:8px 0 0;font-size:22px;font-weight:800;color:#ea580c;">${formatInr(amountDue)}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;background:#fafaf9;border-radius:14px;border:1px solid #e7e5e4;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;color:#78716c;">Payment details</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Method:</strong> ${escapeHtml(paymentLabel(booking.paymentMethod))}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Status:</strong> ${escapeHtml(paymentStatusLabel(booking.paymentStatus))}</p>
                    ${
                      booking.razorpayPaymentId
                        ? `<p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Transaction ID:</strong> ${escapeHtml(booking.razorpayPaymentId)}</p>`
                        : ""
                    }
                    ${
                      booking.bookingId
                        ? `<p style="margin:0;font-size:14px;color:#44403c;"><strong>Booking ID:</strong> ${escapeHtml(String(booking.bookingId))}</p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildMyBookingsLoginHtml(guest = {}) {
  const password = String(guest.password || "").trim();
  if (!password) return "";

  return `
          <tr>
            <td style="padding:18px 32px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:14px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;color:#047857;">My Bookings sign-in</p>
                    <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#065f46;">
                      Use these details to sign in and view your bookings anytime on Demand Setu.
                    </p>
                    <p style="margin:0 0 6px;font-size:14px;color:#064e3b;"><strong>Mobile:</strong> ${escapeHtml(guest.mobile)}</p>
                    <p style="margin:0;font-size:14px;color:#064e3b;"><strong>Password:</strong> ${escapeHtml(password)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function buildMyBookingsLoginText(guest = {}) {
  const password = String(guest.password || "").trim();
  if (!password) return "";

  return `
My Bookings sign-in
Mobile: ${guest.mobile || ""}
Password: ${password}

`;
}

function buildRoomsHtml(rooms = []) {
  if (!rooms.length) {
    return `<p style="margin:0;color:#78716c;font-size:14px;">Standard room booking</p>`;
  }

  return rooms
    .map(
      (room) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #f5f5f4;">
          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1c1917;">${escapeHtml(room.roomName)}</p>
          <p style="margin:0 0 6px;font-size:12px;color:#78716c;">${escapeHtml(room.categoryLabel)} · ${escapeHtml(room.mealPlanLabel || room.mealPlan)}</p>
          <p style="margin:0;font-size:12px;color:#57534e;">
            ${room.roomCount} room${room.roomCount !== 1 ? "s" : ""} · ${room.nights} night${room.nights !== 1 ? "s" : ""}
            ${room.occupancyLabel ? ` · ${escapeHtml(room.occupancyLabel)}` : ""}
          </p>
        </td>
        <td align="right" style="padding:14px 0;border-bottom:1px solid #f5f5f4;vertical-align:top;">
          <p style="margin:0;font-size:15px;font-weight:700;color:#ea580c;">${formatInr(room.pricing?.total ?? room.total)}</p>
        </td>
      </tr>`
    )
    .join("");
}

export function buildBookingConfirmationEmailHtml(booking) {
  const { property, stay, guests, guest, pricing, rooms = [], paymentMethod } = booking;
  const guestName = guest?.fullName || `${guest?.firstName || ""} ${guest?.lastName || ""}`.trim() || "Guest";
  const paymentSummaryHtml = buildPaymentSummaryHtml({
    ...booking,
    paymentMethod: booking.paymentMethod || paymentMethod,
    amountPaid: booking.amountPaid ?? 0,
    paymentStatus: booking.paymentStatus || "pending",
  });
  const myBookingsLoginHtml = buildMyBookingsLoginHtml(guest);
  const guestPassword = String(guest?.password || "").trim();
  const gstLabel = formatGstSummaryLabel({
    subtotal: pricing?.subtotal,
    gst: pricing?.gst,
    nights: stay?.nights,
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f8f6f3;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f6f3;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e7e5e4;box-shadow:0 12px 40px rgba(28,25,23,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#9a3412 0%,#ea580c 55%,#f97316 100%);padding:28px 32px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.82);">Demand Setu Tours</p>
              <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:800;color:#ffffff;">Your booking is confirmed</h1>
              <p style="margin:10px 0 0;font-size:15px;line-height:1.5;color:rgba(255,255,255,0.92);">
                Thank you, ${escapeHtml(guestName)}. We&apos;re excited to host you.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 8px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;border:1px solid #ffedd5;border-radius:16px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#c2410c;">Property</p>
                    <h2 style="margin:0 0 6px;font-size:22px;font-weight:800;color:#1c1917;">${escapeHtml(property?.title)}</h2>
                    <p style="margin:0;font-size:14px;color:#57534e;">${escapeHtml(property?.location)}${property?.region ? `, ${escapeHtml(property.region)}` : ""}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:8px 32px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="50%" style="padding:10px 8px 10px 0;vertical-align:top;">
                    <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:14px;padding:16px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;color:#78716c;">Check-in</p>
                      <p style="margin:0;font-size:15px;font-weight:700;color:#1c1917;">${formatDateLabel(stay?.checkIn)}</p>
                      <p style="margin:6px 0 0;font-size:12px;color:#78716c;">From 14:00</p>
                    </div>
                  </td>
                  <td width="50%" style="padding:10px 0 10px 8px;vertical-align:top;">
                    <div style="background:#fafaf9;border:1px solid #e7e5e4;border-radius:14px;padding:16px;">
                      <p style="margin:0 0 6px;font-size:11px;font-weight:700;text-transform:uppercase;color:#78716c;">Check-out</p>
                      <p style="margin:0;font-size:15px;font-weight:700;color:#1c1917;">${formatDateLabel(stay?.checkOut)}</p>
                      <p style="margin:6px 0 0;font-size:12px;color:#78716c;">Until 12:00</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafaf9;border-radius:14px;border:1px solid #e7e5e4;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;color:#78716c;">Stay summary</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#57534e;">Nights</td>
                        <td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:#1c1917;">${stay?.nights || "—"}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#57534e;">Adults</td>
                        <td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:#1c1917;">${guests?.adults ?? "—"}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#57534e;">Children</td>
                        <td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:#1c1917;">${guests?.children ?? 0}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#57534e;">Rooms</td>
                        <td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:#1c1917;">${booking.totalRooms ?? guests?.rooms ?? "—"}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#57534e;">Payment</td>
                        <td align="right" style="padding:6px 0;font-size:14px;font-weight:700;color:#1c1917;">${escapeHtml(paymentLabel(paymentMethod))}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 32px 0;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;color:#78716c;">Selected rooms</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${buildRoomsHtml(rooms)}
              </table>
            </td>
          </tr>

          ${paymentSummaryHtml}

          <tr>
            <td style="padding:22px 32px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#1c1917;border-radius:16px;">
                <tr>
                  <td style="padding:20px 22px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#d6d3d1;">Subtotal</td>
                        <td align="right" style="padding:4px 0;font-size:14px;color:#ffffff;">${formatInr(pricing?.subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#d6d3d1;">${gstLabel}</td>
                        <td align="right" style="padding:4px 0;font-size:14px;color:#ffffff;">${formatInr(pricing?.gst)}</td>
                      </tr>
                      <tr>
                        <td style="padding:14px 0 0;font-size:16px;font-weight:700;color:#ffffff;">Total payable</td>
                        <td align="right" style="padding:14px 0 0;font-size:22px;font-weight:800;color:#fb923c;">${formatInr(pricing?.payableTotal ?? pricing?.total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 32px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;border:1px solid #ffedd5;border-radius:14px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;color:#c2410c;">Guest details</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Name:</strong> ${escapeHtml(guestName)}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Email:</strong> ${escapeHtml(guest?.email)}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Mobile:</strong> ${escapeHtml(guest?.mobile)}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Country:</strong> ${escapeHtml(guest?.country)}</p>
                    ${
                      guestPassword
                        ? `<p style="margin:0;font-size:14px;color:#44403c;"><strong>Password:</strong> ${escapeHtml(guestPassword)}</p>`
                        : ""
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${myBookingsLoginHtml}

          <tr>
            <td style="padding:24px 32px 30px;">
              <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#57534e;">
                ${
                  guestPassword
                    ? "Save your mobile number and password above to sign in and view My Bookings on Demand Setu."
                    : "Use your mobile number and password to sign in and view your bookings anytime on Demand Setu."
                }
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#78716c;">
                Need help? Call us at <a href="tel:+918353056000" style="color:#ea580c;font-weight:700;text-decoration:none;">+91 8353056000</a>
                or reply to this email.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#fafaf9;padding:18px 32px;border-top:1px solid #e7e5e4;">
              <p style="margin:0;font-size:12px;color:#a8a29e;text-align:center;">
                © ${new Date().getFullYear()} Demand Setu Tours · info@demandsetutours.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildBookingConfirmationEmailText(booking) {
  const { property, stay, guests, guest, pricing, rooms = [], paymentMethod } = booking;
  const guestName = guest?.fullName || `${guest?.firstName || ""} ${guest?.lastName || ""}`.trim() || "Guest";
  const total = pricing?.payableTotal ?? pricing?.total ?? 0;
  const amountPaid = Number(booking.amountPaid) || 0;
  const amountDue = Number(booking.amountDue) ?? Math.max(0, total - amountPaid);

  const roomLines = rooms.length
    ? rooms
        .map(
          (room) =>
            `- ${room.roomName} (${room.mealPlanLabel || room.mealPlan}): ${formatInr(room.pricing?.total ?? room.total)}`
        )
        .join("\n")
    : "- Standard room booking";

  return `Booking Confirmed - ${property?.title}

Hello ${guestName},

Your stay at ${property?.title} is confirmed.

Property: ${property?.title}
Location: ${property?.location}
Check-in: ${formatDateLabel(stay?.checkIn)} (from 14:00)
Check-out: ${formatDateLabel(stay?.checkOut)} (until 12:00)
Nights: ${stay?.nights}
Guests: ${guests?.adults} adults, ${guests?.children || 0} children
Rooms: ${booking.totalRooms ?? guests?.rooms}
Payment method: ${paymentLabel(booking.paymentMethod || paymentMethod)}
Payment status: ${paymentStatusLabel(booking.paymentStatus)}

Rooms:
${roomLines}

Subtotal: ${formatInr(pricing?.subtotal)}
GST: ${formatInr(pricing?.gst)}
Total: ${formatInr(total)}
Amount paid: ${formatInr(amountPaid)}
Balance due: ${formatInr(amountDue)}
${booking.razorpayPaymentId ? `Transaction ID: ${booking.razorpayPaymentId}\n` : ""}${booking.bookingId ? `Booking ID: ${booking.bookingId}\n` : ""}

Guest: ${guestName}
Email: ${guest?.email}
Mobile: ${guest?.mobile}
${buildMyBookingsLoginText(guest)}${
    guest?.password
      ? "Save your mobile and password to sign in and view My Bookings on Demand Setu."
      : "Sign in with your mobile and password to view My Bookings on Demand Setu."
  }
Support: +91 8353056000`;
}

const ADMIN_BOOKING_NOTIFY_TO = "rahilsamyal6@gmail.com";

function buildNewBookingAdminEmailHtml(booking) {
  const { property, stay, guests, guest, pricing, rooms = [], paymentMethod } = booking;
  const guestName =
    guest?.fullName || `${guest?.firstName || ""} ${guest?.lastName || ""}`.trim() || "Guest";
  const total = pricing?.payableTotal ?? pricing?.total ?? 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New booking from Demand Setu</title>
</head>
<body style="margin:0;padding:0;background:#f8f6f3;font-family:Arial,Helvetica,sans-serif;color:#1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f6f3;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e7e5e4;">
          <tr>
            <td style="background:linear-gradient(135deg,#9a3412 0%,#ea580c 55%,#f97316 100%);padding:24px 28px;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.82);">Demand Setu</p>
              <h1 style="margin:0;font-size:24px;line-height:1.2;font-weight:800;color:#ffffff;">New booking from Demand Setu</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44403c;">A new property booking was placed on the website.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7ed;border:1px solid #ffedd5;border-radius:14px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;color:#c2410c;">Property</p>
                    <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:#1c1917;">${escapeHtml(property?.title)}</p>
                    <p style="margin:0;font-size:14px;color:#57534e;">${escapeHtml(property?.location)}${property?.region ? `, ${escapeHtml(property.region)}` : ""}</p>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:14px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;color:#78716c;">Stay</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Check-in:</strong> ${formatDateLabel(stay?.checkIn)}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Check-out:</strong> ${formatDateLabel(stay?.checkOut)}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Nights:</strong> ${stay?.nights || "—"}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Guests:</strong> ${guests?.adults ?? "—"} adults, ${guests?.children ?? 0} children</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Rooms:</strong> ${booking.totalRooms ?? guests?.rooms ?? "—"}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Payment:</strong> ${escapeHtml(paymentLabel(booking.paymentMethod || paymentMethod))}</p>
                    <p style="margin:0;font-size:14px;color:#44403c;"><strong>Total:</strong> ${formatInr(total)}</p>
                    ${booking.bookingId ? `<p style="margin:8px 0 0;font-size:14px;color:#44403c;"><strong>Booking ID:</strong> ${escapeHtml(booking.bookingId)}</p>` : ""}
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:14px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;text-transform:uppercase;color:#78716c;">Guest</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Name:</strong> ${escapeHtml(guestName)}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Email:</strong> ${escapeHtml(guest?.email)}</p>
                    <p style="margin:0 0 6px;font-size:14px;color:#44403c;"><strong>Mobile:</strong> ${escapeHtml(guest?.mobile)}</p>
                    <p style="margin:0;font-size:14px;color:#44403c;"><strong>Country:</strong> ${escapeHtml(guest?.country)}</p>
                  </td>
                </tr>
              </table>
              ${
                rooms.length
                  ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                      <tr><td style="padding:0 0 8px;font-size:13px;font-weight:700;text-transform:uppercase;color:#78716c;">Selected rooms</td></tr>
                      <tr><td><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${buildRoomsHtml(rooms)}</table></td></tr>
                    </table>`
                  : ""
              }
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildNewBookingAdminEmailText(booking) {
  const { property, stay, guests, guest, pricing, rooms = [], paymentMethod } = booking;
  const guestName =
    guest?.fullName || `${guest?.firstName || ""} ${guest?.lastName || ""}`.trim() || "Guest";
  const total = pricing?.payableTotal ?? pricing?.total ?? 0;

  const roomLines = rooms.length
    ? rooms
        .map(
          (room) =>
            `- ${room.roomName} (${room.mealPlanLabel || room.mealPlan}): ${formatInr(room.pricing?.total ?? room.total)}`
        )
        .join("\n")
    : "";

  return `New booking from Demand Setu

Property: ${property?.title}
Location: ${property?.location}
Check-in: ${formatDateLabel(stay?.checkIn)}
Check-out: ${formatDateLabel(stay?.checkOut)}
Nights: ${stay?.nights}
Guests: ${guests?.adults} adults, ${guests?.children || 0} children
Rooms: ${booking.totalRooms ?? guests?.rooms}
Payment: ${paymentLabel(booking.paymentMethod || paymentMethod)}
Total: ${formatInr(total)}
${booking.bookingId ? `Booking ID: ${booking.bookingId}\n` : ""}
Guest: ${guestName}
Email: ${guest?.email}
Mobile: ${guest?.mobile}
Country: ${guest?.country}
${roomLines ? `\nRooms:\n${roomLines}` : ""}`;
}

export async function sendNewBookingAdminEmail(booking) {
  const subject = "New booking from Demand Setu";
  const html = buildNewBookingAdminEmailHtml(booking);
  const text = buildNewBookingAdminEmailText(booking);

  const response = await fetchWithTimeout(buildApiUrl("api/webmail/send-demand"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: ADMIN_BOOKING_NOTIFY_TO,
      subject,
      html,
      text,
      replyTo: booking?.guest?.email || "info@demandsetutours.com",
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Admin booking email failed (${response.status})`;
    throw new Error(message);
  }

  return { ok: true, data: payload };
}

export async function sendBookingConfirmationEmail(booking) {
  const to = String(booking?.guest?.email || "").trim();
  if (!to) {
    return { ok: false, reason: "no_email" };
  }

  const propertyTitle = booking?.property?.title || "your stay";
  const isPaidOnline =
    booking?.paymentMethod === "pay_now" &&
    ["completed", "partially_paid"].includes(String(booking?.paymentStatus || "").toLowerCase());
  const subject = isPaidOnline
    ? `Payment Received · Booking Confirmed · ${propertyTitle} | Demand Setu`
    : `Booking Confirmed · ${propertyTitle} | Demand Setu`;
  const html = buildBookingConfirmationEmailHtml(booking);
  const text = buildBookingConfirmationEmailText(booking);

  const response = await fetchWithTimeout(buildApiUrl("api/webmail/send-demand"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to,
      subject,
      html,
      text,
      replyTo: "info@demandsetutours.com",
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Booking email failed (${response.status})`;
    throw new Error(message);
  }

  return { ok: true, data: payload };
}
