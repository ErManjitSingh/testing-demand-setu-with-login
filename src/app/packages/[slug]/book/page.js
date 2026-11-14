import { notFound, redirect } from "next/navigation";
import BookingFlow from "@/components/packages/booking/BookingFlow";
import { parseBookingQuery } from "@/lib/packageBooking";
import { buildPackagePath, buildPackageSlug, extractPackageId, searchParamsToQuery } from "@/lib/packagePath";
import { buildDepartures, buildPackageDetail } from "@/lib/tourPackageDetails";
import { getListingPackages, getPackageMeta } from "@/lib/tourPackageMeta";
import { fetchPackageById } from "@/lib/tourPackagesApi";
import { todayInputValue } from "@/lib/tourTravellers";

async function resolvePackage(slug) {
  const id = extractPackageId(slug);
  const staticPkg =
    getListingPackages().find((p) => p.slug === slug || p.id === id || p.slug === id) ?? null;
  const base = staticPkg
    ? staticPkg
    : await fetchPackageById(id).then((fromApi) =>
        fromApi ? { ...fromApi, meta: getPackageMeta(fromApi) } : null
      );
  if (!base) return null;
  return { ...base, slug: buildPackageSlug(base) };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const pkg = await resolvePackage(slug);
  if (!pkg) return { title: "Package not found" };
  return {
    title: `Book ${pkg.title} — secure your seats`,
    description: `Reserve ${pkg.title} (${pkg.duration}). Choose dates, add traveller details and confirm in three quick steps.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `${buildPackagePath(pkg)}/book` },
  };
}

export default async function PackageBookingRoute({ params, searchParams }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const pkg = await resolvePackage(slug);
  if (!pkg) notFound();

  const canonicalBookPath = `${buildPackagePath(pkg)}/book`;
  if (`/packages/${slug}/book` !== canonicalBookPath) {
    const qs = searchParamsToQuery(query);
    redirect(qs ? `${canonicalBookPath}?${qs}` : canonicalBookPath);
  }

  const initialBooking = parseBookingQuery(query, todayInputValue());
  const departures = buildDepartures(pkg);
  const { hotels } = buildPackageDetail(pkg);

  return <BookingFlow pkg={pkg} hotels={hotels} departures={departures} initialBooking={initialBooking} />;
}
