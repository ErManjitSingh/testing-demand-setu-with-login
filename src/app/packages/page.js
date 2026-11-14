import PackagesListingPage from "@/components/packages/listing/PackagesListingPage";
import { parseFilters } from "@/lib/packageFilters";
import { getPackageMeta } from "@/lib/tourPackageMeta";
import { buildPackagePath } from "@/lib/packagePath";
import { fetchPackagesForFilters } from "@/lib/tourPackagesApi";
import { getSiteUrl } from "@/lib/siteConfig";

export const revalidate = 300;

export const metadata = {
  title: "Tour Packages — India & International Holidays",
  description:
    "Compare handcrafted tour packages across India and abroad. Filter by budget, duration and trip style, add your travel date, adults and children, and get an instant estimate.",
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "Tour Packages | Demand Setu Tours",
    description:
      "Handcrafted holidays across India and the world — Ladakh, Kerala, Rajasthan, Bali, Maldives and more.",
    url: "/packages",
  },
};

export default async function PackagesPage({ searchParams }) {
  const query = await searchParams;
  const initialFilters = parseFilters(query);
  const siteUrl = getSiteUrl();
  const fetched = await fetchPackagesForFilters(initialFilters);
  const initialPackages = fetched.packages.map((pkg) => ({ ...pkg, meta: getPackageMeta(pkg) }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Demand Setu tour packages",
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
      <PackagesListingPage initialFilters={initialFilters} initialPackages={initialPackages} />
    </>
  );
}
