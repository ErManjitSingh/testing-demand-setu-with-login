"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoLink } from "@/components/Logo";
import HeaderSearchBar from "@/components/HeaderSearchBar";
import { getListingBySlug } from "@/lib/listings";
import { SEGMENT_TO_CATEGORY, fromLocationSlug } from "@/lib/listingsSlug";
import {
  isPropertySlugPath,
  parsePropertySegment,
  parsePropertySlugPath,
} from "@/lib/propertySlug";
import { useCategoryExplore } from "@/hooks/useCategoryExplore";
import { useGuestAuth } from "@/hooks/useGuestAuth";

const navLinks = [
  { href: "/", label: "Home", explore: null },
  { href: "/accommodations", label: "Stays", explore: null },
  { href: "/listings", label: "Explore", explore: "all" },
  { href: null, label: "Hotels", explore: "hotel" },
  { href: null, label: "Airbnb", explore: "airbnb" },
  { href: null, label: "Villas", explore: "homestay" },
];

export default function Header() {
  const { openExplore, modal } = useCategoryExplore();
  const pathname = usePathname() || "";
  const legacyMatch = pathname.match(/^\/property\/([^/]+)$/);
  const parsedProperty = parsePropertySlugPath(pathname);
  const isPropertyDetailPage =
    Boolean(legacyMatch) || Boolean(parsedProperty && !parsedProperty.isBook);

  let defaultState = "";
  let defaultCity = "";
  let category = "hotel";

  if (legacyMatch) {
    const listing = getListingBySlug(legacyMatch[1]);
    defaultState = listing?.region ?? "";
    defaultCity = listing?.location?.split(",")[0]?.trim() ?? "";
    category = listing?.category || "hotel";
  } else if (parsedProperty && !parsedProperty.isBook) {
    category = SEGMENT_TO_CATEGORY[parsedProperty.categorySegment] || "hotel";
    const locationName = fromLocationSlug(parsedProperty.locationSlug);
    const { internalSlug } = parsePropertySegment(parsedProperty.propertySegment);
    const listing = internalSlug ? getListingBySlug(internalSlug) : null;

    if (listing) {
      defaultState = listing.region ?? "";
      defaultCity = listing.location?.split(",")[0]?.trim() ?? "";
      category = listing.category || category;
    } else if (locationName) {
      defaultCity = locationName;
      defaultState = "";
    }
  }

  const isPropertyStyleHeader = isPropertyDetailPage || isPropertySlugPath(pathname);
  return (
    <header className="sticky top-0 z-50">
      <div
        className={`overflow-visible border-b shadow-sm ${
          isPropertyStyleHeader
            ? "border-[#e0e0e0] bg-white"
            : "glass border-white/60 shadow-stone-200/40"
        }`}
      >
        <div className="mx-auto max-w-6xl overflow-visible px-4 sm:px-6">
          {/* Main navbar row */}
          <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
            <LogoLink size="md" className="max-w-[140px] sm:max-w-[180px]" />

            <nav className="hidden items-center gap-0.5 rounded-full border border-border/80 bg-stone-50/80 p-1 lg:flex">
              {navLinks.map((link) => {
                const isActive =
                  link.href &&
                  (link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(`${link.href}/`));

                if (link.explore) {
                  return (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => openExplore(link.explore)}
                      className="rounded-full px-3.5 py-2 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-brand-dark hover:shadow-sm"
                    >
                      {link.label}
                    </button>
                  );
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-white text-brand-dark shadow-sm"
                        : "text-stone-600 hover:bg-white hover:text-brand-dark hover:shadow-sm"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <HeaderActions />
          </div>

          {/* Search bar — property detail only (not checkout) */}
          {isPropertyDetailPage && (
            <div className="overflow-visible border-t border-stone-200/80 py-3">
              <HeaderSearchBar
                defaultState={defaultState}
                defaultCity={defaultCity}
                category={category}
              />
            </div>
          )}
        </div>
      </div>
      {modal}
    </header>
  );
}

function HeaderActions() {
  const { isLoggedIn } = useGuestAuth();

  return (
    <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <a
        href="tel:+918353056000"
        className="flex items-center gap-2 rounded-full border border-border/80 bg-white/90 px-2.5 py-1.5 transition hover:border-brand/40 sm:px-3.5 sm:py-2"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-muted text-brand sm:h-9 sm:w-9">
          <PhoneIcon />
        </span>
        <span className="hidden min-w-0 text-left leading-tight sm:block">
          <span className="block text-[9px] font-bold uppercase tracking-wide text-muted sm:text-[10px]">
            Customer Service
          </span>
          <span className="block text-xs font-extrabold text-brand sm:text-sm">
            +91 8353056000
          </span>
        </span>
      </a>
      <Link
        href="/list-your-property"
        className="inline-flex rounded-full border border-brand/30 bg-brand-muted/40 px-2.5 py-2 text-[11px] font-semibold text-brand-dark transition hover:border-brand/50 hover:bg-brand-muted sm:px-4 sm:py-2.5 sm:text-sm"
      >
        <span className="sm:hidden">List property</span>
        <span className="hidden sm:inline">List your property</span>
      </Link>
      <Link
        href={isLoggedIn ? "/my-bookings" : "/signin"}
        className="inline-flex rounded-full border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground transition hover:border-brand/40 sm:px-5 sm:py-2.5 sm:text-sm"
      >
        {isLoggedIn ? "My Bookings" : "Sign in"}
      </Link>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}
