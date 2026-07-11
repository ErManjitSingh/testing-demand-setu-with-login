import { notFound } from "next/navigation";
import ListingsPageView, { listingsMetadata } from "@/app/listings/ListingsPageView";
import { mergeListingsRouteSearchParams } from "@/lib/listingsSlug";

export const metadata = listingsMetadata;

export default async function CategoryListingsPage({ params, searchParams }) {
  const routeParams = await params;
  const queryParams = await searchParams;
  const merged = mergeListingsRouteSearchParams(routeParams, queryParams);
  if (!merged) notFound();

  return ListingsPageView({ searchParams: Promise.resolve(merged) });
}
