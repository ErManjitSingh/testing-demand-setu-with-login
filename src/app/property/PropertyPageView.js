import PropertyCard from "@/components/PropertyCard";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyRooms from "@/components/property/PropertyRooms";
import PropertyAmenities from "@/components/property/PropertyAmenities";
import PropertyBookingCard from "@/components/property/PropertyBookingCard";
import PropertyBookingShell from "@/components/property/PropertyBookingShell";
import PropertyBookingPolicy from "@/components/property/PropertyBookingPolicy";
import PropertyMobileBar from "@/components/property/PropertyMobileBar";
import PropertyTripHydrator from "@/components/property/PropertyTripHydrator";
import PropertyBreadcrumb from "@/components/property/PropertyBreadcrumb";
import PropertyNavTabs from "@/components/property/PropertyNavTabs";
import PropertyStarRating from "@/components/property/PropertyStarRating";
import PropertyLocationMap from "@/components/property/PropertyLocationMap";
import SectionHeading from "@/components/SectionHeading";
import { getListingsByCategory, SAMPLE_REVIEWS } from "@/lib/listings";
import { fillMissingListingsTripDefaults, hasSearchParam, parseTripFromSearchParams, serializeTripForClient } from "@/lib/bookingSearch";
import {
  getPropertyRooms,
  getPropertyAmenityGroups,
  getPropertyGallery,
} from "@/lib/property";
import {
  getApiPropertyAbout,
  getApiPropertyAddress,
  getApiPropertyAmenityGroups,
  getApiPropertyGallery,
  getApiPropertyPolicies,
  getApiPropertyRooms,
} from "@/lib/propertyFromApi";
import { attachInventoryToRooms } from "@/lib/propertyInventory";
import { applyPropertyPriceMarkup } from "@/lib/bookingPricing";

function withPropertyListingPrices(listing) {
  return {
    ...listing,
    price: applyPropertyPriceMarkup(listing.price),
    originalPrice: listing.originalPrice
      ? applyPropertyPriceMarkup(listing.originalPrice)
      : listing.originalPrice,
  };
}

function withPropertyRoomPrices(room) {
  return {
    ...room,
    price: applyPropertyPriceMarkup(room.price),
  };
}

const RATING_BARS = [
  { label: "Cleanliness", pct: 96 },
  { label: "Accuracy", pct: 94 },
  { label: "Communication", pct: 98 },
  { label: "Location", pct: 92 },
  { label: "Value", pct: 90 },
];

export function buildPropertyMetadata(resolved) {
  if (!resolved) return { title: "Property | Demand Setu" };
  const { listing } = resolved;
  return {
    title: `${listing.title} | Demand Setu`,
    description: listing.description,
  };
}

