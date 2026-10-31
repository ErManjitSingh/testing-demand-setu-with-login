import { getListingPackages } from "@/lib/tourPackageMeta";
import { slugify } from "@/lib/places/placesText";

/** Ready-made tour packages for a state (and, when possible, a city) — used for internal linking. */
export function packagesForPlace({ stateSlug, cityName = "", limit = 4 }) {
  const all = getListingPackages();
  const city = cityName.toLowerCase();

  const score = (pkg) => {
    let s = 0;
    if (slugify(pkg.state) === stateSlug) s += 2;
    if (city && `${pkg.location} ${pkg.subtitle ?? ""} ${(pkg.highlights ?? []).join(" ")}`.toLowerCase().includes(city)) s += 3;
    return s;
  };

  return all
    .map((pkg) => ({ pkg, s: score(pkg) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.pkg.rating - a.pkg.rating)
    .slice(0, limit)
    .map(({ pkg }) => ({
      slug: pkg.slug,
      title: pkg.title,
      duration: pkg.duration,
      price: pkg.price,
      image: pkg.image,
    }));
}
