import { CATEGORIES } from "@/lib/listings";
import { fetchHotelsByState, HOME_PAGE_STATE } from "@/lib/hotelListingsApi";
import { buildListingsSlugPath } from "@/lib/listingsSlug";
import { fetchHotelCitiesList, fetchHotelStatesList } from "@/lib/locationResolve";
import { buildPropertyPath } from "@/lib/propertySlug";
import { getSiteUrl } from "@/lib/siteConfig";

const LISTING_CATEGORIES = ["all", ...CATEGORIES.map((category) => category.id)];

function createEntry(path, { priority = 0.7, changeFrequency = "weekly", lastModified } = {}) {
  const siteUrl = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return {
    url: `${siteUrl}${normalizedPath}`,
    lastModified: lastModified || new Date(),
    changeFrequency,
    priority,
  };
}

export async function getSitemapEntries() {
  const entries = [];
  const seen = new Set();

  const add = (path, options = {}) => {
    const normalized = String(path || "").split("?")[0].trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    entries.push(createEntry(normalized, options));
  };

  add("/", { priority: 1, changeFrequency: "daily" });
  add("/accommodations", { priority: 0.9, changeFrequency: "daily" });
  add("/explore", { priority: 0.9, changeFrequency: "daily" });
  add("/listings", { priority: 0.8, changeFrequency: "weekly" });
  add("/packages", { priority: 0.8, changeFrequency: "weekly" });

  const [cities, states] = await Promise.all([
    fetchHotelCitiesList(),
    fetchHotelStatesList(),
  ]);

  for (const category of LISTING_CATEGORIES) {
    add(buildListingsSlugPath({ category }), {
      priority: category === "all" ? 0.9 : 0.85,
      changeFrequency: "daily",
    });
  }

  for (const state of states) {
    if (!state) continue;
    for (const category of LISTING_CATEGORIES) {
      add(buildListingsSlugPath({ category, state }), {
        priority: 0.75,
        changeFrequency: "weekly",
      });
    }
  }

  for (const city of cities) {
    if (!city) continue;
    for (const category of LISTING_CATEGORIES) {
      add(buildListingsSlugPath({ category, city }), {
        priority: 0.8,
        changeFrequency: "weekly",
      });
    }
  }

  const stateNames = states.length ? states : [HOME_PAGE_STATE];
  const listingsByState = await Promise.all(
    stateNames.map((stateName) => fetchHotelsByState(stateName))
  );

  const properties = new Map();
  for (const listings of listingsByState) {
    for (const listing of listings) {
      if (!listing?.slug) continue;
      properties.set(listing.slug, listing);
    }
  }

  for (const listing of properties.values()) {
    add(buildPropertyPath(listing), {
      priority: 0.7,
      changeFrequency: "weekly",
    });
  }

  return entries;
}
