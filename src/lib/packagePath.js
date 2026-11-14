const MONGO_ID_RE = /^[a-f0-9]{24}$/i;
const MONGO_ID_SUFFIX_RE = /-([a-f0-9]{24})$/i;

function slugifyName(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Pretty product slug: `{package-name}-{uniqueId}`
 * e.g. manali-dharamshala-ex-delhi-6ad9f2566e7d0cd4e2a7f565
 */
export function buildPackageSlug(pkg = {}) {
  const rawId = String(pkg.id || "").trim();
  const rawSlug = String(pkg.slug || "").trim();
  const id =
    (MONGO_ID_RE.test(rawId) && rawId) ||
    rawSlug.match(MONGO_ID_SUFFIX_RE)?.[1] ||
    (MONGO_ID_RE.test(rawSlug) && rawSlug) ||
    "";

  if (!id) return rawSlug || rawId;

  const namePart = slugifyName(pkg.title || pkg.name || pkg.packageName || "");
  return namePart ? `${namePart}-${id}` : id;
}

/** Pull the Mongo id (or legacy slug) out of a `/packages/[slug]` param. */
export function extractPackageId(param) {
  const slug = String(param || "").trim();
  if (!slug) return "";
  if (MONGO_ID_RE.test(slug)) return slug;
  const match = slug.match(MONGO_ID_SUFFIX_RE);
  if (match) return match[1];
  return slug;
}

export function buildPackagePath(pkg) {
  const slug = buildPackageSlug(pkg);
  return slug ? `/packages/${slug}` : "/packages";
}

/** Rebuild a query string from Next.js `searchParams` (object or URLSearchParams). */
export function searchParamsToQuery(query = {}) {
  if (!query) return "";
  if (typeof query.toString === "function" && typeof query.get === "function") {
    return query.toString();
  }
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value == null || value === "") continue;
    if (Array.isArray(value)) value.forEach((v) => p.append(key, String(v)));
    else p.set(key, String(value));
  }
  return p.toString();
}
