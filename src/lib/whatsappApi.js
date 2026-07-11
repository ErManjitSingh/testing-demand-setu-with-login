import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

const BOOKING_WELCOME_TEMPLATE = {
  templateName: "website_static_template",
  language: "en",
};

const PAYMENT_CONFIRM_TEMPLATE = {
  templateName: "payment_confirm",
  language: "en",
};

const WEBSITE_NEW_LEAD_TEMPLATE = {
  templateName: "website_new_lead_template",
  language: "en",
};

const ENQUIRY_NOTIFY_MOBILE = "9816661968";

export function phoneToDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatPhoneForWhatsApp(mobile) {
  const mobileDigits = phoneToDigits(mobile);
  if (!mobileDigits) {
    return null;
  }
  return mobileDigits.length <= 10 ? `91${mobileDigits}` : mobileDigits;
}

async function sendWhatsAppTemplate({ mobile, templateName, language, components }) {
  const to = formatPhoneForWhatsApp(mobile);
  if (!to) {
    return { ok: false, reason: "no_mobile" };
  }

  const body = {
    phone: to,
    templateName,
    language,
  };

  if (components?.length) {
    body.components = components;
  }

  const response = await fetchWithTimeout(buildApiUrl("api/whatsapp/send-template"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `WhatsApp template failed (${response.status})`;
    throw new Error(message);
  }

  return { ok: true, data: payload };
}

/**
 * Sends Demand Setu welcome WhatsApp template after a successful booking.
 */
export async function sendBookingWelcomeWhatsApp({ mobile }) {
  return sendWhatsAppTemplate({
    mobile,
    ...BOOKING_WELCOME_TEMPLATE,
  });
}

/**
 * Sends payment confirmation WhatsApp template after successful online payment.
 */
export async function sendPaymentConfirmWhatsApp({ mobile }) {
  return sendWhatsAppTemplate({
    mobile,
    ...PAYMENT_CONFIRM_TEMPLATE,
  });
}

/** Notifies admin on new website enquiry (package or stay). */
export async function sendWebsiteNewLeadWhatsApp() {
  return sendWhatsAppTemplate({
    mobile: ENQUIRY_NOTIFY_MOBILE,
    ...WEBSITE_NEW_LEAD_TEMPLATE,
  });
}
