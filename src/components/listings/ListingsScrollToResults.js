"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isListingsSlugPath } from "@/lib/listingsSlug";

const LISTINGS_SCROLL_FLAG = "ds-scroll-to-listings";

function isListingsPage(pathname) {
  return isListingsSlugPath(pathname) || pathname === "/listings";
}

export function markListingsScrollIntent() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(LISTINGS_SCROLL_FLAG, "1");
  }
}

function consumeListingsScrollIntent() {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(LISTINGS_SCROLL_FLAG) !== "1") return false;
  sessionStorage.removeItem(LISTINGS_SCROLL_FLAG);
  return true;
}

export function scrollToListingsResults({ maxAttempts = 15, intervalMs = 120 } = {}) {
  let attempts = 0;

  const tryScroll = () => {
    const target = document.getElementById("listings-results");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    attempts += 1;
    if (attempts < maxAttempts) {
      window.setTimeout(tryScroll, intervalMs);
    }
  };

  window.requestAnimationFrame(tryScroll);
}

/** Scroll to property cards when user lands on a listings route from anywhere. */
export default function ListingsScrollToResults() {
  const pathname = usePathname();
  const lastPathRef = useRef("");

  useEffect(() => {
    if (!isListingsPage(pathname)) {
      lastPathRef.current = "";
      return;
    }

    const pathChanged = lastPathRef.current !== pathname;
    const flagged = consumeListingsScrollIntent();

    if (!pathChanged && !flagged) return;
    lastPathRef.current = pathname;

    scrollToListingsResults();
  }, [pathname]);

  return null;
}
