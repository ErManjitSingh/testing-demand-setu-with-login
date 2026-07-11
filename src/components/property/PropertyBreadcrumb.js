import Link from "next/link";
import { buildListingsSearchUrl } from "@/lib/bookingSearch";
import { getCategoryLabel } from "@/lib/listings";
import { CATEGORY_TO_SEGMENT } from "@/lib/listingsSlug";
import { getPropertyLocationSlug } from "@/lib/propertySlug";

export default function PropertyBreadcrumb({ listing, city, state, category }) {
  const resolvedCategory = category || listing.category || "hotel";
  const segment = CATEGORY_TO_SEGMENT[resolvedCategory] ?? "hotels";
  const locationSlug = getPropertyLocationSlug(listing, { city, state });
  const cityLabel = city || listing.location?.split(",")[0]?.trim() || listing.region;
  const listingsHref = buildListingsSearchUrl({
    category: resolvedCategory,
    city,
    state,
  });

  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[#4a4a4a] sm:text-sm">
      <Link href="/" className="hover:text-brand">
        Home
      </Link>
      <span className="text-[#9b9b9b]">/</span>
      <Link href={`/${segment}`} className="hover:text-brand">
        {getCategoryLabel(resolvedCategory)} in India
      </Link>
      {locationSlug && (
        <>
          <span className="text-[#9b9b9b]">/</span>
          <Link href={listingsHref} className="hover:text-brand">
            {cityLabel}
          </Link>
        </>
      )}
      <span className="text-[#9b9b9b]">/</span>
      <span className="font-semibold text-[#1a1a1a]">{listing.title}</span>
    </nav>
  );
}
