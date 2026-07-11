import { getDefaultBookingDates, getDefaultListingsDirectUrlDates, parseDateParam, toDateParam, addDays } from "@/lib/dates";
import {
  applyMinimumRooms,
  getGuestOccupancyError,
  getMinimumRoomsRequired,
  normalizeChildAges,
  parseChildAgesParam,
  serializeChildAgesParam,
} from "@/lib/guestOccupancy";
import { getApiPropertyType } from "@/lib/propertyTypes";
import {
  buildListingsSlugPath,
  isListingsSlugPath,
  isStateSlug,
  listingsQueryFromParams,
  parseListingsSlugPath,
  toLocationSlug,
} from "@/lib/listingsSlug";
import {
  buildPropertyPath,
  isPropertySlugPath,
  normalizeListingRef,
} from "@/lib/propertySlug";

const SESSION_KEY = "demand_setu_booking";
const SESSION_DATE_PRIORITY_MS = 10 * 60 * 1000;

export const TRIP_SEARCH_UPDATED = "demand-setu-trip-search-updated";

function notifyTripSearchUpdated() {
  if (typeof window === "undefined") return;
  queueMicrotask(() => {
    window.dispatchEvent(new CustomEvent(TRIP_SEARCH_UPDATED));
  });
}

export const DEFAULT_GUESTS = { adults: 2, children: 0, rooms: 1, childAges: [] };

function tripLocationSlug(trip) {
  const explicit = String(trip?.locationSlug || "").trim();
  if (explicit) return toLocationSlug(explicit);
  const city = String(trip?.city || "").trim();
  const state = String(trip?.state || "").trim();
  return toLocationSlug(city || state);
}

/** Keep slug-only listings paths (e.g. /hotels/nubra) when building URLs from partial trip edits. */
export function enrichListingsTripFromPath(pathname, trip = {}) {
  if (!isListingsSlugPath(pathname)) return { ...trip };
  const slug = parseListingsSlugPath(pathname);
  const fromTrip = tripLocationSlug(trip);
  const explicit = String(trip.locationSlug || "").trim();

  // When user picks a city/state, that wins over the old pathname slug.
  if (fromTrip && (trip.city || trip.state)) {
    return { ...trip, locationSlug: fromTrip };
  }

  const locationSlug = explicit || slug?.locationSlug || fromTrip;
  return {
    ...trip,
    locationSlug: locationSlug || "",
  };
}

/** Fill missing check-in/out and guests for direct listings URLs (kal / parso, 2 adults, 1 room). */
export function fillMissingListingsTripDefaults(trip = {}) {
  const { checkIn, checkOut } = getDefaultListingsDirectUrlDates();
  let nextCheckIn = trip.checkIn || checkIn;
  let nextCheckOut = trip.checkOut || checkOut;
  if (!nextCheckOut || nextCheckOut <= nextCheckIn) {
    nextCheckOut = addDays(nextCheckIn, 1);
  }
  return {
    ...trip,
    checkIn: nextCheckIn,
    checkOut: nextCheckOut,
    guests: normalizeGuests(trip.guests || DEFAULT_GUESTS),
  };
}

/** Fill missing check-in/out and guests with today, tomorrow, and 2 adults / 1 room. */
export function fillMissingBookingDefaults(trip = {}) {
  const defaults = getDefaultBookingDates();
  let checkIn = trip.checkIn || defaults.checkIn;
  let checkOut = trip.checkOut || defaults.checkOut;

  if (!checkOut || checkOut <= checkIn) {
    checkOut = addDays(checkIn, 1);
  }

  return {
    ...trip,
    checkIn,
    checkOut,
    guests: normalizeGuests(trip.guests),
  };
}

export function normalizeGuests(guests) {
  const g = guests || DEFAULT_GUESTS;
  const adults = Math.max(1, Number.parseInt(String(g.adults ?? 2), 10) || 2);
  const children = Math.max(0, Number.parseInt(String(g.children ?? 0), 10) || 0);
  const rooms = Math.max(1, Number.parseInt(String(g.rooms ?? 1), 10) || 1);
  const childAges = normalizeChildAges(
    Array.isArray(g.childAges) ? g.childAges : parseChildAgesParam(g.childAges),
    children
  );

  return applyMinimumRooms({ adults, children, rooms, childAges });
}

