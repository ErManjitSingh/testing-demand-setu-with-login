import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

const GUEST_SESSION_KEY = "demand_setu_guest_session";
const GUEST_PERSISTENT_KEY = "demand_setu_guest_persistent";
const AUTH_CHANGE_EVENT = "guest-auth-change";

function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
}

export function loadGuestSession() {
  if (typeof window === "undefined") return null;
  try {
    const persistent = localStorage.getItem(GUEST_PERSISTENT_KEY);
    if (persistent) return JSON.parse(persistent);

    const session = sessionStorage.getItem(GUEST_SESSION_KEY);
    if (session) return JSON.parse(session);
  } catch {
    return null;
  }
  return null;
}

export function getGuestAuthToken() {
  const session = loadGuestSession();
  return String(session?.token || "").trim();
}

export function buildGuestAuthHeaders(extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };
  const token = getGuestAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function requestJson(method, path, body, { requireAuth = false } = {}) {
  const token = getGuestAuthToken();
  if (requireAuth && !token) {
    throw new Error("Please sign in to view your bookings.");
  }

  const response = await fetchWithTimeout(buildApiUrl(path), {
    method,
    headers: buildGuestAuthHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      (Array.isArray(payload?.errors) ? payload.errors.join(", ") : null) ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

async function postJson(path, body, options = {}) {
  return requestJson("POST", path, body, options);
}

export async function createInventoryBooking(bookingData) {
  return postJson("api/inventorybooking/create", bookingData);
}

export function extractInventoryBookingId(response) {
  const data = response?.data ?? response?.booking ?? response;
  if (!data) return null;
  if (typeof data === "string") return data;
  return data._id || data.id || null;
}

export async function guestLogin({ mobile, password }) {
  return postJson("api/auth/guest/login", {
    mobile: String(mobile || "").trim(),
    password,
  });
}

export async function guestSignup({ name, email, mobile, country, password }) {
  return postJson("api/auth/guest/signup", {
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    mobile: String(mobile || "").trim(),
    country: String(country || "").trim(),
    password,
  });
}

export async function guestGoogleLogin({ idToken }) {
  return postJson("api/auth/guest/nextauth-google", {
    idToken: String(idToken || "").trim(),
  });
}

export async function getMyBookings() {
  return requestJson("GET", "api/inventorybooking/my-bookings", undefined, {
    requireAuth: true,
  });
}

/** @deprecated Prefer getMyBookings with Bearer token */
export async function getBookingsByMobile(mobile) {
  const digits = String(mobile || "").replace(/\D/g, "");
  if (!digits) {
    return { success: true, data: [] };
  }

  const response = await fetchWithTimeout(
    buildApiUrl(`api/inventorybooking/get-by-mobile/${encodeURIComponent(digits)}`),
    { cache: "no-store" }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Failed to load bookings (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

export function isBookingCancellationRequested(booking) {
  return String(booking?.customerResponse?.status || "").toLowerCase() === "cancel";
}

export function canCustomerCancelBooking(booking) {
  return Boolean(booking?._id) && !isBookingCancellationRequested(booking);
}

export async function updateInventoryBooking(bookingId, body) {
  const id = String(bookingId || "").trim();
  if (!id) {
    throw new Error("Booking id is required");
  }

  return requestJson(
    "PUT",
    `api/inventorybooking/update/${encodeURIComponent(id)}`,
    body
  );
}

export async function cancelInventoryBooking(bookingId, note = "") {
  return updateInventoryBooking(bookingId, {
    customerResponse: {
      status: "cancel",
      note: String(note || "").trim(),
    },
  });
}

export function getGuestProfileFromSession(session) {
  if (!session) return null;

  let firstName = session.firstName || "";
  let lastName = session.lastName || "";
  const fullName =
    session.fullName || `${firstName} ${lastName}`.trim() || session.name || "";

  if (!firstName && fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ");
  }

  return {
    _id: session._id || null,
    firstName,
    lastName,
    fullName: fullName || `${firstName} ${lastName}`.trim(),
    email: session.email || "",
    mobile: session.mobile || "",
    country: session.country || "India",
    photoURL: session.photoURL || "",
  };
}

export function isCheckoutProfileComplete(profile) {
  if (!profile) return false;

  const hasName = Boolean(
    profile.firstName?.trim() || profile.lastName?.trim() || profile.fullName?.trim()
  );
  const hasEmail = Boolean(profile.email?.trim());
  const mobileDigits = String(profile.mobile || "").replace(/\D/g, "");

  return hasName && hasEmail && mobileDigits.length >= 10;
}

export function saveGuestSession(data, { persist = false } = {}) {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify({
      ...data,
      loggedInAt: Date.now(),
    });

    if (persist) {
      localStorage.setItem(GUEST_PERSISTENT_KEY, payload);
      sessionStorage.removeItem(GUEST_SESSION_KEY);
    } else {
      sessionStorage.setItem(GUEST_SESSION_KEY, payload);
      localStorage.removeItem(GUEST_PERSISTENT_KEY);
    }

    notifyAuthChange();
  } catch {
    /* ignore */
  }
}

export function clearGuestSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_PERSISTENT_KEY);
    sessionStorage.removeItem(GUEST_SESSION_KEY);
    notifyAuthChange();
  } catch {
    /* ignore */
  }
}

export function isGuestLoggedIn() {
  return Boolean(getGuestAuthToken());
}
