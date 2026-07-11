export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://packagemakerbackend.demandsetutours.com";

export function buildApiUrl(path) {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = String(path || "").replace(/^\/+/, "");
  return `${base}/${cleanPath}`;
}
