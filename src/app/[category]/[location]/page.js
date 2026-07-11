import { notFound } from "next/navigation";
import ListingsPageView from "@/app/listings/ListingsPageView";
import { resolveListingsLocationParams } from "@/lib/locationResolve";
import { fromLocationSlug, mergeListingsRouteSearchParams } from "@/lib/listingsSlug";
import { getCategoryLabel } from "@/lib/listings";
import { fetchSeoListingRecord, seoMetadataFromRecord } from "@/lib/seoListingApi";

export async function generateMetadata({ params }) {
  const routeParams = await params;
  const merged = mergeListingsRouteSearchParams(routeParams, {});
  if (!merged) {
    return {
      title: "Explore Stays | Demand Setu",
      description: "Browse hotels, Airbnbs, homestays and villas across India.",
    };
  }

  const resolved = await resolveListingsLocationParams(merged, routeParams.location);
  const category = resolved.category ?? "all";
  const label = getCategoryLabel(category);
  const place =
    resolved.city ||
    resolved.state ||
    fromLocationSlug(routeParams.location) ||
    "India";

  const seoRecord =
    category !== "all"
      ? await fetchSeoListingRecord(
          category,
          resolved.city,
          resolved.state,
          resolved.locationKind
        )
      : null;

  const seoMeta = seoMetadataFromRecord(seoRecord);
  if (seoMeta?.title) {
    return {
      title: seoMeta.title,
      description: seoMeta.description || undefined,
      keywords: seoMeta.keywords || undefined,
      robots: seoMeta.robots || undefined,
      alternates: seoMeta.alternates,
    };
  }

  return {
    title: `${label} in ${place} | Demand Setu`,
    description: `Browse ${label.toLowerCase()} in ${place} — handpicked stays across India.`,
  };
}

export default async function LocationListingsPage({ params, searchParams }) {
  const routeParams = await params;
  const queryParams = await searchParams;
  const merged = mergeListingsRouteSearchParams(routeParams, queryParams);
  if (!merged) notFound();

  const resolved = await resolveListingsLocationParams(merged, routeParams.location);

  return ListingsPageView({ searchParams: Promise.resolve(resolved) });
}