export default async function PropertyPageView({ resolved, searchParams }) {
  const query = await searchParams;
  const { listing, hotel, source } = resolved;
  const isApi = source === "api";
  const propertyState = isApi
    ? String(hotel?.location?.state || listing.region || "").trim()
    : String(listing.region || "").trim();
  const propertyCity = isApi
    ? String(hotel?.location?.city || listing.propertyCity || "").trim()
    : String(listing.location || "").split(",")[0]?.trim() || "";

  const tripParsed = parseTripFromSearchParams(query);
  const hasUrlDates =
    hasSearchParam(query, "checkIn") && hasSearchParam(query, "checkOut");
  const trip = hasUrlDates
    ? tripParsed
    : fillMissingListingsTripDefaults({
        ...tripParsed,
        city: tripParsed.city || propertyCity,
        state: tripParsed.state || propertyState,
      });
  const initialTrip = serializeTripForClient({
    ...trip,
    category: trip.category !== "all" ? trip.category : listing.category,
    state: trip.state || propertyState,
    city: trip.city || propertyCity,
  });

  const gallery = isApi
    ? getApiPropertyGallery(hotel, listing)
    : getPropertyGallery(listing);
  const rooms = (isApi
    ? attachInventoryToRooms(getApiPropertyRooms(hotel, listing), hotel?.inventory?.b2c)
    : getPropertyRooms(listing)
  ).map(withPropertyRoomPrices);
  const inventoryB2c = isApi ? hotel?.inventory?.b2c || null : null;
  const amenityGroups = isApi
    ? getApiPropertyAmenityGroups(hotel)
    : getPropertyAmenityGroups(listing);
  const apiPolicies = isApi ? getApiPropertyPolicies(hotel) : null;
  const aboutText = isApi
    ? getApiPropertyAbout(hotel, listing)
    : listing.description;
  const fullAddress = isApi ? getApiPropertyAddress(hotel) : listing.location;

  const defaultRoomPrice = rooms[0]?.price ?? listing.price;
  const maxRoomGuests = rooms.reduce(
    (max, room) => Math.max(max, room.guests || 0),
    listing.guests || 2
  );
  const listingForBooking = withPropertyListingPrices({
    ...listing,
    guests: maxRoomGuests,
  });

  const similar = isApi
    ? []
    : getListingsByCategory(listing.category)
        .filter((l) => l.slug !== listing.slug)
        .slice(0, 3);

  const showReviews = !isApi && listing.reviews > 0;
  const aboutPreview =
    aboutText.length > 220 ? `${aboutText.slice(0, 220).trim()}...` : aboutText;

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <PropertyTripHydrator
        listing={listingForBooking}
        propertyState={propertyState}
        propertyCity={propertyCity}
      />

      <div className="border-b border-[#e0e0e0] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <PropertyBreadcrumb
            listing={listing}
            city={trip.city || propertyCity}
            state={trip.state || propertyState}
            category={listing.category}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:py-6 lg:pb-6">
        <PropertyGallery title={listing.title} images={gallery} />

        <PropertyBookingShell
          inventoryB2c={inventoryB2c}
          rooms={rooms}
          initialTrip={initialTrip}
          propertyState={propertyState}
        >
          <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6">
            <div className="min-w-0">
              <div className="rounded-sm border border-[#e0e0e0] bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl lg:text-[28px]">
                      {listing.title}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <PropertyStarRating badge={listing.badge} rating={listing.rating} />
                      {listing.badge && (
                        <span className="text-xs font-semibold text-[#757575]">
                          {listing.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-[#4a4a4a]">
                      {listing.location}
                      {listing.region ? `, ${listing.region}` : ""}
                      {" · "}
                      <a href="#location" className="font-semibold text-brand hover:underline">
                        See on Map
                      </a>
                    </p>
                  </div>
                  {showReviews && (
                    <div className="shrink-0 rounded-sm border border-[#e0e0e0] bg-[#f8fffb] px-4 py-3 text-center">
                      <p className="text-2xl font-bold text-[#1a1a1a]">{listing.rating}</p>
                      <p className="text-xs font-semibold text-[#2e7d32]">Excellent</p>
                      <p className="text-[11px] text-[#757575]">{listing.reviews} reviews</p>
                    </div>
                  )}
                </div>

                <p id="overview" className="mt-4 scroll-mt-44 text-sm leading-relaxed text-[#4a4a4a]">
                  {aboutPreview}
                  {aboutText.length > 220 && (
                    <a href="#about-full" className="ml-1 font-semibold text-brand hover:underline">
                      Read more
                    </a>
                  )}
                </p>
              </div>

              <PropertyNavTabs showReviews={showReviews} />

              {rooms.length > 0 && (
                <div className="mt-4">
                  <PropertyRooms rooms={rooms} propertyName={listing.title} />
                </div>
              )}

              <div id="about-full" className="mt-4 scroll-mt-44 rounded-sm border border-[#e0e0e0] bg-white p-4 sm:p-5">
                <h2 className="text-lg font-bold text-[#1a1a1a]">About Property</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#4a4a4a]">
                  {aboutText}
                </p>
              </div>

              {amenityGroups.length > 0 && (
                <div className="mt-4 rounded-sm border border-[#e0e0e0] bg-white p-4 sm:p-5">
                  <PropertyAmenities groups={amenityGroups} rating={listing.rating} />
                </div>
              )}

              <section
                id="location"
                className="mt-4 scroll-mt-44 rounded-sm border border-[#e0e0e0] bg-white p-4 sm:p-5"
              >
                <h2 className="text-lg font-bold text-[#1a1a1a]">
                  {listing.title} Location
                </h2>
                <p className="mt-2 text-sm text-[#4a4a4a]">{fullAddress || listing.location}</p>
                <PropertyLocationMap
                  propertyName={listing.title}
                  address={fullAddress || listing.location}
                  className="mt-4"
                />
              </section>

              <div className="mt-4 rounded-sm border border-[#e0e0e0] bg-white p-4 sm:p-5">
                <PropertyBookingPolicy
                  bookingPolicies={apiPolicies?.bookingPolicies}
                  quickReference={apiPolicies?.quickReference}
                />
              </div>

              {showReviews && (
                <section id="reviews" className="mt-4 scroll-mt-44 rounded-sm border border-[#e0e0e0] bg-white p-4 sm:p-5">
                  <h2 className="text-lg font-bold text-[#1a1a1a]">
                    Guest Reviews · {listing.rating}
                  </h2>
                  <div className="mt-4 grid gap-6 sm:grid-cols-[140px_1fr]">
                    <div className="text-center sm:text-left">
                      <p className="text-4xl font-bold">{listing.rating}</p>
                      <p className="mt-1 text-xs text-[#757575]">{listing.reviews} reviews</p>
                    </div>
                    <div className="space-y-2">
                      {RATING_BARS.map((bar) => (
                        <div key={bar.label} className="flex items-center gap-3">
                          <span className="w-24 shrink-0 text-xs text-[#757575]">{bar.label}</span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#efefef]">
                            <div
                              className="h-full rounded-full bg-brand"
                              style={{ width: `${bar.pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-xs font-semibold">{bar.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    {SAMPLE_REVIEWS.map((review) => (
                      <article
                        key={review.name}
                        className="border border-[#e8e8e8] bg-[#fafafa] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-xs font-bold text-white">
                            {review.avatar}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold">{review.name}</p>
                            <p className="text-xs text-[#757575]">{review.date}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-[#4a4a4a]">{review.text}</p>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {similar.length > 0 && (
                <div className="mt-8 lg:hidden">
                  <h2 className="text-lg font-bold text-[#1a1a1a]">Similar Hotels</h2>
                  <div className="mt-4 space-y-4">
                    {similar.map((item) => (
                      <PropertyCard key={item.slug} listing={item} variant="horizontal" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside
              id="book"
              className="mt-4 scroll-mt-44 lg:sticky lg:top-[10.5rem] lg:mt-0 lg:self-start"
            >
              <PropertyBookingCard
                listing={listingForBooking}
                selectedRoomPrice={defaultRoomPrice}
                initialTrip={initialTrip}
                propertyState={propertyState}
              />
            </aside>
          </div>
          <PropertyMobileBar listing={listingForBooking} price={defaultRoomPrice} />
        </PropertyBookingShell>

        {similar.length > 0 && (
          <section className="mt-10 hidden border-t border-[#e0e0e0] pt-8 lg:block">
            <SectionHeading
              eyebrow="Similar Hotels"
              title="You may also like"
              subtitle="More stays in the same area."
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {similar.map((item) => (
                <PropertyCard key={item.slug} listing={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
