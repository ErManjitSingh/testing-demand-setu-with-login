"use client";

import { getPartnerAuthHeaders, getPartnerAuthToken } from "@/lib/packagemakerPartnerApi";

export const PROPERTY_TYPE_SLUGS = ["hotel", "homeStays&Villas", "BnBs"];

export function getAuthHeaders() {
  return getPartnerAuthHeaders();
}

export function checkAuthStatus() {
  return Boolean(getPartnerAuthToken());
}

export function isPropertyTypeSlug(value) {
  return PROPERTY_TYPE_SLUGS.includes(String(value || ""));
}

/** Mongo id for create/update/delete — not onboarding type slugs like "hotel". */
export function resolvePropertyApiId(propertyId, propertyIdFromUrl) {
  if (propertyId && (isPropertyTypeSlug(propertyIdFromUrl) || !propertyIdFromUrl)) {
    return propertyId;
  }
  return propertyIdFromUrl || propertyId || "";
}
