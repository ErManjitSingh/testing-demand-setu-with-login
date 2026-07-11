export const DEFAULT_SITE_URL = "https://www.demandsetutours.com";

/** Canonical public site origin (no trailing slash). */
export function getSiteUrl() {
  const configured = String(process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const vercel = String(process.env.VERCEL_URL || "").trim();
  if (vercel) {
    return `https://${vercel.replace(/\/+$/, "")}`;
  }

  return DEFAULT_SITE_URL;
}
