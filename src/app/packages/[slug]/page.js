import { notFound, redirect } from "next/navigation";
import PackageDetailPage from "@/components/packages/detail/PackageDetailPage";
import { parseFilters } from "@/lib/packageFilters";
import { buildPackagePath, buildPackageSlug, extractPackageId, searchParamsToQuery } from "@/lib/packagePath";
import { buildPackageDetail, getSimilarPackages } from "@/lib/tourPackageDetails";
import { getListingPackages, getPackageMeta } from "@/lib/tourPackageMeta";
import { fetchPackageById, fetchPackagesByState, fetchPackagesByTheme } from "@/lib/tourPackagesApi";
import { getSiteUrl } from "@/lib/siteConfig";
import { todayInputValue } from "@/lib/tourTravellers";

function findStaticPackage(slug) {
  const id = extractPackageId(slug);
  return (
    getListingPackages().find((p) => p.slug === slug || p.id === id || p.slug === id) ?? null
  );
}

async function resolvePackage(slug) {
  const staticPkg = findStaticPackage(slug);
  const base = staticPkg
    ? staticPkg
    : await fetchPackageById(extractPackageId(slug)).then((fromApi) =>
        fromApi ? { ...fromApi, meta: getPackageMeta(fromApi) } : null
      );
  if (!base) return null;
  return { ...base, slug: buildPackageSlug(base) };
}

async function resolveSimilar(pkg) {
  if (pkg.themes?.[0]) {
    const { packages } = await fetchPackagesByTheme(pkg.themes[0], { page: 1, limit: 8 });
    return packages
      .filter((p) => p.id !== pkg.id)
      .slice(0, 4)
      .map((p) => ({ ...p, meta: getPackageMeta(p) }));
  }
  if (pkg.state) {
    const { packages } = await fetchPackagesByState(pkg.state, { page: 1, limit: 8 });
    return packages
      .filter((p) => p.id !== pkg.id)
      .slice(0, 4)
      .map((p) => ({ ...p, meta: getPackageMeta(p) }));
  }
  return getSimilarPackages(pkg, 4)
    .map((p) => getListingPackages().find((x) => x.id === p.id))
    .filter(Boolean);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = await resolvePackage(slug);
  if (!pkg) return { title: "Package not found" };

  const path = buildPackagePath(pkg);
  const title = pkg.metaTitle || `${pkg.title} — ${pkg.duration} tour package`;
  const description =
    pkg.metaDescription ||
    `${pkg.description} ${pkg.duration}${pkg.price ? ` from ₹${pkg.price.toLocaleString("en-IN")} per person` : ""}.`;

  return {
    title,
    description,
    alternates: { canonical: pkg.canonicalTag || path },
    openGraph: {
      title: `${pkg.title} | Demand Setu Tours`,
      description,
      url: path,
      images: pkg.image ? [{ url: pkg.image, alt: pkg.title }] : undefined,
    },
  };
}

export default async function PackageDetailRoute({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const pkg = await resolvePackage(slug);
  if (!pkg) notFound();

  const canonicalPath = buildPackagePath(pkg);
  // Keep pretty URLs canonical: bare id or stale name → redirect.
  if (`/packages/${slug}` !== canonicalPath) {
    const qs = searchParamsToQuery(query);
    redirect(qs ? `${canonicalPath}?${qs}` : canonicalPath);
  }

  const detail = buildPackageDetail(pkg);
  const similar = await resolveSimilar(pkg);

  const parsed = parseFilters(query);
  const today = todayInputValue();
  const initialBooking = {
    date: parsed.date && parsed.date >= today ? parsed.date : "",
    travellers: parsed.travellers,
  };

  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pkg.title,
    description: pkg.description,
    image: pkg.image,
    url: `${siteUrl}${canonicalPath}`,
    brand: { "@type": "Brand", name: "Demand Setu Tours" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: pkg.rating,
      reviewCount: pkg.reviews,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: pkg.price || undefined,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}${canonicalPath}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PackageDetailPage pkg={pkg} detail={detail} similar={similar} initialBooking={initialBooking} />
    </>
  );
}