export function parseGuestsFromParams(params) {
  if (!params) return { ...DEFAULT_GUESTS };
  const get = (key, fallback) => {
    if (typeof params.get === "function") return params.get(key);
    return params[key];
  };
  return normalizeGuests({
    adults: get("adults", "2"),
    children: get("children", "0"),
    rooms: get("rooms", "1"),
    childAges: parseChildAgesParam(get("childAges", "")),
  });
}

export function parseBookingFromParams(params) {
  const get = (key) => {
    if (!params) return "";
    if (typeof params.get === "function") return params.get(key) || "";
    return String(params[key] || "");
  };

  return {
    checkIn: parseDateParam(get("checkIn")),
    checkOut: parseDateParam(get("checkOut")),
    guests: parseGuestsFromParams(params),
  };
}

/** Full trip: location, category, dates, guests (from URL or plain object). */
export function parseTripFromSearchParams(params) {
  const get = (key) => {
    if (!params) return "";
    if (typeof params.get === "function") return params.get(key) || "";
    return String(params[key] || "");
  };

  const category = get("category").trim() || "all";
  const booking = parseBookingFromParams(params);

  return {
    category,
    city: get("city").trim(),
    state: get("state").trim(),
    ...booking,
  };
}

export function hasSearchParam(params, key) {
  if (!params) return false;
  if (typeof params.has === "function") return params.has(key);
  return params[key] != null && params[key] !== "";
}

export function validateSearchDates({ checkIn, checkOut }) {
  if (!checkIn || !checkOut) {
    return "Check-in and check-out dates are required.";
  }
  if (checkOut <= checkIn) {
    return "Check-out must be after check-in.";
  }
  return null;
}

export function validateTripSearch({ city, state, locationSlug, checkIn, checkOut, guests }) {
  const destination =
    String(city || "").trim() ||
    String(state || "").trim() ||
    String(locationSlug || "").trim();
  if (!destination) {
    return "Please select a city or state.";
  }

  const dateError = validateSearchDates({ checkIn, checkOut });
  if (dateError) return dateError;

  const g = normalizeGuests(guests);
  if (g.adults < 1) return "At least 1 adult guest is required.";
  if (g.rooms < 1) return "At least 1 room is required.";
  if (g.rooms < getMinimumRoomsRequired(g)) {
    return `Please select at least ${getMinimumRoomsRequired(g)} rooms for your guests.`;
  }

  return getGuestOccupancyError(g);
}

export function validatePropertyBooking({ checkIn, checkOut, guests }) {
  const dateError = validateSearchDates({ checkIn, checkOut });
  if (dateError) return dateError;

  const g = normalizeGuests(guests);
  if (g.adults < 1) return "At least 1 adult guest is required.";
  if (g.rooms < 1) return "At least 1 room is required.";
  if (g.rooms < getMinimumRoomsRequired(g)) {
    return `Please select at least ${getMinimumRoomsRequired(g)} rooms for your guests.`;
  }

  return getGuestOccupancyError(g);
}

export function appendBookingToParams(params, { checkIn, checkOut, guests }) {
  const next = params instanceof URLSearchParams ? new URLSearchParams(params) : new URLSearchParams();

  if (checkIn) next.set("checkIn", toDateParam(checkIn));
  else next.delete("checkIn");

  if (checkOut) next.set("checkOut", toDateParam(checkOut));
  else next.delete("checkOut");

  const g = normalizeGuests(guests);
  next.set("adults", String(g.adults));
  next.set("children", String(g.children));
  next.set("rooms", String(g.rooms));
  if (g.children > 0 && g.childAges?.length) {
    next.set("childAges", serializeChildAgesParam(g.childAges));
  } else {
    next.delete("childAges");
  }

  return next;
}

