"use client";

import { buildListingHref } from "@/lib/packageBooking";
import HomeRail, { RailCard } from "@/components/packages/HomeRail";
import { getStateImage } from "@/components/state/stateImageMap";
import {
  formatFromPrice,
  getStartingPrice,
  getStateCities,
  getStateTagline,
} from "@/lib/tourDestinations";
import { limitItems } from "@/lib/limitItems";

const STATE_ORDER = [
  "Rajasthan",
  "Kerala",
  "Himachal Pradesh",
  "Ladakh",
  "Goa",
  "Jammu & Kashmir",
  "Uttarakhand",
  "Sikkim",
  "Delhi",
  "Karnataka",
  "Maharashtra",
  "Gujarat",
  "Tamil Nadu",
  "West Bengal",
  "Uttar Pradesh",
  "Assam",
];

function pickStates(states, limit = 5) {
  const byKey = new Map(states.map((name) => [name.toLowerCase(), name]));
  const picked = [];
  for (const name of STATE_ORDER) {
    const hit = byKey.get(name.toLowerCase());
    if (hit) picked.push(hit);
  }
  for (const name of states) {
    if (picked.length >= limit) break;
    if (!picked.includes(name)) picked.push(name);
  }
  return picked.slice(0, limit);
}

// The rail scrolls, so it can show more than a fixed grid could
const MAX_STATE_TILES = 12;

export default function PackagesExploreStates({ states = [], config = null }) {
  // Admin-managed tiles when available, otherwise the built-in list
  const shown = config?.items?.length
    ? limitItems(config.items, config.maxVisible, MAX_STATE_TILES)
    : pickStates(states, MAX_STATE_TILES).map((name) => ({ name }));
  if (shown.length === 0) return null;

  return (
    <HomeRail
      id="states"
      title={config?.title || "States"}
      subtitle="Discover the diversity of India, state by state"
    >
      {shown.map((entry) => {
        const stateName = entry.name;
        const fromPrice = entry.fromPrice ?? getStartingPrice(stateName, 4999);
        const cities = getStateCities(stateName);
        return (
          <RailCard
            key={stateName}
            href={buildListingHref({ q: stateName })}
            ariaLabel={`${stateName} tour packages`}
            image={entry.image || getStateImage(stateName)}
            title={stateName}
            sub={entry.tagline || (cities.length > 0 ? cities.slice(0, 2).join(" · ") : getStateTagline(stateName))}
            price={formatFromPrice(fromPrice)}
          />
        );
      })}
    </HomeRail>
  );
}
