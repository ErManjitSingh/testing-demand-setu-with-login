import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

const PARTNER_SESSION_KEY = "demand_setu_partner_session";
const AUTH_CHANGE_EVENT = "partner-auth-change";

function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
}

/** Normalize email/mobile so sign-in matches how signup stores account fields. */
export function normalizePartnerLoginId(loginId) {
  const trimmed = String(loginId || "").trim();
  if (!trimmed) return "";

  if (trimmed.includes("@")) {
    return trimmed.toLowerCase();
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return trimmed;

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  return digits;
}

export function normalizePartnerMobile(mobile) {
  return normalizePartnerLoginId(mobile);
}

function decodeJwtPayload(token) {
  try {
    const segment = String(token || "").split(".")[1];
    if (!segment) return null;
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function getPartnerPropertyIdFromToken(token) {
  const payload = decodeJwtPayload(token);
  return String(payload?.packageMakerId || "").trim();
}

export function getWebsitePartnerIdFromToken(token) {
  const payload = decodeJwtPayload(token);
  return String(
    payload?.websitePartnerId ||
      payload?.partnerId ||
      payload?.id ||
      payload?._id ||
      ""
  ).trim();
}

export function getWebsitePartnerDetails() {
  const session = loadPartnerSession() || {};
  const user = session?.user || {};

  let storedUser = null;
  let storedPartnerId = "";
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("user");
      storedUser = raw ? JSON.parse(raw) : null;
      storedPartnerId = String(
        localStorage.getItem("websitePartnerId") || ""
      ).trim();
    } catch {
      storedUser = null;
    }
  }

  const source = { ...storedUser, ...user };

  const websitePartnerId = String(
    session?.websitePartnerId ||
      storedPartnerId ||
      source?._id ||
      source?.id ||
      source?.websitePartnerId ||
      getWebsitePartnerIdFromToken(getPartnerAuthToken()) ||
      ""
  ).trim();

  const loginId = getPartnerLoginId();
  const mobile = normalizePartnerMobile(
    source?.mobile || (!String(loginId).includes("@") ? loginId : "")
  );
  const email = normalizePartnerLoginId(
    source?.email || (String(loginId).includes("@") ? loginId : "")
  );
  const name = String(source?.name || "").trim();

  return {
    websitePartnerId,
    name,
    email,
    mobile,
  };
}

/** Backend returns one property object in `data`, not always an array. */
export function normalizePartnerPropertyList(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.properties)) return payload.data.properties;
  if (Array.isArray(payload?.properties)) return payload.properties;

  const single =
    payload?.data?.property ?? payload?.data ?? payload?.property ?? null;

  if (single && typeof single === "object" && !Array.isArray(single)) {
    if (single._id || single.basicInfo || single.account) return [single];
  }

  if (Array.isArray(payload)) return payload;
  return [];
}

export function getPartnerPropertyId() {
  const session = loadPartnerSession();
  const fromSession = String(session?.propertyId || "").trim();
  if (fromSession) return fromSession;

  if (typeof window !== "undefined") {
    const stored = String(localStorage.getItem("partnerPropertyId") || "").trim();
    if (stored) return stored;
  }

  return getPartnerPropertyIdFromToken(getPartnerAuthToken());
}

/** Login id used to fetch hotel: prefer mobile, then email — never propertyObjectId. */
export function getPartnerLoginId() {
  const session = loadPartnerSession();
  const user = session?.user;

  let storedUser = null;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("user");
      storedUser = raw ? JSON.parse(raw) : null;
    } catch {
      storedUser = null;
    }
  }

  const mobileCandidates = [
    user?.mobile,
    storedUser?.mobile,
    session?.loginId,
  ];
  for (const candidate of mobileCandidates) {
    const normalized = normalizePartnerLoginId(candidate);
    if (normalized && !normalized.includes("@")) return normalized;
  }

  const emailCandidates = [user?.email, storedUser?.email, session?.loginId];
  for (const candidate of emailCandidates) {
    const normalized = normalizePartnerLoginId(candidate);
    if (normalized && normalized.includes("@")) return normalized;
  }

  return "";
}

export async function resolvePartnerPropertyId() {
  let id = getPartnerPropertyId();
  if (id) return id;

  const loginId = getPartnerLoginId();
  if (!loginId) return "";

  try {
    const data = await getWebsiteHotelByLogin(loginId);
    const list = normalizePartnerPropertyList(data);
    id = String(list[0]?._id || list[0]?.propertyId || "").trim();
    if (id) {
      const session = loadPartnerSession() || {};
      savePartnerSession({ ...session, propertyId: id });
    }
  } catch {
    /* No linked property yet — caller will create one */
  }

  return id;
}

