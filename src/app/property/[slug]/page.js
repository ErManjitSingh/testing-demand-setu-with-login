import { notFound, redirect } from "next/navigation";
import { buildPropertyUrl, parseTripFromSearchParams } from "@/lib/bookingSearch";
import { resolvePropertyBySlug } from "@/lib/propertyData";

/** Legacy /property/[slug] redirects to the SEO slug form. */
export default async function LegacyPropertyPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const resolved = await resolvePropertyBySlug(slug);
  if (!resolved) notFound();

  const trip = parseTripFromSearchParams(query);
  redirect(buildPropertyUrl(resolved.listing, trip));
}
