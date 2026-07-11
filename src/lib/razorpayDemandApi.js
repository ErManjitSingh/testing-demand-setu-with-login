import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }
  return payload;
}

export async function getDemandRazorpayKey() {
  const response = await fetchWithTimeout(buildApiUrl("api/razorpay-demand/key"), {
    cache: "no-store",
  });
  return parseResponse(response);
}

export async function createDemandOrder(body) {
  const response = await fetchWithTimeout(buildApiUrl("api/razorpay-demand/order"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function verifyDemandPayment(body) {
  const response = await fetchWithTimeout(buildApiUrl("api/razorpay-demand/verify"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseResponse(response);
}

const PAYABLE_BOOKING_STATUSES = new Set(["pending", "rejected", "partially_paid"]);

export function canPayBookingOnline(booking) {
  const status = String(booking?.payment || "").toLowerCase();
  return PAYABLE_BOOKING_STATUSES.has(status);
}

export function getBookingAmountDue(booking) {
  const total = Number(booking?.pricing?.payableTotal ?? booking?.pricing?.total ?? 0);
  const amountPaid = Number(booking?.amountPaid) || 0;
  const status = String(booking?.payment || "pending").toLowerCase();

  if (status === "partially_paid") {
    return Math.max(0, total - amountPaid);
  }
  if (PAYABLE_BOOKING_STATUSES.has(status)) {
    return total;
  }
  return 0;
}

export async function payInventoryBookingOnline(booking) {
  if (!booking?._id) {
    throw new Error("Invalid booking");
  }
  if (!canPayBookingOnline(booking)) {
    throw new Error("This booking is not eligible for online payment");
  }

  const amount = getBookingAmountDue(booking);
  if (amount < 1) {
    throw new Error("No amount due for this booking");
  }

  const guest = booking.guest || {};
  const property = booking.property || {};
  const guestName =
    guest.fullName || `${guest.firstName || ""} ${guest.lastName || ""}`.trim();

  const orderResponse = await createDemandOrder({
    amount,
    inventoryBookingId: booking._id,
    customerDetails: {
      name: guestName,
      email: guest.email || "",
      phone: guest.mobile || "",
    },
    packageDetails: {
      property: booking.property,
      stay: booking.stay,
      pricing: booking.pricing,
    },
    notes: `Payment for ${property.title || "booking"}`,
  });

  const keyId = orderResponse.key_id;
  const order = orderResponse.order;

  if (!keyId || !order?.id) {
    throw new Error("Could not start payment. Please try again.");
  }

  return openDemandRazorpayCheckout({
    keyId,
    order,
    customer: {
      name: guestName,
      email: guest.email || "",
      phone: guest.mobile || "",
    },
    description: `Booking · ${property.title || "Hotel stay"}`,
  });
}

export async function getDemandPayment(orderId) {
  const response = await fetchWithTimeout(
    buildApiUrl(`api/razorpay-demand/order/${encodeURIComponent(orderId)}`),
    { cache: "no-store" }
  );
  return parseResponse(response);
}

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Razorpay is only available in the browser"));
      return;
    }
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay checkout and verifies payment on success.
 */
export async function openDemandRazorpayCheckout({
  keyId,
  order,
  customer,
  description,
}) {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "Demand Setu Tours",
      description: description || "Hotel booking",
      order_id: order.id,
      prefill: {
        name: customer?.name || "",
        email: customer?.email || "",
        contact: customer?.phone || "",
      },
      theme: {
        color: "#ea580c",
      },
      handler: async (response) => {
        try {
          const verified = await verifyDemandPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          resolve(verified);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => {
          reject(new Error("Payment cancelled"));
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (event) => {
      reject(
        new Error(event?.error?.description || event?.error?.reason || "Payment failed")
      );
    });
    rzp.open();
  });
}