/** Apply trip fields to existing query string (keeps filters: price, stars, sort, etc.). */
export function applyTripToParams(params, trip) {
  const next = params instanceof URLSearchParams ? new URLSearchParams(params) : new URLSearchParams();

  const category = trip.category ?? "all";
  if (category && category !== "all") {
    next.set("category", category);
    const propertyType = getApiPropertyType(category);
    if (propertyType) next.set("propertyType", propertyType);
    else next.delete("propertyType");
  } else {
    next.delete("category");
    next.delete("propertyType");
  }

  const city = String(trip.city || "").trim();
  const state = String(trip.state || "").trim();
  if (city) next.set("city", city);
  else next.delete("city");
  if (state) next.set("state", state);
  else next.delete("state");
  next.delete("locationKind");

  appendBookingToParams(next, trip);
  return next;
}

export function buildListingsSearchUrl({
  category,
  city = "",
  state = "",
  checkIn,
  checkOut,
  guests,
  extraParams = "",
} = {}) {
  const params = new URLSearchParams(extraParams);

  const trip = {
    category: category ?? "all",
    city,
    state,
    checkIn,
    checkOut,
    guests,
  };

  return buildListingsUrlFromParams(applyTripToParams(params, trip), trip);
}

export function buildListingsUrlFromParams(params, tripOverride = null) {
  const source =
    params instanceof URLSearchParams
      ? params
      : new URLSearchParams(params?.toString?.() || "");
  const trip = tripOverride || parseTripFromSearchParams(source);
  const path = buildListingsSlugPath({
    category: trip.category ?? "all",
    city: trip.city,
    state: trip.state,
    locationSlug: trip.locationSlug,
  });
  const query = listingsQueryFromParams(source);
  appendBookingToParams(query, trip);
  query.delete("locationKind");
  if (isListingsSlugPath(path)) {
    query.delete("city");
    query.delete("state");
    query.delete("category");
    query.delete("propertyType");
  }
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Read listings trip from slug path + query (same shape as parseTripFromSearchParams). */
export function parseListingsUrl(pathname, searchParams) {
  const queryTrip = parseTripFromSearchParams(searchParams);
  const slug = parseListingsSlugPath(pathname);
  if (!slug) return queryTrip;

  const city = String(queryTrip.city || "").trim();
  const state = String(queryTrip.state || "").trim();
  const locationName = slug.locationName || "";
  const category = searchParams?.get?.("category")
    ? queryTrip.category
    : slug.category || queryTrip.category;

  if (city || state) {
    return {
      ...queryTrip,
      category,
      city,
      state,
      locationKind: state && !city ? "state" : city ? "city" : null,
      locationSlug: slug.locationSlug || toLocationSlug(city || state),
    };
  }

  // Slug-only: city/state resolved server-side; keep slug for URL building.
  return {
    ...queryTrip,
    category,
    city: "",
    state: "",
    locationKind: null,
    locationSlug: slug.locationSlug || "",
  };
}

export function buildPropertyUrl(listingOrSlug, trip = {}) {
  const listing = normalizeListingRef(listingOrSlug);
  const path = buildPropertyPath(listing, trip);
  const query = new URLSearchParams();
  appendBookingToParams(query, trip);
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export function buildPropertyUrlPreservingTrip(searchParams, listingOrSlug, trip) {
  const listing = normalizeListingRef(listingOrSlug);
  const path = buildPropertyPath(listing, trip);
  const query = new URLSearchParams();
  appendBookingToParams(query, trip);
  const qs = query.toString();
  return qs ? `${path}?${qs}` : path;
}

export function buildBookUrl(listingOrSlug, trip = {}, { price } = {}) {
  const listing = normalizeListingRef(listingOrSlug);
  const path = `${buildPropertyPath(listing, trip)}/book`;
  const params = new URLSearchParams();
  appendBookingToParams(params, trip);
  if (price != null && price !== "") params.set("price", String(price));
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

const INVENTORY_BOOKING_PARAMS = ["inventory", "total", "subtotal", "gst", "roomsSelected"];

export function appendInventoryBookingToParams(params, sourceParams) {
  const source =
    sourceParams instanceof URLSearchParams
      ? sourceParams
      : new URLSearchParams(sourceParams?.toString?.() || "");

  if (source.get("inventory") === "1") {
    params.set("inventory", "1");
    for (const key of INVENTORY_BOOKING_PARAMS) {
      if (key === "inventory") continue;
      const value = source.get(key);
      if (value) params.set(key, value);
    }
    return params;
  }

  const price = source.get("price");
  if (price) params.set("price", price);
  return params;
}

export function buildBookUrlPreservingTrip(searchParams, listingOrSlug, trip, { price } = {}) {
  const listing = normalizeListingRef(listingOrSlug);
  const path = `${buildPropertyPath(listing, trip)}/book`;
  const params = new URLSearchParams();
  appendBookingToParams(params, trip);
  const source =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams?.toString?.() || "");

  if (source.get("inventory") === "1") {
    appendInventoryBookingToParams(params, source);
  } else {
    const resolvedPrice = price ?? source.get("price") ?? "";
    if (resolvedPrice !== "") params.set("price", String(resolvedPrice));
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export function saveTripSearch(trip) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      category: trip.category && trip.category !== "all" ? trip.category : "",
      city: String(trip.city || "").trim(),
      state: String(trip.state || "").trim(),
      locationSlug: String(trip.locationSlug || "").trim(),
      locationKind:
        trip.locationKind === "state" || trip.locationKind === "city"
          ? trip.locationKind
          : "",
      checkIn: trip.checkIn ? toDateParam(trip.checkIn) : "",
      checkOut: trip.checkOut ? toDateParam(trip.checkOut) : "",
      guests: normalizeGuests(trip.guests),
      savedAt: Date.now(),
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    notifyTripSearchUpdated();
  } catch {
    /* ignore */
  }
}

/** Prefer recently saved session dates when URL still has stale query params (production router.replace lag). */
export function preferSessionBookingDates(mergedTrip, session, searchParams) {
  if (!session?.checkIn || !session?.checkOut) return mergedTrip;

  const hasUrlDates =
    hasSearchParam(searchParams, "checkIn") && hasSearchParam(searchParams, "checkOut");
  if (!hasUrlDates) return mergedTrip;

  const urlIn = mergedTrip.checkIn?.getTime?.() ?? null;
  const urlOut = mergedTrip.checkOut?.getTime?.() ?? null;
  const sessionIn = session.checkIn?.getTime?.() ?? null;
  const sessionOut = session.checkOut?.getTime?.() ?? null;

  if (urlIn === sessionIn && urlOut === sessionOut) return mergedTrip;

  const savedAt = Number(session.savedAt) || 0;
  const isRecentSession =
    savedAt > 0 && Date.now() - savedAt < SESSION_DATE_PRIORITY_MS;
  if (!isRecentSession) return mergedTrip;

  return {
    ...mergedTrip,
    checkIn: session.checkIn,
    checkOut: session.checkOut,
    guests: session.guests || mergedTrip.guests,
  };
}

/**
 * Save trip to session and optionally sync the current page URL (property / listings).
 * Merges with any existing session trip so partial updates stay consistent.
 */
export function persistTripSearch(trip, sync) {
  const existing = loadTripSearch();
  const pathname = sync?.pathname || "";
  let merged = {
    category: trip.category ?? existing?.category ?? "all",
    city: trip.city !== undefined ? String(trip.city || "").trim() : existing?.city || "",
    state: trip.state !== undefined ? String(trip.state || "").trim() : existing?.state || "",
    locationSlug:
      trip.locationSlug !== undefined
        ? String(trip.locationSlug || "").trim()
        : existing?.locationSlug || "",
    locationKind:
      trip.locationKind !== undefined
        ? trip.locationKind
        : existing?.locationKind ?? null,
    checkIn: trip.checkIn !== undefined ? trip.checkIn : existing?.checkIn || null,
    checkOut: trip.checkOut !== undefined ? trip.checkOut : existing?.checkOut || null,
    guests: normalizeGuests(trip.guests ?? existing?.guests),
  };

  if (merged.state && !merged.city) merged.locationKind = "state";
  else if (merged.city && !merged.state) merged.locationKind = "city";
  else if (!merged.city && !merged.state) merged.locationKind = null;

  merged = enrichListingsTripFromPath(pathname, merged);

  saveTripSearch(merged);

  if (!sync?.router || !sync?.pathname) return merged;

  const params =
    sync.searchParams instanceof URLSearchParams
      ? sync.searchParams
      : new URLSearchParams(sync.searchParams?.toString?.() || "");

  const propertyMatch = sync.pathname.match(/^\/property\/([^/]+)$/);
  if (propertyMatch) {
    const next = buildPropertyUrlPreservingTrip(params, { slug: propertyMatch[1] }, merged);
    sync.router.replace(next, { scroll: false });
    return merged;
  }

  if (isPropertySlugPath(sync.pathname)) {
    if (sync.listing) {
      const next = buildPropertyUrlPreservingTrip(params, sync.listing, merged);
      sync.router.replace(next, { scroll: false });
    }
    return merged;
  }

  if (isListingsSlugPath(sync.pathname) || sync.pathname === "/listings") {
    const next = buildListingsUrlPreservingFilters(params, merged);
    sync.router.replace(next, { scroll: false });
  }

  return merged;
}

/** @deprecated Use saveTripSearch — kept for callers that only pass dates/guests. */
export function saveBookingSession(booking) {
  saveTripSearch(booking);
}

export function loadTripSearch() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      category: String(data.category || "").trim() || "all",
      city: String(data.city || "").trim(),
      state: String(data.state || "").trim(),
      locationSlug: String(data.locationSlug || "").trim(),
      locationKind:
        data.locationKind === "state" || data.locationKind === "city"
          ? data.locationKind
          : null,
      checkIn: parseDateParam(data.checkIn),
      checkOut: parseDateParam(data.checkOut),
      guests: normalizeGuests(data.guests),
      savedAt: Number(data.savedAt) || 0,
    };
  } catch {
    return null;
  }
}

