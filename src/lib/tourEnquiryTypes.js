export const TOUR_ENQUIRY_TYPES = [
  { value: "private", label: "Private tour" },
  { value: "group", label: "Group tour" },
  { value: "corporate", label: "Corporate / MICE" },
  { value: "honeymoon", label: "Honeymoon" },
  { value: "family", label: "Family package" },
  { value: "custom", label: "Custom itinerary" },
];

export function resolveTourTypeLabel(value) {
  return TOUR_ENQUIRY_TYPES.find((t) => t.value === value)?.label ?? value ?? "";
}

export function buildEnquiryDestination({ city = "", state = "", country = "", location = "", title = "" } = {}) {
  const fromParts = [city, state, country].map((part) => part?.trim()).filter(Boolean).join(", ");
  if (fromParts) return fromParts;
  return location?.trim() || title?.trim() || "India";
}
