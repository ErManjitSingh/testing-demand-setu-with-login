import { notFound } from "next/navigation";
import PackagesListingPage from "@/components/packages/listing/PackagesListingPage";
import { parseFilters } from "@/lib/packageFilters";
import { getPackageMeta } from "@/lib/tourPackageMeta";
import { buildPackagePath } from "@/lib/packagePath";
import { fetchPackagesForFilters } from "@/lib/tourPackagesApi";
import {
  resolveTourPackageSlug,
  stripKeysForTourRoute,
  tourPackageFiltersFromResolved,
} from "@/lib/tourPackagesRoutes";
import { getSiteUrl } from "@/lib/siteConfig";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const resolved = resolveTourPackageSlug(slug);
  if (!resolved) {
    return { title: "Tour Packages" };
  }

  const title =
    resolved.type === "theme"
      ? `${resolved.label} Tour Packages`
      : resolved.type === "state"
        ? `${resolved.label} Tour Packages`
        : `${resolved.label} Tour Packages`;

  const description =
    resolved.type === "theme"
      ? `Browse ${resolved.label.toLowerCase()} holiday packages from Demand Setu Tours.`
      : `Browse handcrafted tour packages for ${resolved.label} — itineraries, hotels and private transfers.`;

  const path = `/tour-packages/${resolved.slug}`;
  return {
    title: `${title} | Demand Setu Tours`,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
  };
}

export default async function TourPackagesSlugPage({ params, searchParams }) {
  const { slug } = await params;
  const resolved = resolveTourPackageSlug(slug);
  if (!resolved) notFound();

  const query = await searchParams;
  const fromQuery = parseFilters(query);
  const fromSlug = tourPackageFiltersFromResolved(resolved);
  const initialFilters = {
    ...fromQuery,
    ...fromSlug,
    // Keep travellers / date / budget etc. from the query string.
    date: fromQuery.date,
    travellers: fromQuery.travellers,
    price: fromQuery.price,
    sort: fromQuery.sort,
    view: fromQuery.view,
    durations: fromQuery.durations,
  };

  const siteUrl = getSiteUrl();
  const fetched = await fetchPackagesForFilters(initialFilters);
  const initialPackages = fetched.packages.map((pkg) => ({ ...pkg, meta: getPackageMeta(pkg) }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${resolved.label} tour packages`,
    itemListElement: initialPackages.slice(0, 20).map((pkg, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteUrl}${buildPackagePath(pkg)}`,
      name: pkg.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PackagesListingPage
        initialFilters={initialFilters}
        initialPackages={initialPackages}
        stripQueryKeys={stripKeysForTourRoute(resolved)}
        routeLabel={resolved.label}
      />
    </>
  );
}
