import { notFound, redirect } from "next/navigation";
import { buildBookUrl, parseTripFromSearchParams } from "@/lib/bookingSearch";
import { resolvePropertyBySlug } from "@/lib/propertyData";

/** Legacy /property/[slug]/book redirects to the SEO slug form. */
export default async function LegacyPropertyBookPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const resolved = await resolvePropertyBySlug(slug);
  if (!resolved) notFound();

  const trip = parseTripFromSearchParams(query);
  const price = query?.price;
  redirect(buildBookUrl(resolved.listing, trip, { price }));
}
