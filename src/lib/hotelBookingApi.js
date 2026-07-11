import { buildApiUrl } from "@/lib/apiConfig";
import { buildGuestAuthHeaders } from "@/lib/inventoryBookingApi";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

async function requestJson(method, path, body) {
  const response = await fetchWithTimeout(buildApiUrl(path), {
    method,
    headers: buildGuestAuthHeaders(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
      `Hotel booking update failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export async function createHotelBooking(payload) {
  const response = await fetchWithTimeout(buildApiUrl("api/hotelbooking/create"), {
    method: "POST",
    headers: buildGuestAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Hotel booking create failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export async function updateHotelBookingByWebsiteId(websiteid, body) {
  const id = String(websiteid || "").trim();
  if (!id) {
    throw new Error("Website booking id is required");
  }

  return requestJson(
    "PUT",
    `api/hotelbooking/update-by-websiteid/${encodeURIComponent(id)}`,
    body
  );
}

export async function cancelHotelBookingByWebsiteId(websiteid, note = "") {
  return updateHotelBookingByWebsiteId(websiteid, {
    customerResponse: {
      status: "cancel",
      note: String(note || "").trim(),
    },
  });
}