/** @deprecated Use loadTripSearch */
export function loadBookingSession() {
  const trip = loadTripSearch();
  if (!trip) return null;
  return {
    checkIn: trip.checkIn,
    checkOut: trip.checkOut,
    guests: trip.guests,
  };
}

/** Fill missing URL trip fields from session (URL wins when present). */
export function mergeTripFromUrlAndSession(searchParams, session, pathname = "") {
  const url = isListingsSlugPath(pathname)
    ? parseListingsUrl(pathname, searchParams)
    : parseTripFromSearchParams(searchParams);
  if (!session) return url;

  const hasExplicitCity = hasSearchParam(searchParams, "city");
  const hasExplicitState = hasSearchParam(searchParams, "state");
  const hasLocation =
    hasExplicitCity ||
    hasExplicitState ||
    Boolean(url.city || url.state) ||
    Boolean(parseListingsSlugPath(pathname)?.locationSlug);
  const hasCheckIn = hasSearchParam(searchParams, "checkIn");
  const hasCheckOut = hasSearchParam(searchParams, "checkOut");
  const hasGuests =
    hasSearchParam(searchParams, "adults") &&
    hasSearchParam(searchParams, "rooms");
  const hasCategory =
    hasSearchParam(searchParams, "category") ||
    isListingsSlugPath(pathname);

  const slug = isListingsSlugPath(pathname) ? parseListingsSlugPath(pathname) : null;

  let city = url.city;
  let state = url.state;
  let locationKind = url.locationKind || null;
  let locationSlug = url.locationSlug || slug?.locationSlug || "";

  if (hasExplicitCity || hasExplicitState) {
    city = url.city;
    state = url.state;
    locationKind = state && !city ? "state" : city ? "city" : session.locationKind || null;
  } else if (slug?.locationSlug) {
    if (session.state && isStateSlug(session.state, slug.locationSlug)) {
      city = "";
      state = session.state;
      locationKind = session.locationKind || "state";
    } else if (session.city && toLocationSlug(session.city) === slug.locationSlug) {
      city = session.city;
      state = "";
      locationKind = session.locationKind || "city";
    } else if (
      (session.city || session.state) &&
      toLocationSlug(session.city || session.state) !== slug.locationSlug
    ) {
      city = session.city || "";
      state = session.state || "";
      locationKind =
        session.locationKind ||
        (state && !city ? "state" : city ? "city" : null);
      locationSlug = toLocationSlug(city || state);
    } else if (!city && !state) {
      locationSlug = slug.locationSlug;
    }
  } else if (hasLocation) {
    city = url.city || session.city || "";
    state = url.state || session.state || "";
    locationKind =
      session.locationKind ||
      (state && !city ? "state" : city ? "city" : null);
  } else {
    city = session.city || url.city;
    state = session.state || url.state;
    locationKind =
      session.locationKind ||
      (state && !city ? "state" : city ? "city" : null);
  }

  if (!locationSlug && slug?.locationSlug) {
    locationSlug = slug.locationSlug;
  }

  return {
    category: hasCategory ? url.category : session.category || url.category,
    city,
    state,
    locationKind,
    locationSlug,
    checkIn: hasCheckIn ? url.checkIn : session.checkIn || url.checkIn,
    checkOut: hasCheckOut ? url.checkOut : session.checkOut || url.checkOut,
    guests: hasGuests ? url.guests : session.guests || url.guests,
  };
}

