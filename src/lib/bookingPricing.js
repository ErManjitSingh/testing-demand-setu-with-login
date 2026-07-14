import { buildApiUrl } from "@/lib/apiConfig";

/** Fallback when the percentage API is unreachable. */
export const FALLBACK_PROPERTY_PRICE_MARKUP_PERCENTAGE = 25;

/** @deprecated Prefer getPropertyPriceMarkupMultiplier() — kept for rare static imports. */
export const PROPERTY_PRICE_MARKUP_MULTIPLIER =
  1 + FALLBACK_PROPERTY_PRICE_MARKUP_PERCENTAGE / 100;

/** Room tariff per night (INR) → GST rate per Indian hotel accommodation rules. */
export const GST_SLAB_EXEMPT_MAX = 1000;
export const GST_SLAB_MID_MAX = 7500;

/** Browser-only runtime override (set from property/checkout after fetching API %). */
let runtimeMarkupMultiplier = null;

export function percentageToMarkupMultiplier(percentage) {
  const pct = Math.max(0, Number(percentage) || 0);
  return 1 + pct / 100;
}

export function setRuntimePriceMarkupMultiplier(multiplier) {
  const value = Number(multiplier);
  runtimeMarkupMultiplier = Number.isFinite(value) && value > 0 ? value : null;
}

export function getPropertyPriceMarkupMultiplier() {
  if (runtimeMarkupMultiplier != null) return runtimeMarkupMultiplier;
  return percentageToMarkupMultiplier(FALLBACK_PROPERTY_PRICE_MARKUP_PERCENTAGE);
}

/**
 * GET api/percentage/get-all — always one active row; use `percentage` only.
 * Returns a number like 60 (meaning 60% markup → ×1.6).
 */
export async function fetchPropertyPriceMarkupPercentage() {
  try {
    const isServer = typeof window === "undefined";
    const response = await fetch(buildApiUrl("api/percentage/get-all"), {
      method: "GET",
      headers: { Accept: "application/json" },
      ...(isServer ? { next: { revalidate: 60 } } : { cache: "no-store" }),
    });
    if (!response.ok) {
      return FALLBACK_PROPERTY_PRICE_MARKUP_PERCENTAGE;
    }
    const json = await response.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    const active = rows.find((row) => row?.isActive) || rows[0];
    const percentage = Number(active?.percentage);
    if (!Number.isFinite(percentage) || percentage < 0) {
      return FALLBACK_PROPERTY_PRICE_MARKUP_PERCENTAGE;
    }
    return percentage;
  } catch {
    return FALLBACK_PROPERTY_PRICE_MARKUP_PERCENTAGE;
  }
}

export async function fetchPropertyPriceMarkupMultiplier() {
  const percentage = await fetchPropertyPriceMarkupPercentage();
  return percentageToMarkupMultiplier(percentage);
}

export function getGstRateForNightlyTariff(nightlyTariff) {
  const rate = Math.max(Number(nightlyTariff) || 0, 0);
  if (rate <= GST_SLAB_EXEMPT_MAX) return 0;
  if (rate <= GST_SLAB_MID_MAX) return 0.05;
  return 0.18;
}

export function calculateGstForNightCharge(nightCharge) {
  const charge = Math.max(Number(nightCharge) || 0, 0);
  if (charge === 0) return 0;
  return Math.round(charge * getGstRateForNightlyTariff(charge));
}

export function calculateGstFromNightlyAmounts(nightlyAmounts = []) {
  return nightlyAmounts.reduce(
    (sum, amount) => sum + calculateGstForNightCharge(amount),
    0
  );
}

export function formatGstLabel(nightlyTariff) {
  const rate = getGstRateForNightlyTariff(nightlyTariff);
  if (rate === 0) return "GST (0%)";
  if (rate === 0.05) return "GST (5%)";
  return "GST (18%)";
}

export function formatGstSummaryLabel({
  subtotal = 0,
  gst = 0,
  nights = 1,
  nightCharges = null,
} = {}) {
  if (!gst) return "GST (0%)";

  if (Array.isArray(nightCharges) && nightCharges.length) {
    const rates = new Set(nightCharges.map(getGstRateForNightlyTariff));
    if (rates.size === 1) {
      const [rate] = rates;
      if (rate === 0) return "GST (0%)";
      if (rate === 0.05) return "GST (5%)";
      return "GST (18%)";
    }
    return "GST";
  }

  const stayNights = Math.max(Number(nights) || 1, 1);
  const effectiveNightly = subtotal / stayNights;
  return formatGstLabel(effectiveNightly);
}

