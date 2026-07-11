import { addDays, nightsBetween, parseDateParam, toDateParam } from "@/lib/dates";
import { getBaseTotalWithGst } from "@/lib/bookingPricing";

function getCityName(listing = {}) {
  const location = String(listing.location || "").trim();
  if (location.includes(",")) {
    return location.split(",")[0].trim();
  }
  return location || listing.region || "";
}

function buildDaysWithDates(checkIn, checkOut, nights) {
  const start =
    typeof checkIn === "string"
      ? parseDateParam(checkIn)
      : checkIn instanceof Date
        ? checkIn
        : null;

  if (!start) {
    return [];
  }

  const nightCount = nights || nightsBetween(start, checkOut, 1);
  const days = [];

  for (let index = 0; index < nightCount; index += 1) {
    days.push({
      day: index + 1,
      date: toDateParam(addDays(start, index)),
    });
  }

  return days;
}

function getLineItemExtraBedCount(item) {
  const details = Array.isArray(item?.roomDetails) ? item.roomDetails : [];
  if (details.length) {
    return details.reduce((sum, room) => {
      const extra = Math.max(0, Number(room.effectiveAdults) || 2) - 2;
      return sum + extra;
    }, 0);
  }
  return 0;
}

function getNightlyBaseCost(item) {
  const nights = Math.max(1, Number(item.nights) || 1);
  const base = Number(item.baseSubtotal ?? item.subtotal ?? 0);
  return Math.round(base / nights);
}

function getNightlyExtraAdultRate(item) {
  const nights = Math.max(1, Number(item.nights) || 1);
  const extraSubtotal = Number(item.extraAdultSubtotal) || 0;
  if (!extraSubtotal) return 0;

  const extraBeds = getLineItemExtraBedCount(item);
  if (!extraBeds) {
    return Math.round(extraSubtotal / nights);
  }

  return Math.round(extraSubtotal / (nights * extraBeds));
}

function buildHotelsFromLineItems({ lineItems, daysWithDates, cityName, propertyName }) {
  const hotels = [];

  for (const { day } of daysWithDates) {
    for (const item of lineItems) {
      hotels.push({
        day,
        cityName,
        propertyName,
        mealPlan: item.mealPlan || "EP",
        hotelemail: "na",
        roomName: item.roomName || item.categoryLabel || "Room",
        roomimage: null,
        roomcount: String(item.roomCount ?? 1),
        extrabedcount: 0,
        cost: getNightlyBaseCost(item),
        extraAdultRate: getNightlyExtraAdultRate(item),
        similarhotel: [],
      });
    }
  }

  return hotels;
}

function buildHotelsForStandardStay({
  daysWithDates,
  cityName,
  propertyName,
  guests,
  nightly,
}) {
  const roomCount = Math.max(1, Number(guests?.rooms) || 1);
  const adults = Math.max(1, Number(guests?.adults) || 2);
  const extraBeds = Math.max(0, adults - roomCount * 2);

  return daysWithDates.map(({ day }) => ({
    day,
    cityName,
    propertyName,
    mealPlan: "EP",
    hotelemail: "na",
    roomName: "Standard Room",
    roomimage: null,
    roomcount: String(roomCount),
    extrabedcount: String(extraBeds),
    cost: Math.round(Number(nightly) || 0),
    extraAdultRate: 0,
    similarhotel: [],
  }));
}

function getTotalExtraBeds(lineItems, guests) {
  if (lineItems.length) {
    return lineItems.reduce((sum, item) => sum + getLineItemExtraBedCount(item), 0);
  }

  const roomCount = Math.max(1, Number(guests?.rooms) || 1);
  const adults = Math.max(1, Number(guests?.adults) || 2);
  return Math.max(0, adults - roomCount * 2);
}

/**
 * Maps checkout data into POST body for /api/hotelbooking/create.
 * Field names match the backend schema exactly.
 */
export function buildHotelBookingCreatePayload({
  inventoryBookingId,
  listing = {},
  submitPayload = {},
  lineItems = [],
  nightly = 0,
}) {
  const stay = submitPayload.stay || {};
  const guests = submitPayload.guests || {};
  const guest = submitPayload.guest || {};
  const pricing = submitPayload.pricing || {};

  const cityName = getCityName(listing);
  const propertyName = listing.title || submitPayload.property?.title || "";
  const nights = stay.nights || nightsBetween(stay.checkIn, stay.checkOut, 1);
  const daysWithDates = buildDaysWithDates(stay.checkIn, stay.checkOut, nights);

  const hotels = lineItems.length
    ? buildHotelsFromLineItems({
        lineItems,
        daysWithDates,
        cityName,
        propertyName,
      })
    : buildHotelsForStandardStay({
        daysWithDates,
        cityName,
        propertyName,
        guests,
        nightly,
      });

  const totalRoomsValue =
    submitPayload.totalRooms ??
    guests.rooms ??
    (lineItems.length
      ? lineItems.reduce((sum, item) => sum + (Number(item.roomCount) || 0), 0)
      : 1);
  const totalRooms = String(totalRoomsValue || 1);

  return {
    bookingId: inventoryBookingId,
    cityName,
    contactInfo: {
      name: guest.fullName || `${guest.firstName || ""} ${guest.lastName || ""}`.trim(),
      email: guest.email || "",
      mobile: guest.mobile || "",
    },
    daysWithDates,
    hotels,
    numberOfGuests: {
      adults: String(guests.adults ?? 1),
      kids: String(guests.children ?? 0),
      extraBeds: 0,
    },
    numberOfRooms: totalRooms,
    propertyName,
    totalAmount: Number(pricing.payableTotal ?? pricing.total ?? 0),
    totalamountwith25: getBaseTotalWithGst(Number(pricing.subtotal ?? 0), {
      nights,
      nightlyTariff: lineItems.length ? null : nightly,
    }),
    bookingresponse: "pending",
    websiteid: submitPayload.websiteid || "",
  };
}
