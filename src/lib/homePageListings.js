const HERO_COUNT = 3;
const GUEST_FAVOURITES_COUNT = 4;
const POPULAR_WEEK_COUNT = 6;

function takeUnique(pool, count, used) {
  const result = [];
  for (const listing of pool) {
    if (used.has(listing.slug)) continue;
    result.push(listing);
    used.add(listing.slug);
    if (result.length >= count) break;
  }
  return result;
}

function takeAllRemaining(pool, used) {
  const result = [];
  for (const listing of pool) {
    if (used.has(listing.slug)) continue;
    result.push(listing);
    used.add(listing.slug);
  }
  return result;
}

/** Splits home listings across sections without repeating the same property. */
export function partitionHomeListings(listings) {
  const used = new Set();
  const byRating = [...listings].sort((a, b) => b.rating - a.rating);
  const highlyRated = byRating.filter((l) => l.rating >= 4.9);
  const favouritesPool =
    highlyRated.length >= GUEST_FAVOURITES_COUNT ? highlyRated : byRating;

  const hero = takeUnique(byRating, HERO_COUNT, used);
  const guestFavourites = takeUnique(favouritesPool, GUEST_FAVOURITES_COUNT, used);
  const popularWeek = takeUnique(byRating, POPULAR_WEEK_COUNT, used);
  const discoverSlider = takeAllRemaining(byRating, used);

  return {
    heroSpotlight: hero[0] ?? null,
    heroSide: hero.slice(1, HERO_COUNT),
    guestFavourites,
    discoverSlider,
    popularWeek,
  };
}