export function applyPropertyPriceMarkup(
  amount,
  multiplier = getPropertyPriceMarkupMultiplier()
) {
  const value = Math.max(Number(amount) || 0, 0);
  if (value === 0) return 0;
  const factor = Number(multiplier) > 0 ? Number(multiplier) : getPropertyPriceMarkupMultiplier();
  return Math.round(value * factor);
}

/** Base total before the property-page markup. */
export function removePropertyPriceMarkup(
  amount,
  multiplier = getPropertyPriceMarkupMultiplier()
) {
  const value = Math.max(Number(amount) || 0, 0);
  if (value === 0) return 0;
  const factor = Number(multiplier) > 0 ? Number(multiplier) : getPropertyPriceMarkupMultiplier();
  return Math.round(value / factor);
}

/** Base subtotal + slab GST, without the property-page markup. */
export function getBaseTotalWithGst(
  subtotal,
  { nights = 1, nightCharges = null, nightlyTariff = null, multiplier } = {}
) {
  const factor =
    Number(multiplier) > 0 ? Number(multiplier) : getPropertyPriceMarkupMultiplier();
  const baseSubtotal = removePropertyPriceMarkup(subtotal, factor);
  const stayNights = Math.max(Number(nights) || 1, 1);
  let baseGst;

  if (Array.isArray(nightCharges) && nightCharges.length) {
    baseGst = calculateGstFromNightlyAmounts(
      nightCharges.map((amount) => removePropertyPriceMarkup(amount, factor))
    );
  } else if (nightlyTariff != null) {
    const baseNightly = removePropertyPriceMarkup(nightlyTariff, factor);
    baseGst = calculateGstFromNightlyAmounts(Array(stayNights).fill(baseNightly));
  } else {
    const baseNightly = baseSubtotal / stayNights;
    baseGst = calculateGstFromNightlyAmounts(Array(stayNights).fill(baseNightly));
  }

  return baseSubtotal + baseGst;
}

export function applyPropertyPricingMarkup(
  pricing,
  multiplier = getPropertyPriceMarkupMultiplier()
) {
  if (!pricing) return pricing;

  const factor =
    Number(multiplier) > 0 ? Number(multiplier) : getPropertyPriceMarkupMultiplier();
  const subtotal = applyPropertyPriceMarkup(pricing.subtotal, factor);
  const baseSubtotal = applyPropertyPriceMarkup(
    pricing.baseSubtotal ?? pricing.subtotal,
    factor
  );
  const extraAdultSubtotal = applyPropertyPriceMarkup(
    pricing.extraAdultSubtotal ?? 0,
    factor
  );
  const stayNights = Math.max(Number(pricing.nights) || 1, 1);
  const markedNightCharges = Array.isArray(pricing.nightCharges)
    ? pricing.nightCharges.map((amount) => applyPropertyPriceMarkup(amount, factor))
    : Array(stayNights).fill(subtotal / stayNights);
  const gst = calculateGstFromNightlyAmounts(markedNightCharges);
  const roomDetails = Array.isArray(pricing.roomDetails)
    ? pricing.roomDetails.map((room) => ({
        ...room,
        baseSubtotal: applyPropertyPriceMarkup(room.baseSubtotal, factor),
        extraAdultSubtotal: applyPropertyPriceMarkup(room.extraAdultSubtotal, factor),
        subtotal: applyPropertyPriceMarkup(room.subtotal, factor),
      }))
    : pricing.roomDetails;

  const { nightCharges: _nightCharges, ...pricingRest } = pricing;

  return {
    ...pricingRest,
    subtotal,
    baseSubtotal,
    extraAdultSubtotal,
    gst,
    total: subtotal + gst,
    ...(roomDetails ? { roomDetails } : {}),
  };
}

export function calculateBookingPrice(nightly, nights) {
  const rate = Math.max(Number(nightly) || 0, 0);
  const stayNights = Math.max(Number(nights) || 1, 1);
  const subtotal = rate * stayNights;
  const nightCharges = Array(stayNights).fill(rate);
  const gst = calculateGstFromNightlyAmounts(nightCharges);
  const total = subtotal + gst;

  return { subtotal, gst, total, nights: stayNights, nightCharges };
}
