import { getCategoryFallbackImage } from "@/lib/listings";

/** Hostnames allowed by next.config.mjs `images.remotePatterns`. */
const NEXT_IMAGE_HOSTS = new Set([
  "www.demandsetutours.com",
  "images.unsplash.com",
  "images.pexels.com",
  "firebasestorage.googleapis.com",
  "encrypted-tbn0.gstatic.com",
]);

export function isValidImageUrl(url) {
  const value = String(url || "").trim();
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower !== "null" && lower !== "undefined";
}

export function isNextImageAllowedUrl(url) {
  if (!isValidImageUrl(url)) return false;
  try {
    return NEXT_IMAGE_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** Picks a photo URL safe for next/image, else category showcase fallback. */
export function resolveListingImage(url, categoryId = "hotel") {
  if (isNextImageAllowedUrl(url)) return url;
  return getCategoryFallbackImage(categoryId);
}
