/** Frontend category id → backend `propertyType` query value */
export const CATEGORY_TO_PROPERTY_TYPE = {
  hotel: "hotel",
  airbnb: "BnBs",
  homestay: "homeStays&Villas",
};

export function getApiPropertyType(categoryId) {
  return CATEGORY_TO_PROPERTY_TYPE[categoryId] ?? null;
}

export function hasApiPropertyType(categoryId) {
  return Boolean(getApiPropertyType(categoryId));
}
