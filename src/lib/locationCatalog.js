import { fromLocationSlug, toLocationSlug } from "@/lib/listingsSlug";

export function toTitleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (lower === "&") return "&";
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

export function normalizeStateName(raw) {
  const cleaned = String(raw || "")
    .replace(/^[,\s]+/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return "";

  const lowered = cleaned.toLowerCase();
  const aliases = {
    delhi: "Delhi",
    gujrat: "Gujarat",
    kerela: "Kerala",
    himachal: "Himachal Pradesh",
    "himachal prades": "Himachal Pradesh",
    arunanchal: "Arunachal Pradesh",
    meghalya: "Meghalaya",
    maharastra: "Maharashtra",
    "jammu and kashmir": "Jammu & Kashmir",
    srilanka: "Sri Lanka",
    tamilnadu: "Tamil Nadu",
    uttrakhand: "Uttarakhand",
    leh: "Ladakh",
    "leh ladakh": "Ladakh",
  };

  if (aliases[lowered]) return aliases[lowered];
  return toTitleCase(cleaned);
}

export function normalizeCityName(raw) {
  return String(raw || "").trim();
}

export function normalizeLocationList(rawItems, normalizeItem = normalizeCityName) {
  const seen = new Set();
  const out = [];

  for (const item of rawItems || []) {
    const value = normalizeItem(item);
    if (!value) continue;
    const dedupeKey = value.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    out.push(value);
  }

  return out.sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}

/** Match slug or label to exact API city/state names from catalog lists. */
export function resolveLocationFromCatalog(nameOrSlug, { cities = [], states = [] } = {}) {
  const slug = toLocationSlug(nameOrSlug);
  if (!slug) return { city: "", state: "", kind: null, ambiguous: false };

  const cityMatch = cities.find((city) => toLocationSlug(city) === slug) || "";
  const stateMatch = states.find((state) => toLocationSlug(state) === slug) || "";

  if (stateMatch && !cityMatch) {
    return { city: "", state: stateMatch, kind: "state", ambiguous: false };
  }
  if (cityMatch && !stateMatch) {
    return { city: cityMatch, state: "", kind: "city", ambiguous: false };
  }
  if (cityMatch && stateMatch) {
    return { city: cityMatch, state: stateMatch, kind: null, ambiguous: true };
  }

  return { city: "", state: "", kind: null, ambiguous: false, label: fromLocationSlug(slug) };
}

/** Apply explicit city/state selection kind (from picker or state cards). */
export function applyLocationKind(resolved, kind) {
  if (!kind || !resolved) return resolved;

  if (kind === "state") {
    const name = resolved.state || resolved.city || resolved.label || "";
    return { city: "", state: name, kind: "state", ambiguous: false };
  }
  if (kind === "city") {
    const name = resolved.city || resolved.state || resolved.label || "";
    return { city: name, state: "", kind: "city", ambiguous: false };
  }

  if (!resolved.ambiguous) return resolved;
  return resolved;
}

/**
 * Normalize trip location using API catalog + what the user picked (city vs state).
 * @returns {{ city: string, state: string, kind: 'city'|'state'|null }}
 */
export function normalizeTripLocation(
  { city = "", state = "", kind = null } = {},
  catalog = {}
) {
  const c = String(city || "").trim();
  const s = String(state || "").trim();

  if (kind === "state") {
    const name = s || c;
    if (!name) return { city: "", state: "", kind: null };
    const resolved = resolveLocationFromCatalog(name, catalog);
    const withKind = applyLocationKind(resolved, "state");
    return { city: "", state: withKind.state || name, kind: "state" };
  }

  if (kind === "city") {
    const name = c || s;
    if (!name) return { city: "", state: "", kind: null };
    const resolved = resolveLocationFromCatalog(name, catalog);
    const withKind = applyLocationKind(resolved, "city");
    return { city: withKind.city || name, state: "", kind: "city" };
  }

  if (s && !c) {
    const resolved = resolveLocationFromCatalog(s, catalog);
    if (resolved.kind === "state") {
      return { city: "", state: resolved.state, kind: "state" };
    }
    if (resolved.kind === "city") {
      return { city: resolved.city, state: "", kind: "city" };
    }
    return { city: "", state: s, kind: "state" };
  }

  if (c && !s) {
    const resolved = resolveLocationFromCatalog(c, catalog);
    if (resolved.kind === "state") {
      return { city: "", state: resolved.state, kind: "state" };
    }
    if (resolved.kind === "city") {
      return { city: resolved.city, state: "", kind: "city" };
    }
    return { city: c, state: "", kind: "city" };
  }

  const label = c || s;
  if (!label) return { city: "", state: "", kind: null };

  const resolved = resolveLocationFromCatalog(label, catalog);
  if (resolved.kind === "state") {
    return { city: "", state: resolved.state, kind: "state" };
  }
  if (resolved.kind === "city") {
    return { city: resolved.city, state: "", kind: "city" };
  }
  if (resolved.ambiguous) {
    return { city: "", state: "", kind: null };
  }

  return { city: label, state: "", kind: "city" };
}
