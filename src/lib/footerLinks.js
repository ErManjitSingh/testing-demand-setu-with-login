import { fetchHotelStatesList } from "@/lib/locationResolve";
import { buildListingsSlugPath, toLocationSlug } from "@/lib/listingsSlug";

export const FOOTER_DESTINATION_NAMES = [
  "Ladakh",
  "Himachal Pradesh",
  "Rajasthan",
  "Kerala",
  "Goa",
];

export const FOOTER_SERVICES = [
  { label: "Tour Packages", href: "/" },
  { label: "Hotels", href: "/hotels" },
  { label: "Flights", href: "/flights" },
  { label: "Transport", href: "/transport" },
];

export async function getFooterDestinations() {
  const apiStates = await fetchHotelStatesList();

  return FOOTER_DESTINATION_NAMES.map((name) => {
    const slug = toLocationSlug(name);
    const matched =
      apiStates.find((state) => toLocationSlug(state) === slug) || name;

    return {
      label: matched,
      href: buildListingsSlugPath({ category: "hotel", state: matched }),
    };
  });
}
