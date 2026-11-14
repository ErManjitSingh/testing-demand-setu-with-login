"use client";

import { buildListingHref } from "@/lib/packageBooking";
import { useMemo } from "react";
import HomeRail, { RailCard } from "@/components/packages/HomeRail";
import {
  formatFromPrice,
  getCityImage,
  getCityMeta,
  getPopularCities,
} from "@/lib/tourDestinations";
import { limitItems } from "@/lib/limitItems";

export default function PackagesPopularCities({ cities = [], config = null }) {
  // Admin-managed cities when available, otherwise the built-in popular list
  const displayCities = useMemo(
    () =>
      config?.items?.length
        ? limitItems(config.items, config.maxVisible)
        : getPopularCities(cities, 12).map((name) => ({ name })),
    [cities, config]
  );

  if (displayCities.length === 0) return null;

  return (
    <HomeRail
      id="cities"
      title={config?.title || "Cities"}
      subtitle="From metros to hill stations — pick a city and we'll plan the rest"
    >
      {displayCities.map((entry) => {
        const cityName = entry.name;
        const builtIn = getCityMeta(cityName);
        const meta = {
          tagline: entry.tagline || builtIn.tagline,
          fromPrice: entry.fromPrice ?? builtIn.fromPrice,
        };
        return (
          <RailCard
            key={cityName}
            href={buildListingHref({ place: cityName })}
            ariaLabel={`${cityName} tour packages`}
            image={entry.image || getCityImage(cityName)}
            title={cityName}
            sub={meta.tagline}
            price={formatFromPrice(meta.fromPrice)}
          />
        );
      })}
    </HomeRail>
  );
}
