"use client";

import { useCallback, useState } from "react";
import PackageEnquiryForm from "@/components/booking/PackageEnquiryForm";
import HomeRail, { RailCard } from "@/components/packages/HomeRail";
import {
  formatFromPrice,
  getInternationalCountries,
  STATIC_SEARCH_COUNTRIES,
} from "@/lib/tourDestinations";
import { getStateImage } from "@/components/state/stateImageMap";
import { limitItems } from "@/lib/limitItems";

const TRUST_ITEMS = [
  `${STATIC_SEARCH_COUNTRIES.length}+ Countries`,
  "Best Price Guarantee",
  "Visa Assistance",
  "24/7 Support",
  "Easy EMI Options",
];

// Fills anything the admin left blank from the built-in country list
function toCountryCard(item, builtIn) {
  return {
    name: item.name,
    tagline: item.tagline || builtIn?.tagline || "",
    fromPrice: item.fromPrice ?? builtIn?.fromPrice ?? 0,
    image: item.image || builtIn?.image || getStateImage(""),
    featured: item.featured,
  };
}

export default function PackagesExploreCountries({ config = null }) {
  const [enquiry, setEnquiry] = useState(null);
  const closeEnquiry = useCallback(() => setEnquiry(null), []);

  // Clicking a country opens the query form instead of a listing page
  const openEnquiry = useCallback(
    (country) =>
      setEnquiry({
        id: `country-${country.name}`,
        title: `${country.name} tour`,
        duration: "Flexible",
        location: country.name,
        country: country.name,
        state: "",
        city: "",
        destination: country.name,
        image: country.image,
      }),
    []
  );
  const all = getInternationalCountries();

  // Admin-managed order when available, otherwise featured first (original behaviour)
  const countries = config?.items?.length
    ? limitItems(config.items, config.maxVisible).map((item) =>
        toCountryCard(item, all.find((c) => c.name.toLowerCase() === item.name.toLowerCase()))
      )
    : [...all.filter((c) => c.featured), ...all.filter((c) => !c.featured)].slice(0, 12);

  return (
    <>
      <HomeRail
        id="countries"
        title={config?.title || "Countries"}
        subtitle="International destinations beyond India"
        footer={
          <ul className="mt-5 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
            {TRUST_ITEMS.map((label) => (
              <li
                key={label}
                className="rounded-full border border-orange-100 bg-brand-muted px-3.5 py-1.5 text-xs font-bold text-stone-800"
              >
                {label}
              </li>
            ))}
          </ul>
        }
      >
        {countries.map((country) => (
          <RailCard
            key={country.name}
            onClick={() => openEnquiry(country)}
            ariaLabel={`Enquire about ${country.name} tour packages`}
            image={country.image}
            title={country.name}
            sub={country.tagline}
            price={formatFromPrice(country.fromPrice)}
            badge={country.featured ? "Popular" : undefined}
          />
        ))}
      </HomeRail>

      <PackageEnquiryForm open={Boolean(enquiry)} onClose={closeEnquiry} tourPackage={enquiry} />
    </>
  );
}
