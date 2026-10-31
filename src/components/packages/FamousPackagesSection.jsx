"use client";

import Link from "next/link";
import HomeRail, { RailCard } from "@/components/packages/HomeRail";
import { formatPackagePrice, getAllPackages, getPackageImage } from "@/lib/tourPackages";

export default function FamousPackagesSection({ packages = [] }) {
  if (packages.length === 0) return null;

  const totalCount = getAllPackages().length;
  const shown = packages.slice(0, 10);

  return (
    <HomeRail
      id="famous-packages"
      title="Famous Packages"
      subtitle="Our top-selling all-inclusive itineraries — the trips travellers book first."
      action={
        <Link href="/packages" className="hidden whitespace-nowrap text-sm font-extrabold text-brand hover:underline sm:inline">
          View all {totalCount} →
        </Link>
      }
    >
      {shown.map((pkg) => (
        <RailCard
          key={pkg.id}
          size="lg"
          href={`/packages/${pkg.slug}`}
          image={getPackageImage(pkg)}
          title={pkg.title}
          sub={pkg.duration}
          price={`From ${formatPackagePrice(pkg.price)}`}
          badge={pkg.badge}
          ariaLabel={`${pkg.title}, ${pkg.duration}`}
        />
      ))}
    </HomeRail>
  );
}
