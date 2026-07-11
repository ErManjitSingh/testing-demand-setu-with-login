export const NAVIGATION_START_EVENT = "ds-navigation-start";

/** Call before router.push / router.replace for instant loading feedback */
export function startNavigationLoading() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NAVIGATION_START_EVENT));
  }
}

function isInternalNavigationHref(href) {
  if (!href || href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (href.startsWith("http://") || href.startsWith("https://")) {
    try {
      return new URL(href).origin === window.location.origin;
    } catch {
      return false;
    }
  }
  return true;
}

export function shouldStartNavigationForClick(anchor, pathname, search) {
  if (!anchor || anchor.getAttribute("target") === "_blank") return false;
  const href = anchor.getAttribute("href");
  if (!isInternalNavigationHref(href)) return false;

  try {
    const url = new URL(href, window.location.origin);
    const currentSearch = search ? `?${search}` : "";
    const nextSearch = url.search || "";
    if (url.pathname === pathname && nextSearch === currentSearch) return false;
  } catch {
    return false;
  }

  return true;
}
