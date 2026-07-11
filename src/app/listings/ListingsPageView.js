import { Suspense } from "react";
import ListingsTripHydrator from "@/components/listings/ListingsTripHydrator";
import ListingsScrollToResults from "@/components/listings/ListingsScrollToResults";
import ListingsSearchLogger from "@/components/listings/ListingsSearchLogger";
import ListingsHero from "@/components/listings/ListingsHero";
import ListingsSeoContent from "@/components/listings/ListingsSeoContent";
import ListingsSeoSchema from "@/components/listings/ListingsSeoSchema";
import ApiListingsResults from "@/components/listings/ApiListingsResults";
import ListingsResultsSkeleton from "@/components/listings/ListingsResultsSkeleton";
import CategoryPills from "@/components/CategoryPills";
import { getCategoryLabel, CATEGORIES } from "@/lib/listings";
import { HOME_PAGE_STATE } from "@/lib/hotelListingsApi";
import { fetchSeoListingRecord } from "@/lib/seoListingApi";
import { getDefaultListingsDirectUrlDates, toDateParam } from "@/lib/dates";

export const listingsMetadata = {
  title: "Explore Stays | Demand Setu",
  description: "Browse hotels, Airbnbs, homestays and villas across India.",
};

function parsePositiveInt(value, fallback) {
  const num = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return num;
}

function parseNonNegativeInt(value, fallback) {
  const num = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(num) || num < 0) return fallback;
  return num;
}

export default async function ListingsPageView({ searchParams }) {
  const params = await searchParams;
  const category = params?.category ?? "all";
  const selectedCity = String(params?.city || "").trim();
  const selectedState = String(params?.state || "").trim();
  const locationKind = params?.locationKind ?? null;
  const apiCity = selectedCity;
  const apiState = selectedState || (!selectedCity ? HOME_PAGE_STATE : "");
  const displayCity = selectedCity;
  const displayState = selectedState || (!selectedCity ? HOME_PAGE_STATE : "");
  const label = getCategoryLabel(category);
  const activeCat = category === "all" ? "all" : category;
  const categoryMeta = CATEGORIES.find((c) => c.id === category);
  const listingDefaultDates = getDefaultListingsDirectUrlDates();
  const hasLocationContext = Boolean(displayCity || displayState);
  const initialCheckIn =
    String(params?.checkIn || "").trim() ||
    (hasLocationContext ? toDateParam(listingDefaultDates.checkIn) : "");
  const initialCheckOut =
    String(params?.checkOut || "").trim() ||
    (hasLocationContext ? toDateParam(listingDefaultDates.checkOut) : "");
  const initialAdults = parsePositiveInt(params?.adults, 2);
  const initialChildren = parseNonNegativeInt(params?.children, 0);
  const initialRooms = parsePositiveInt(params?.rooms, 1);
  const initialGuests = {
    adults: initialAdults,
    children: initialChildren,
    rooms: initialRooms,
  };

  const seoRecord =
    category !== "all"
      ? await fetchSeoListingRecord(
          category,
          apiCity,
          apiState,
          locationKind || (apiState && !apiCity ? "state" : null)
        )
      : null;

  const heroCover =
    seoRecord?.images?.[0]?.preview ||
    categoryMeta?.cover ||
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1400&q=80";

  const heroDescription =
    seoRecord?.subHeading ||
    (displayCity
      ? `${displayCity} stays handpicked for unforgettable memories.`
      : displayState
        ? `${displayState} stays handpicked for unforgettable memories.`
        : category === "all"
          ? "Hotels, villas & unique stays for unforgettable memories."
          : (categoryMeta?.description ??
            `${label} across India — handpicked for unforgettable memories.`));

  return (
    <div className="min-h-screen bg-background">
      <ListingsSeoSchema seo={seoRecord} />
      <Suspense fallback={null}>
        <ListingsScrollToResults />
      </Suspense>
      <Suspense fallback={null}>
        <ListingsTripHydrator />
      </Suspense>
      <ListingsSearchLogger
        category={category}
        city={displayCity}
        state={displayState}
        locationKind={locationKind || (displayState && !displayCity ? "state" : null)}
        checkIn={initialCheckIn || null}
        checkOut={initialCheckOut || null}
        guests={initialGuests}
      />
      <ListingsHero
        category={category}
        cover={heroCover}
        description={heroDescription}
        seo={seoRecord}
        initialCity={displayCity}
        initialState={displayState}
        initialLocationKind={locationKind || (displayState && !displayCity ? "state" : null)}
        initialCheckIn={initialCheckIn}
        initialCheckOut={initialCheckOut}
        initialAdults={initialAdults}
        initialChildren={initialChildren}
        initialRooms={initialRooms}
      />

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10">
        <CategoryPills activeCategory={activeCat} />

        <Suspense
          key={`${apiCity}|${apiState}|${category}`}
          fallback={<ListingsResultsSkeleton activeCategory={activeCat} />}
        >
          <ApiListingsResults
            city={apiCity}
            state={apiState}
            activeCat={activeCat}
            label={label}
          />
        </Suspense>

        {seoRecord && <ListingsSeoContent seo={seoRecord} />}
      </div>
    </div>
  );
}
