import { fetchListingsForLocation } from "@/lib/hotelListingsApi";
import ListingsFilteredCatalog from "@/components/listings/ListingsFilteredCatalog";

export default async function ApiListingsResults({
  city = "",
  state = "",
  activeCat,
  label,
}) {
  const { listings, city: displayCity, state: displayState } =
    await fetchListingsForLocation({ city, state });

  return (
    <ListingsFilteredCatalog
      listings={listings}
      activeCat={activeCat}
      label={label}
      selectedCity={displayCity}
      selectedState={displayState}
      locationFilterMode
    />
  );
}