/** Resolve city/state/slug for listings URL updates (category switch, filters). */
export function resolveListingsTripFromPath(pathname, searchParams, overrides = {}) {
  const trip = isListingsSlugPath(pathname)
    ? parseListingsUrl(pathname, searchParams)
    : parseTripFromSearchParams(searchParams);
  const session = loadTripSearch();
  const slugInfo = isListingsSlugPath(pathname) ? parseListingsSlugPath(pathname) : null;

  let city = overrides.city ?? trip.city ?? "";
  let state = overrides.state ?? trip.state ?? "";
  let locationKind = overrides.locationKind ?? trip.locationKind ?? null;
  let locationSlug =
    overrides.locationSlug ?? trip.locationSlug ?? slugInfo?.locationSlug ?? "";

  if (session && (session.city || session.state)) {
    if (!city && !state) {
      city = session.city;
      state = session.state;
      locationKind = session.locationKind;
    } else if (session.locationKind) {
      locationKind = session.locationKind;
      if (session.locationKind === "state" && session.state) {
        city = "";
        state = session.state;
      } else if (session.locationKind === "city" && session.city) {
        city = session.city;
        state = "";
      }
    }
  }

  if (!city && !state && slugInfo?.locationSlug) {
    locationSlug = locationSlug || slugInfo.locationSlug;
  }

  return {
    ...trip,
    ...overrides,
    city,
    state,
    locationKind,
    locationSlug,
    category: overrides.category ?? trip.category,
    checkIn: overrides.checkIn ?? trip.checkIn,
    checkOut: overrides.checkOut ?? trip.checkOut,
    guests: overrides.guests ?? trip.guests,
  };
}

