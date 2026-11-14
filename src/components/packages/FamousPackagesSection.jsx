"use client";

import Link from "next/link";
import HomeRail, { RailCard } from "@/components/packages/HomeRail";
import { limitItems } from "@/lib/limitItems";
import { buildPackagePath } from "@/lib/packagePath";
import { formatPackagePrice, getAllPackages, getPackageImage } from "@/lib/tourPackages";

const DEFAULT_SUBTITLE = "Our top-selling all-inclusive itineraries — the trips travellers book first.";

/**
 * Admin-managed Famous Packages (package-home API). Cards open `/packages/[id]`,
 * which loads the full package via `/api/add/get/:id`.
 */
export default function FamousPackagesSection({ packages = [], config = null }) {
  const adminItems = config?.items?.length ? limitItems(config.items, config.maxVisible) : null;
  if (!adminItems && packages.length === 0) return null;

  const totalCount = getAllPackages().length;
  const shown = packages.slice(0, 10);

  return (
    <HomeRail
      id="famous-packages"
      title={config?.title || "Famous Packages"}
      subtitle={config?.subtitle || DEFAULT_SUBTITLE}
      action={
        <Link href="/packages" className="hidden whitespace-nowrap text-sm font-extrabold text-brand hover:underline sm:inline">
          {totalCount > 0 ? `View all ${totalCount} →` : "View all →"}
        </Link>
      }
    >
      {adminItems
        ? adminItems.map((item) => (
            <RailCard
              key={item.id}
              size="lg"
              href={buildPackagePath({ id: item.id, title: item.name })}
              image={item.image || ""}
              title={item.name}
              sub={item.duration}
              price={item.priceTag || undefined}
              ariaLabel={`${item.name}${item.duration ? `, ${item.duration}` : ""}`}
            />
          ))
        : shown.map((pkg) => (
            <RailCard
              key={pkg.id}
              size="lg"
              href={buildPackagePath(pkg)}
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
