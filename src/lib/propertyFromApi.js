import { isValidImageUrl, resolveListingImage } from "@/lib/listingImages";
import { mapApiPropertyTypeToCategory } from "@/lib/listingFilters";
import { BOOKING_POLICIES, buildMealPlans } from "@/lib/property";

const AMENITY_GROUP_LABELS = {
  mandatory: "Essential amenities",
  basicFacilities: "Basic facilities",
  generalServices: "General services",
  outdoorActivitiesAndSports: "Outdoor activities",
  commonArea: "Common areas",
  foodAndDrink: "Food & drink",
  healthAndWellness: "Health & wellness",
  businessCenterAndConferences: "Business & events",
  beautyAndSpa: "Beauty & spa",
  security: "Security",
  transfers: "Transfers",
  entertainment: "Entertainment",
  shopping: "Shopping",
  paymentServices: "Payment services",
  indoorActivitiesAndSports: "Indoor activities",
  familyAndKids: "Family & kids",
  petEssentials: "Pet essentials",
};

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function isTruthyAmenity(value) {
  const v = String(value ?? "").trim().toLowerCase();
  return v === "yes" || v === "true";
}

function formatLabel(key) {
  return String(key || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function formatPolicyValue(value) {
  const v = String(value || "").trim();
  if (!v) return "";
  return v
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function collectAmenityItems(group) {
  if (!group || typeof group !== "object") return [];
  return Object.entries(group)
    .filter(([name]) => name !== "_id")
    .filter(([, val]) => isTruthyAmenity(val))
    .map(([name]) => name.trim());
}

function collectRoomAmenities(selectedAmenities) {
  if (!selectedAmenities || typeof selectedAmenities !== "object") return [];
  const items = [];
  for (const group of Object.values(selectedAmenities)) {
    items.push(...collectAmenityItems(group));
  }
  return [...new Set(items)].slice(0, 8);
}

function inferDefaultMealPlan(mealOption) {
  const text = String(mealOption || "").toLowerCase();
  if (!text) return "EP";
  if (/all\s*meal|full\s*board|breakfast.*lunch.*dinner|\bap\b/.test(text)) return "AP";
  if (/breakfast.*dinner|lunch.*dinner|half\s*board|\bmap\b/.test(text)) return "MAP";
  if (/breakfast|continental|\bcp\b/.test(text)) return "CP";
  return "EP";
}

export function getApiPropertyGallery(hotel, listing) {
  const propertyImages = Array.isArray(hotel?.photosAndVideos?.images)
    ? hotel.photosAndVideos.images.filter(isValidImageUrl)
    : [];
  const roomImages = (hotel?.rooms?.data || [])
    .map((room) => room?.imageUrl)
    .filter(isValidImageUrl);

  const merged = [...new Set([...propertyImages, ...roomImages])].map((url) =>
    resolveListingImage(url, listing?.category || "hotel")
  );

  if (merged.length) return merged;
  return listing?.gallery?.length ? listing.gallery : [listing?.image].filter(Boolean);
}

export function getApiPropertyRooms(hotel, listing) {
  const category = listing?.category || mapApiPropertyTypeToCategory(hotel?.basicInfo?.propertyType);
  const rooms = Array.isArray(hotel?.rooms?.data) ? hotel.rooms.data : [];

  if (!rooms.length) {
    return [];
  }

  return rooms.map((room, index) => {
    const roomImage = resolveListingImage(room?.imageUrl, category);
    const price = Math.max(toNumber(room?.baseRate, listing?.price || 0), 1000);
    const sizeNum = String(room?.roomsizeinnumber || "").trim();
    const sizeUnit = String(room?.roomSize || "sq ft").trim();
    const size = sizeNum ? `${sizeNum} ${sizeUnit}` : sizeUnit;
    const mealOption = String(room?.mealOption || "").trim();
    const amenities = collectRoomAmenities(room?.selectedAmenities);

    return {
      id: String(room?._id || `room-${index}`),
      category: String(room?.roomType || "Standard").trim(),
      name: String(room?.roomName || room?.roomType || "Room").trim(),
      inventoryLabel: String(room?.roomName || room?.roomType || "Standard").trim(),
      image: roomImage,
      gallery: [roomImage].filter(Boolean),
      size,
      bed: String(room?.bedType || "Standard bed").trim(),
      view: String(room?.roomView || "").trim(),
      guests: Math.max(toNumber(room?.maxOccupancy, 2), 1),
      price,
      originalPrice: null,
      badge: room?.extraBed ? "Extra bed available" : null,
      defaultMealPlan: inferDefaultMealPlan(mealOption),
      amenities: amenities.length ? amenities : ["Air Conditioning", "Wifi"],
      available: Math.max(toNumber(room?.roomCount, 1), 1),
      mealPlans: buildMealPlans(price),
      smokingAllowed: String(room?.smokingAllowed || "").toLowerCase() === "yes",
      extraAdultCharge: toNumber(room?.extraAdultCharge, 0),
      childCharge: toNumber(room?.childCharge, 0),
    };
  });
}

export function getApiPropertyAmenityGroups(hotel) {
  const amenities = hotel?.amenities;
  if (!amenities || typeof amenities !== "object") return [];

  return Object.entries(amenities)
    .map(([key, group]) => ({
      title: AMENITY_GROUP_LABELS[key] || formatLabel(key),
      items: collectAmenityItems(group),
    }))
    .filter((group) => group.items.length > 0);
}

export function getApiPropertyHighlights(hotel, listing) {
  const basic = hotel?.basicInfo || {};
  const highlights = [];

  if (basic.hotelStarRating) {
    highlights.push({ icon: "★", label: basic.hotelStarRating });
  }
  if (basic.propertyBuiltYear) {
    highlights.push({ icon: "🏨", label: `Built ${basic.propertyBuiltYear}` });
  }
  if (basic.bookingSinceYear) {
    highlights.push({ icon: "📅", label: `On Demand Setu since ${basic.bookingSinceYear}` });
  }
  if (listing?.location) {
    highlights.push({ icon: "📍", label: listing.location });
  }
  if (basic.prefered) {
    highlights.push({ icon: "✓", label: "Preferred partner property" });
  }

  return highlights.length
    ? highlights
    : [
        { icon: "★", label: `${listing?.rating ?? "4.0"} guest rating` },
        { icon: "📍", label: listing?.location || "India" },
        { icon: "✓", label: "Instant confirmation" },
      ];
}

export function getApiPropertyPolicies(hotel) {
  const policies = hotel?.policies || {};
  const quickReference = [];

  if (policies.cancellationPolicy) {
    quickReference.push({
      label: "Cancellation",
      value: formatPolicyValue(policies.cancellationPolicy),
    });
  }

  if (policies.acceptableIdProof) {
    quickReference.push({
      label: "ID proof",
      value: formatPolicyValue(policies.acceptableIdProof),
    });
  }

  const checkinPolicy = policies.checkinCheckoutPolicies?.twentyFourHourCheckin;
  if (checkinPolicy) {
    quickReference.push({
      label: "24-hour check-in",
      value: checkinPolicy === "Yes" ? "Available" : "Not available",
    });
  }

  const petsAllowed = policies.petPolicy?.petsAllowed;
  if (petsAllowed) {
    quickReference.push({
      label: "Pets",
      value: formatPolicyValue(petsAllowed),
    });
  }

  const bookingPolicies = BOOKING_POLICIES.map((policy) => {
    if (policy.title === "Cancellation" && policies.cancellationPolicy) {
      return {
        ...policy,
        text: `${formatPolicyValue(policies.cancellationPolicy)}. Contact the property for full terms.`,
      };
    }
    if (policy.title === "ID & check-in" && policies.acceptableIdProof) {
      return {
        ...policy,
        text: `Valid ${formatPolicyValue(policies.acceptableIdProof)} required for all guests. Early check-in / late check-out on request (charges may apply).`,
      };
    }
    return policy;
  });

  return { quickReference, bookingPolicies };
}

export function getApiPropertyAddress(hotel) {
  const location = hotel?.location || {};
  const address = String(location.address || "").trim();
  const city = String(location.city || "").trim();
  const state = String(location.state || "").trim();
  const pincode = String(location.pincode || "").trim();
  const addressLower = address.toLowerCase();

  const parts = [address];
  if (city && !addressLower.includes(city.toLowerCase())) {
    parts.push(city);
  }
  if (state && !addressLower.includes(state.toLowerCase())) {
    parts.push(state);
  }
  if (pincode && !address.includes(pincode)) {
    parts.push(pincode);
  }

  return parts.filter(Boolean).join(", ");
}

export function getApiPropertyAbout(hotel, listing) {
  const basic = hotel?.basicInfo || {};
  const parts = [listing?.description || basic.propertyDescription].filter(Boolean);

  const meta = [];
  if (basic.propertyType) meta.push(formatLabel(basic.propertyType));
  if (basic.hotelStarRating) meta.push(basic.hotelStarRating);
  if (basic.channelManager === "Yes") meta.push("Channel manager connected");

  if (meta.length) {
    parts.push(meta.join(" · "));
  }

  return parts.join("\n\n");
}