export function tripParamsNeedSync(searchParams, mergedTrip, pathname = "") {
  const url = isListingsSlugPath(pathname)
    ? parseListingsUrl(pathname, searchParams)
    : parseTripFromSearchParams(searchParams);

  if (isListingsSlugPath(pathname)) {
    const slug = parseListingsSlugPath(pathname);
    const hasListingLocation = Boolean(
      mergedTrip.city || mergedTrip.state || mergedTrip.locationSlug || slug?.locationSlug
    );
    if (hasListingLocation) {
      if (!hasSearchParam(searchParams, "checkIn") || !hasSearchParam(searchParams, "checkOut")) {
        return true;
      }
      if (!hasSearchParam(searchParams, "adults") || !hasSearchParam(searchParams, "rooms")) {
        return true;
      }
    }
    if (slug?.locationSlug) {
      if (hasSearchParam(searchParams, "state")) {
        return true;
      }
      if (hasSearchParam(searchParams, "city")) {
        const citySlug = toLocationSlug(String(searchParams.get("city") || "").trim());
        if (citySlug && citySlug !== slug.locationSlug) return true;
      }
      if (tripLocationSlug(mergedTrip) !== slug.locationSlug) return true;
    }
    if (hasSearchParam(searchParams, "category")) {
      return true;
    }
    if ((mergedTrip.category || "all") !== (url.category || "all")) return true;
  } else if (isPropertySlugPath(pathname)) {
    if (
      hasSearchParam(searchParams, "state") ||
      hasSearchParam(searchParams, "city") ||
      hasSearchParam(searchParams, "category")
    ) {
      return true;
    }
  } else {
    if ((mergedTrip.city || "") !== (url.city || "")) return true;
    if ((mergedTrip.state || "") !== (url.state || "")) return true;
    if ((mergedTrip.category || "all") !== (url.category || "all")) return true;
  }

  const urlIn = url.checkIn?.getTime?.() ?? null;
  const mergedIn = mergedTrip.checkIn?.getTime?.() ?? null;
  if (urlIn !== mergedIn) return true;

  const urlOut = url.checkOut?.getTime?.() ?? null;
  const mergedOut = mergedTrip.checkOut?.getTime?.() ?? null;
  if (urlOut !== mergedOut) return true;

  const g = normalizeGuests(url.guests);
  const m = normalizeGuests(mergedTrip.guests);
  if (g.adults !== m.adults || g.children !== m.children || g.rooms !== m.rooms) return true;
  if (serializeChildAgesParam(g.childAges) !== serializeChildAgesParam(m.childAges)) return true;

  return false;
}

