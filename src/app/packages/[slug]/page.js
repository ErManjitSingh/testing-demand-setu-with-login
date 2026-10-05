import { notFound } from "next/navigation";
import PackageDetailPage from "@/components/packages/detail/PackageDetailPage";
import { parseFilters } from "@/lib/packageFilters";
import { buildPackageDetail, getSimilarPackages } from "@/lib/tourPackageDetails";
import { getListingPackages } from "@/lib/tourPackageMeta";
import { getSiteUrl } from "@/lib/siteConfig";
import { todayInputValue } from "@/lib/tourTravellers";

function findPackage(slug) {
  return getListingPackages().find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = findPackage(slug);
  if (!pkg) return { title: "Package not found" };

  const title = `${pkg.title} — ${pkg.duration} tour package`;
  const description = `${pkg.description} ${pkg.duration} from ₹${pkg.price.toLocaleString("en-IN")} per person. Day-wise itinerary, hotels, inclusions and instant estimate.`;

  return {
    title,
    description,
    alternates: { canonical: `/packages/${pkg.slug}` },
    openGraph: {
      title: `${pkg.title} | Demand Setu Tours`,
      description,
      url: `/packages/${pkg.slug}`,
      images: pkg.image ? [{ url: pkg.image, alt: pkg.title }] : undefined,
    },
  };
}

export default async function PackageDetailRoute({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const pkg = findPackage(slug);
  if (!pkg) notFound();

  const detail = buildPackageDetail(pkg);
  const all = getListingPackages();
  const similar = getSimilarPackages(pkg, 4)
    .map((p) => all.find((x) => x.id === p.id))
    .filter(Boolean);

  // Carry over date + travellers chosen on the listing page / hero search.
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
    url: `${siteUrl}/packages/${pkg.slug}`,
    brand: { "@type": "Brand", name: "Demand Setu Tours" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: pkg.rating,
      reviewCount: pkg.reviews,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: pkg.price,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/packages/${pkg.slug}`,
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
