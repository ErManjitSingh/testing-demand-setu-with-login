export function buildPropertyMapSearchQuery(propertyName, address) {
  const name = String(propertyName || "").trim();
  const addr = String(address || "").trim();

  if (name && addr) return `${name}, ${addr}`;
  return name || addr;
}

export function buildGoogleMapsEmbedUrl(query, apiKey = "") {
  const encoded = encodeURIComponent(String(query || "").trim());
  if (!encoded) return "";

  const key = String(apiKey || "").trim();
  if (key) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${encoded}`;
  }

  return `https://www.google.com/maps?q=${encoded}&output=embed`;
}

export function buildGoogleMapsDirectionsUrl(query) {
  const encoded = encodeURIComponent(String(query || "").trim());
  if (!encoded) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encoded}`;
}
