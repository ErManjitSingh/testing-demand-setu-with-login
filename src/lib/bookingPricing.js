export const PROPERTY_PRICE_MARKUP_MULTIPLIER = 1.25;

/** Room tariff per night (INR) → GST rate per Indian hotel accommodation rules. */
export const GST_SLAB_EXEMPT_MAX = 1000;
export const GST_SLAB_MID_MAX = 7500;

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

export function applyPropertyPriceMarkup(amount) {
  const value = Math.max(Number(amount) || 0, 0);
  if (value === 0) return 0;
  return Math.round(value * PROPERTY_PRICE_MARKUP_MULTIPLIER);
}

/** Base total before the 25% property-page markup. */
export function removePropertyPriceMarkup(amount) {
  const value = Math.max(Number(amount) || 0, 0);
  if (value === 0) return 0;
  return Math.round(value / PROPERTY_PRICE_MARKUP_MULTIPLIER);
}

/** Base subtotal + slab GST, without the 25% property-page markup. */
export function getBaseTotalWithGst(
  subtotal,
  { nights = 1, nightCharges = null, nightlyTariff = null } = {}
) {
  const baseSubtotal = removePropertyPriceMarkup(subtotal);
  const stayNights = Math.max(Number(nights) || 1, 1);
  let baseGst;

  if (Array.isArray(nightCharges) && nightCharges.length) {
    baseGst = calculateGstFromNightlyAmounts(
      nightCharges.map(removePropertyPriceMarkup)
    );
  } else if (nightlyTariff != null) {
    const baseNightly = removePropertyPriceMarkup(nightlyTariff);
    baseGst = calculateGstFromNightlyAmounts(Array(stayNights).fill(baseNightly));
  } else {
    const baseNightly = baseSubtotal / stayNights;
    baseGst = calculateGstFromNightlyAmounts(Array(stayNights).fill(baseNightly));
  }

  return baseSubtotal + baseGst;
}

export function applyPropertyPricingMarkup(pricing) {
  if (!pricing) return pricing;

  const subtotal = applyPropertyPriceMarkup(pricing.subtotal);
  const baseSubtotal = applyPropertyPriceMarkup(
    pricing.baseSubtotal ?? pricing.subtotal
  );
  const extraAdultSubtotal = applyPropertyPriceMarkup(pricing.extraAdultSubtotal ?? 0);
  const stayNights = Math.max(Number(pricing.nights) || 1, 1);
  const markedNightCharges = Array.isArray(pricing.nightCharges)
    ? pricing.nightCharges.map(applyPropertyPriceMarkup)
    : Array(stayNights).fill(subtotal / stayNights);
  const gst = calculateGstFromNightlyAmounts(markedNightCharges);
  const roomDetails = Array.isArray(pricing.roomDetails)
    ? pricing.roomDetails.map((room) => ({
        ...room,
        baseSubtotal: applyPropertyPriceMarkup(room.baseSubtotal),
        extraAdultSubtotal: applyPropertyPriceMarkup(room.extraAdultSubtotal),
        subtotal: applyPropertyPriceMarkup(room.subtotal),
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