/** Plain strings for passing trip from Server Components to Client Components. */
export function serializeTripForClient(trip) {
  return {
    category: trip?.category || "all",
    city: String(trip?.city || "").trim(),
    state: String(trip?.state || "").trim(),
    locationKind:
      trip?.locationKind === "state" || trip?.locationKind === "city"
        ? trip.locationKind
        : null,
    checkIn: trip?.checkIn ? toDateParam(trip.checkIn) : "",
    checkOut: trip?.checkOut ? toDateParam(trip.checkOut) : "",
    guests: normalizeGuests(trip?.guests),
  };
}

export function buildListingsUrlPreservingFilters(searchParams, trip) {
  const base =
    searchParams instanceof URLSearchParams
      ? searchParams
      : new URLSearchParams(searchParams?.toString?.() || "");
  return buildListingsUrlFromParams(applyTripToParams(base, trip), trip);
}

/** Normalize listings page URL for comparing whether a search will change the route. */
export function normalizeListingsSearchPageUrl(pathname, searchParams) {
  const path = String(pathname || "").split("?")[0];
  const params =
    searchParams instanceof URLSearchParams
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams(searchParams?.toString?.() || "");

  if (isListingsSlugPath(path)) {
    params.delete("city");
    params.delete("state");
    params.delete("locationKind");
    params.delete("category");
    params.delete("propertyType");
  }

  const keys = [...params.keys()].sort();
  const normalized = new URLSearchParams();
  for (const key of keys) {
    const value = params.get(key);
    if (value != null) normalized.set(key, value);
  }

  const qs = normalized.toString();
  return qs ? `${path}?${qs}` : path;
}

export function listingsSearchWillNavigate(pathname, searchParams, trip) {
  if (!isListingsSlugPath(pathname) && pathname !== "/listings") return false;

  const params =
    searchParams instanceof URLSearchParams
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams(searchParams?.toString?.() || "");

  const nextUrl = buildListingsUrlPreservingFilters(params, trip);
  const [nextPath, nextQs = ""] = nextUrl.split("?");
  const current = normalizeListingsSearchPageUrl(pathname, searchParams);
  const next = normalizeListingsSearchPageUrl(nextPath, new URLSearchParams(nextQs));
  return current !== next;
}
