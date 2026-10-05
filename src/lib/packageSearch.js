import { BUDGET_PRESETS, createDefaultFilters, filtersToQuery } from "@/lib/packageFilters";
import { getPackagePriceBounds } from "@/lib/tourPackageMeta";

/** Destination suggestions (places, states, countries, package names) for the search combobox. */
export function buildSearchSuggestions(allPackages = []) {
  const seen = new Set();
  const items = [];
  const add = (label, hint, popular = false) => {
    if (!label || seen.has(label.toLowerCase())) return;
    seen.add(label.toLowerCase());
    items.push({ label, hint, popular });
  };
  allPackages
    .filter((p) => p.famous)
    .slice(0, 6)
    .forEach((p) => add(p.location, `${p.title} · from ₹${p.price.toLocaleString("en-IN")}`, true));
  allPackages.forEach((p) => {
    add(p.location, `${p.title} · ${p.duration}`);
    add(p.state, `${p.country} · ${p.title}`);
    add(p.country, "Country");
  });
  allPackages.forEach((p) => add(p.title, `${p.duration} · ${p.location}`));
  return items;
}

/** Turn a search draft ({ q, date, travellers, budget }) into a `/packages?...` URL. */
export function buildSearchHref(draft = {}) {
  const defaults = createDefaultFilters();
  const bounds = getPackagePriceBounds();
  const preset = BUDGET_PRESETS.find((b) => b.id === draft.budget) ?? BUDGET_PRESETS[0];
  const query = filtersToQuery({
    ...defaults,
    q: draft.q ?? "",
    date: draft.date ?? "",
    travellers: draft.travellers ?? defaults.travellers,
    price: [preset.min ?? bounds.min, preset.max ?? bounds.max],
  });
  return `/packages${query ? `?${query}` : ""}`;
}
