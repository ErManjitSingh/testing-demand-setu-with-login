import { nightsBetween, toDateParam } from "@/lib/dates";
import { buildBookUrl, persistTripSearch } from "@/lib/bookingSearch";
import { saveRoomSelection } from "@/lib/roomSelectionStorage";

export function getEffectiveSelectedRooms(selection) {
  if (selection?.customRoomSlots?.length) {
    return selection.customRoomSlots.length;
  }
  return selection?.totalSelectedRooms || 0;
}

export function hasActiveRoomSelection(selection) {
  return Boolean(selection?.hasInventory && getEffectiveSelectedRooms(selection) > 0);
}

export function saveAndNavigateToBooking({
  listing,
  selection,
  pricing,
  router,
  pathname,
  searchParams,
}) {
  const guests = selection.guests;
  const nextTrip = {
    category: selection.trip?.category,
    city: selection.trip?.city || "",
    state: selection.trip?.state || "",
    checkIn: selection.checkIn,
    checkOut: selection.checkOut,
    guests,
  };

  persistTripSearch(nextTrip, { router, pathname, searchParams, listing });

  const bookBase = buildBookUrl(listing, nextTrip);
  const [bookPath, bookQs = ""] = bookBase.split("?");
  const params = new URLSearchParams(bookQs);
  params.set("total", String(pricing.total));
  params.set("subtotal", String(pricing.subtotal));
  params.set("gst", String(pricing.gst));
  params.set("roomsSelected", String(getEffectiveSelectedRooms(selection)));
  params.set("inventory", "1");

  const nights = nightsBetween(selection.checkIn, selection.checkOut, 1);

  saveRoomSelection(listing.slug, {
    checkIn: toDateParam(selection.checkIn),
    checkOut: toDateParam(selection.checkOut),
    guests,
    lineItems: selection.selectionLineItems || [],
    customRoomSlots: selection.customRoomSlots || null,
    subtotal: pricing.subtotal,
    gst: pricing.gst,
    total: pricing.total,
    totalRooms: getEffectiveSelectedRooms(selection),
    nights,
  });

  router.push(`${bookPath}?${params.toString()}`, { scroll: false });
}
