import { redirect } from "next/navigation";
import { buildListingsSearchUrl, parseTripFromSearchParams } from "@/lib/bookingSearch";

export { listingsMetadata as metadata } from "./ListingsPageView";

/** Legacy /listings?... URLs redirect to the slug form. */
export default async function ListingsPage({ searchParams }) {
  const params = await searchParams;
  const trip = parseTripFromSearchParams(params);
  const hasExplicitCategory = Boolean(String(params?.category ?? "").trim());
  redirect(
    buildListingsSearchUrl({
      category: hasExplicitCategory ? trip.category : "hotel",
      city: trip.city,
      state: trip.state,
      checkIn: trip.checkIn,
      checkOut: trip.checkOut,
      guests: trip.guests,
      extraParams: params,
    })
  );
}
