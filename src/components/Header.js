"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  { href: "/", label: "Home", explore: null, icon: "home" },
  { href: "/accommodations", label: "Stays", explore: null, icon: "bed" },
  { href: "/listings", label: "Explore", explore: "all", icon: "compass" },
  { href: null, label: "Hotels", explore: "hotel", icon: "hotel" },
  { href: null, label: "Airbnb", explore: "airbnb", icon: "key" },
  { href: null, label: "Villas", explore: "homestay", icon: "villa" },
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

  const isHome = pathname === "/";
  const isPropertyStyleHeader = isPropertyDetailPage || isPropertySlugPath(pathname);
  const { isLoggedIn } = useGuestAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const closeMenu = () => setMenuOpen(false);
  const onDark = isHome && !isPropertyStyleHeader;

  const bar = (
    <div className="grid h-[68px] grid-cols-[auto_1fr_auto] items-center gap-2 sm:h-[80px] sm:gap-3">
      <Link href="/" className="relative z-10 inline-flex shrink-0 items-center">
        <span className="relative block h-11 w-[102px] sm:h-16 sm:w-[148px]">
          <Image
            src={onDark ? "/logo-on-dark.png" : "/logo.png"}
            alt="Demand Setu Tours"
            fill
            priority
            sizes="148px"
            className="object-contain object-left"
          />
        </span>
      </Link>

      <nav className="hidden min-w-0 items-center justify-center gap-0.5 lg:flex">
        {navLinks.map((link) => (
          <NavItem key={link.label} link={link} pathname={pathname} onExplore={openExplore} dark={onDark} />
        ))}
      </nav>

      <div className="relative z-10 ml-auto flex items-center gap-2">
        <a
          href="tel:+918353056000"
          className={`hidden items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] font-semibold xl:inline-flex ${
            onDark ? "bg-white/10 text-white" : "bg-[#fff1e6] text-stone-950"
          }`}
        >
          <IconBadge dark={onDark}>
            <NavIcon name="phone" />
          </IconBadge>
          +91 83530 56000
        </a>
        <Link
          href="/list-your-property"
          className={`hidden items-center gap-2 rounded-full px-2 py-1 text-[13px] font-medium xl:inline-flex ${
            onDark ? "text-orange-200 hover:text-white" : "text-brand hover:text-brand-dark"
          }`}
        >
          <NavIcon name="list" />
          List property
        </Link>
        <Link
          href={isLoggedIn ? "/my-bookings" : "/signin"}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-3 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(234,88,12,0.45)] transition hover:bg-brand-dark sm:h-10 sm:gap-2 sm:px-4 sm:text-[13px]"
        >
          <NavIcon name={isLoggedIn ? "ticket" : "user"} />
          {isLoggedIn ? "My Bookings" : "Sign in"}
        </Link>
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full lg:hidden ${
            onDark ? "bg-white/10 text-white" : "bg-[#fff1e6] text-brand"
          }`}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>
    </div>
  );

  const menu = menuOpen ? (
    <div className={`px-2 py-3 lg:hidden ${onDark ? "border-t border-white/10" : "border-t border-stone-200/80"}`}>
      <nav className="flex flex-col gap-1">
        {navLinks.map((link) => (
          <NavItem
            key={link.label}
            link={link}
            pathname={pathname}
            mobile
            dark={onDark}
            onExplore={(key) => {
              closeMenu();
              openExplore(key);
            }}
            onNavigate={closeMenu}
          />
        ))}
      </nav>
      <div className="mt-2 flex items-center justify-between px-3 pt-3 text-sm">
        <a href="tel:+918353056000" className={`inline-flex items-center gap-2 font-semibold ${onDark ? "text-white" : "text-stone-950"}`}>
          <NavIcon name="phone" />
          +91 83530 56000
        </a>
        <Link href="/list-your-property" onClick={closeMenu} className={`inline-flex items-center gap-2 font-medium ${onDark ? "text-orange-200" : "text-brand"}`}>
          <NavIcon name="list" />
          List property
        </Link>
      </div>
    </div>
  ) : null;

  return (
    <header className="sticky top-0 z-50">
      {isHome && !isPropertyStyleHeader ? (
        <div className="px-3 pt-3 sm:px-5 sm:pt-4">
          <div
            className={`mx-auto max-w-7xl bg-[#1a120e]/90 pl-3.5 pr-2.5 shadow-[0_18px_50px_rgba(0,0,0,0.4)] ring-1 ring-orange-400/30 backdrop-blur-2xl sm:px-3 ${
              menuOpen ? "rounded-[28px]" : "rounded-full"
            }`}
          >
            {bar}
            {menu}
          </div>
        </div>
      ) : (
        <div className="border-b border-stone-200/80 bg-white/92 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {bar}
            {menu}
            {isPropertyDetailPage ? (
              <div className="overflow-visible border-t border-stone-200/80 py-3">
                <HeaderSearchBar defaultState={defaultState} defaultCity={defaultCity} category={category} />
              </div>
            ) : null}
          </div>
        </div>
      )}
      {modal}
    </header>
  );
}

function NavItem({ link, pathname, onExplore, onNavigate, mobile = false, dark = false }) {
  const isActive =
    link.href &&
    (link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`));

  const className = mobile
    ? `flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-medium ${
        isActive
          ? "bg-brand text-white"
          : dark
            ? "text-white hover:bg-white/10"
            : "text-stone-800 hover:bg-[#fff1e6]"
      }`
    : `flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-[13px] font-semibold transition ${
        isActive
          ? "bg-brand text-white"
          : dark
            ? "text-white/85 hover:bg-white/10 hover:text-white"
            : "text-stone-700 hover:bg-[#fff1e6] hover:text-brand-dark"
      }`;

  const content = (
    <>
      <IconBadge active={isActive} dark={dark}>
        <NavIcon name={link.icon} />
      </IconBadge>
      {link.label}
    </>
  );

  if (link.explore) {
    return (
      <button type="button" onClick={() => onExplore(link.explore)} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link href={link.href} onClick={onNavigate} className={className}>
      {content}
    </Link>
  );
}

