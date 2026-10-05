import { notFound } from "next/navigation";
import BookingFlow from "@/components/packages/booking/BookingFlow";
import { parseBookingQuery } from "@/lib/packageBooking";
import { buildDepartures } from "@/lib/tourPackageDetails";
import { getListingPackages } from "@/lib/tourPackageMeta";
import { todayInputValue } from "@/lib/tourTravellers";

function findPackage(slug) {
  return getListingPackages().find((p) => p.slug === slug) ?? null;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = findPackage(slug);
  if (!pkg) return { title: "Package not found" };
  return {
    title: `Book ${pkg.title} — secure your seats`,
    description: `Reserve ${pkg.title} (${pkg.duration}). Choose dates, add traveller details and confirm in three quick steps.`,
    // Checkout pages should never compete with the product page in search.
    robots: { index: false, follow: false },
    alternates: { canonical: `/packages/${pkg.slug}` },
  };
}

export default async function PackageBookingRoute({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const pkg = findPackage(slug);
  if (!pkg) notFound();

  const initialBooking = parseBookingQuery(query, todayInputValue());
  const departures = buildDepartures(pkg);

  return <BookingFlow pkg={pkg} departures={departures} initialBooking={initialBooking} />;
}