async function postJson(path, body) {
  const response = await fetchWithTimeout(buildApiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

export async function signupWebsitePackagemaker({ name, email, mobile, password }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedMobile = normalizePartnerMobile(mobile);

  return postJson("api/website-partner/signup", {
    name: String(name || "").trim(),
    email: normalizedEmail,
    mobile: normalizedMobile,
    password,
  });
}

export async function signinWebsitePackagemaker({ loginId, password }) {
  const normalized = normalizePartnerLoginId(loginId);
  const body = {
    loginId: normalized,
    password,
  };

  if (normalized.includes("@")) {
    body.email = normalized;
  } else if (normalized) {
    body.mobile = normalized;
  }

  return postJson("api/website-partner/signin", body);
}

export function extractPartnerAuthPayload(response) {
  const property = response?.data?.property ?? response?.property ?? null;
  const partner =
    response?.data?.partner ??
    response?.partner ??
    property?.account ??
    null;
  const propertyId = String(
    response?.data?.propertyId ||
      property?._id ||
      property?.id ||
      partner?.packageMakerId ||
      ""
  ).trim();
  const token =
    response?.token ||
    response?.accessToken ||
    response?.data?.token ||
    response?.user?.token ||
    "";

  const user =
    partner ||
    response?.user ||
    response?.data?.user ||
    null;

  const websitePartnerId = String(
    partner?._id ||
      partner?.id ||
      response?.data?.partnerId ||
      response?.data?.websitePartnerId ||
      getWebsitePartnerIdFromToken(token) ||
      ""
  ).trim();

  return {
    token: String(token || "").trim(),
    user: user && typeof user === "object" ? user : null,
    propertyId,
    websitePartnerId,
    property,
    partner,
  };
}

export function loadPartnerSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PARTNER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePartnerSession(data) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      ...data,
      loggedInAt: Date.now(),
    };
    sessionStorage.setItem(PARTNER_SESSION_KEY, JSON.stringify(payload));

    if (payload.token) {
      localStorage.setItem("token", payload.token);
    }
    if (payload.user) {
      localStorage.setItem("user", JSON.stringify(payload.user));
    }
    if (payload.propertyId) {
      localStorage.setItem("partnerPropertyId", payload.propertyId);
    }
    if (payload.websitePartnerId) {
      localStorage.setItem("websitePartnerId", payload.websitePartnerId);
    }

    notifyAuthChange();
  } catch {
    /* ignore */
  }
}

export function clearPartnerSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PARTNER_SESSION_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("partnerPropertyId");
    localStorage.removeItem("websitePartnerId");
    notifyAuthChange();
  } catch {
    /* ignore */
  }
}

export function getPartnerAuthToken() {
  const sessionToken = String(loadPartnerSession()?.token || "").trim();
  if (sessionToken) return sessionToken;
  if (typeof window !== "undefined") {
    return String(localStorage.getItem("token") || "").trim();
  }
  return "";
}

export function getPartnerAuthHeaders({ required = true } = {}) {
  const token = getPartnerAuthToken();
  if (!token && required) {
    throw new Error("Please sign in to continue.");
  }

  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function buildPartnerAuthHeaders() {
  return getPartnerAuthHeaders();
}

export async function getWebsiteHotelByLogin(loginId) {
  const normalized = normalizePartnerLoginId(loginId);
  if (!normalized) {
    throw new Error("Login id is required to fetch your hotel.");
  }

  const params = new URLSearchParams({ loginId: normalized });
  if (normalized.includes("@")) {
    params.set("email", normalized);
  } else {
    params.set("mobile", normalized);
  }

  const response = await fetchWithTimeout(
    buildApiUrl(`api/website-partner/get-hotel-by-login?${params}`),
    {
      method: "GET",
    }
  );

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

export async function getMyWebsitePackagemaker() {
  const loginId = getPartnerLoginId();
  if (!loginId) {
    throw new Error("Please sign in to continue.");
  }

  try {
    return await getWebsiteHotelByLogin(loginId);
  } catch (error) {
    const message = String(error?.message || "").toLowerCase();
    // New partner account with no hotel yet — treat as empty list, not a hard failure
    if (
      message.includes("linked property not found") ||
      message.includes("no website hotel") ||
      message.includes("not found")
    ) {
      return { success: true, data: [], total: 0 };
    }
    throw error;
  }
}

/** Create hotel like zip hotelManager, with website partner fields. */
export async function createWebsitePackagemaker(basicInfo = {}) {
  const partner = getWebsitePartnerDetails();
  if (!partner.websitePartnerId) {
    throw new Error("Partner session missing. Please sign in again.");
  }

  const response = await fetchWithTimeout(
    buildApiUrl("api/packagemaker/create-packagemaker"),
    {
      method: "POST",
      headers: getPartnerAuthHeaders(),
      body: JSON.stringify({
        step: 0,
        isWebsiteHotel: true,
        websitePartnerId: partner.websitePartnerId,
        // Logged-in partner details (name / email / mobile)
        websitePartner: {
          _id: partner.websitePartnerId,
          name: partner.name,
          email: partner.email,
          mobile: partner.mobile,
        },
        partnerName: partner.name,
        partnerEmail: partner.email,
        partnerMobile: partner.mobile,
        name: partner.name,
        email: partner.email || basicInfo?.email,
        mobile: partner.mobile || basicInfo?.mobile,
        ...basicInfo,
        isWebsiteHotel: true,
        websitePartnerId: partner.websitePartnerId,
      }),
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed (${response.status})`;
    throw new Error(message);
  }

  const createdId = String(
    payload?.data?._id ||
      payload?.data?.property?._id ||
      payload?.property?._id ||
      payload?._id ||
      payload?.id ||
      ""
  ).trim();

  if (createdId) {
    const session = loadPartnerSession() || {};
    savePartnerSession({
      ...session,
      propertyId: createdId,
      websitePartnerId: partner.websitePartnerId,
    });
  }

  return { ...payload, propertyId: createdId };
}

export function isPartnerLoggedIn() {
  return Boolean(getPartnerLoginId() || getPartnerAuthToken());
}

export const PARTNER_AUTH_CHANGE_EVENT = AUTH_CHANGE_EVENT;
