"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCategoryExplore } from "@/hooks/useCategoryExplore";
import { isListingsSlugPath } from "@/lib/listingsSlug";

const tabs = [
  { href: "/", label: "Home", explore: null, match: (p) => p === "/" },
  { href: "/accommodations", label: "Stays", explore: null, match: (p) => p === "/accommodations" },
  {
    href: "/listings",
    label: "Explore",
    explore: "all",
    match: (p, q) =>
      p === "/listings" ||
      p === "/explore" ||
      (isListingsSlugPath(p) && !q.get("category")),
  },
  {
    href: null,
    label: "Hotels",
    explore: "hotel",
    match: (p, q) => q.get("category") === "hotel",
  },
  {
    href: null,
    label: "Villas",
    explore: "homestay",
    match: (p, q) => q.get("category") === "homestay",
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openExplore, modal } = useCategoryExplore();

  if (
    pathname?.startsWith("/property") ||
    pathname?.endsWith("/book") ||
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/list-your-property"
  ) {
    return null;
  }

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-[max(0.5rem,var(--safe-bottom))] md:hidden"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around gap-0.5 rounded-2xl border border-white/60 bg-white/90 p-1 shadow-2xl shadow-stone-900/15 backdrop-blur-xl">
          {tabs.map((tab) => {
            const isActive = tab.match(pathname, searchParams);
            const className = `flex flex-col items-center gap-0.5 rounded-xl px-1.5 py-2 text-[9px] font-bold transition ${
              isActive
                ? "bg-gradient-to-br from-brand to-orange-500 text-white shadow-md shadow-brand/30"
                : "text-muted"
            }`;

            if (tab.explore) {
              return (
                <li key={tab.label} className="min-w-0 flex-1">
                  <button type="button" onClick={() => openExplore(tab.explore)} className={`w-full ${className}`}>
                    <TabIcon name={tab.label} active={isActive} />
                    {tab.label}
                  </button>
                </li>
              );
            }

            return (
              <li key={tab.label} className="min-w-0 flex-1">
                <Link href={tab.href} className={className}>
                  <TabIcon name={tab.label} active={isActive} />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {modal}
    </>
  );
}

function TabIcon({ name, active }) {
  const stroke = active ? 2.5 : 1.5;
  const cls = `h-5 w-5 ${active ? "text-white" : ""}`;
  if (name === "Home" || name === "Stays") {
    return (
      <svg className={cls} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : stroke}>
        {active && <path d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 101.061 1.06l8.689-8.69z" />}
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    );
  }
  if (name === "Tours") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0l-3-3m3 3l3-3M9 15h6m-7.5 3h9a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0015.75 4.5h-7.5A2.25 2.25 0 006 6.75v9A2.25 2.25 0 008.25 18z" />
      </svg>
    );
  }
  if (name === "Explore") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    );
  }
  if (name === "Hotels") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5M4.5 21V9.75A2.25 2.25 0 016.75 7.5h10.5a2.25 2.25 0 012.25 2.25V21" />
      </svg>
    );
  }
  if (name === "Airbnb") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h7.5c.621 0 1.125.504 1.125 1.125V21M3.75 9.75h16.5" />
    </svg>
  );
}