function IconBadge({ children, active = false, dark = false }) {
  return (
    <span
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
        active ? "bg-white/20 text-white" : dark ? "bg-orange-500/20 text-orange-300" : "bg-[#fff1e6] text-brand"
      }`}
    >
      {children}
    </span>
  );
}

function NavIcon({ name }) {
  const common = { className: "h-3.5 w-3.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.8 };
  if (name === "home") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    );
  }
  if (name === "bed") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 18V8m0 6h18v5M7 14v-3a2 2 0 0 1 2-2h2v5M21 18V9a2 2 0 0 0-2-2h-5" />
      </svg>
    );
  }
  if (name === "compass") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.8 9.2-1.2 4.4-4.4 1.2 1.2-4.4 4.4-1.2Z" />
      </svg>
    );
  }
  if (name === "hotel") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V5h9v16M13 21V9h7v12M7.5 8.5h2M7.5 12h2M7.5 15.5h2" />
      </svg>
    );
  }
  if (name === "key") {
    return (
      <svg {...common}>
        <circle cx="8" cy="15" r="3.2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 13.2 20 4.5l-2 2M16 8.5l2 2" />
      </svg>
    );
  }
  if (name === "villa") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 11.5 12 4l9 7.5M6 10.5V20h12v-9.5M10 20v-5h4v5" />
      </svg>
    );
  }
  if (name === "phone") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.5h3l1.2 3-2 1.2a12 12 0 0 0 5.1 5.1l1.2-2 3 1.2v3A2 2 0 0 1 16.5 17 13.5 13.5 0 0 1 7 7.5 2 2 0 0 1 7 3.5Z" />
      </svg>
    );
  }
  if (name === "list") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V9l8-5 8 5v11M9 20v-6h6v6" />
      </svg>
    );
  }
  if (name === "ticket") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3" />
      <path strokeLinecap="round" d="M5.5 19a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}
