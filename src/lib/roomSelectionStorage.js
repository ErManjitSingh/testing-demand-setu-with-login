const ROOM_SELECTION_KEY = "demand_setu_room_selection";

export function saveRoomSelection(propertySlug, payload) {
  if (typeof window === "undefined" || !propertySlug) return;
  try {
    sessionStorage.setItem(
      ROOM_SELECTION_KEY,
      JSON.stringify({
        propertySlug,
        savedAt: Date.now(),
        ...payload,
      })
    );
  } catch {
    /* ignore */
  }
}

export function loadRoomSelection(propertySlug) {
  if (typeof window === "undefined" || !propertySlug) return null;
  try {
    const raw = sessionStorage.getItem(ROOM_SELECTION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.propertySlug !== propertySlug) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearRoomSelection() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ROOM_SELECTION_KEY);
  } catch {
    /* ignore */
  }
}
