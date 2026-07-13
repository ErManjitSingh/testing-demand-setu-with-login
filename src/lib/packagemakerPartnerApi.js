import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

const PARTNER_SESSION_KEY = "demand_setu_partner_session";
const AUTH_CHANGE_EVENT = "partner-auth-change";

function notifyAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
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
  return postJson("api/packagemaker/signup-website-packagemaker", {
    name: String(name || "").trim(),
    email: String(email || "").trim().toLowerCase(),
    mobile: String(mobile || "").trim(),
    password,
  });
}

export async function signinWebsitePackagemaker({ loginId, password }) {
  const id = String(loginId || "").trim();
  return postJson("api/packagemaker/signin-website-packagemaker", {
    loginId: id,
    password,
  });
}

export function extractPartnerAuthPayload(response) {
  const user = response?.user ?? response?.data?.user ?? response?.data ?? response;
  const token =
    response?.token ||
    response?.accessToken ||
    response?.data?.token ||
    user?.token ||
    "";

  return {
    token: String(token || "").trim(),
    user: user && typeof user === "object" ? user : null,
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
    sessionStorage.setItem(
      PARTNER_SESSION_KEY,
      JSON.stringify({
        ...data,
        loggedInAt: Date.now(),
      })
    );
    notifyAuthChange();
  } catch {
    /* ignore */
  }
}

export function clearPartnerSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PARTNER_SESSION_KEY);
    notifyAuthChange();
  } catch {
    /* ignore */
  }
}

export function getPartnerAuthToken() {
  return String(loadPartnerSession()?.token || "").trim();
}

export function isPartnerLoggedIn() {
  return Boolean(getPartnerAuthToken());
}

export const PARTNER_AUTH_CHANGE_EVENT = AUTH_CHANGE_EVENT;
