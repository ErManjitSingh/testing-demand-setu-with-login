import { getStateImage } from "@/components/state/stateImageMap";

export const COUNTRIES = [
  {
    name: "India",
    tagline: "Every state, every city",
    fromPrice: 4999,
    image: getStateImage("Rajasthan"),
    featured: true,
  },
  {
    name: "Nepal",
    tagline: "Himalayan adventures",
    fromPrice: 12999,
    image: "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg",
  },
  {
    name: "Bhutan",
    tagline: "Land of happiness",
    fromPrice: 24999,
    image: "https://images.pexels.com/photos/6904721/pexels-photo-6904721.jpeg",
  },
  {
    name: "Thailand",
    tagline: "Tropical escapes",
    fromPrice: 18999,
    image: "https://images.pexels.com/photos/2611495/pexels-photo-2611495.jpeg",
  },
  {
    name: "Dubai",
    tagline: "Luxury & skyline",
    fromPrice: 22999,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
  },
  {
    name: "Sri Lanka",
    tagline: "Island paradise",
    fromPrice: 15999,
    image: "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=800&q=80",
  },
  {
    name: "Japan",
    tagline: "The land of the rising sun",
    fromPrice: 99999,
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80",
    featured: true,
  },
  {
    name: "Switzerland",
    tagline: "The land of Alps & adventure",
    fromPrice: 129999,
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&q=80",
  },
  {
    name: "Indonesia",
    tagline: "Tropical islands & culture",
    fromPrice: 49999,
    image: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
  },
  {
    name: "Italy",
    tagline: "Art, history & cuisine",
    fromPrice: 89999,
    image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
  },
  {
    name: "Maldives",
    tagline: "Overwater paradise",
    fromPrice: 62999,
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80",
    featured: true,
  },
  {
    name: "Singapore",
    tagline: "Garden city marvel",
    fromPrice: 48999,
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80",
  },
  {
    name: "Malaysia",
    tagline: "Twin-city wonders",
    fromPrice: 41999,
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
  },
  {
    name: "Vietnam",
    tagline: "Halong to Hoi An",
    fromPrice: 47999,
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80",
  },
  {
    name: "Turkey",
    tagline: "Where East meets West",
    fromPrice: 69999,
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80",
  },
  {
    name: "France",
    tagline: "Romance & art capital",
    fromPrice: 119999,
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
  },
  {
    name: "Egypt",
    tagline: "Pyramids & Nile cruises",
    fromPrice: 74999,
    image: "https://images.pexels.com/photos/18291196/pexels-photo-18291196.jpeg",
  },
  {
    name: "Australia",
    tagline: "Reefs, cities & outback",
    fromPrice: 149999,
    image: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80",
  },
  {
    name: "Greece",
    tagline: "Islands & ancient ruins",
    fromPrice: 94999,
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80",
  },
  {
    name: "South Africa",
    tagline: "Safari & Cape Town",
    fromPrice: 89999,
    image: "https://images.pexels.com/photos/38206246/pexels-photo-38206246.jpeg",
  },
  {
    name: "Cambodia",
    tagline: "Angkor Wat wonders",
    fromPrice: 38999,
    image: "https://images.pexels.com/photos/19063365/pexels-photo-19063365.jpeg",
  },
];

export function getInternationalCountries() {
  return COUNTRIES.filter((c) => c.name !== "India");
}

export const STATE_TAGLINES = {
  Rajasthan: "The Land of Kings",
  Kerala: "Where traditions live through waterways",
  "Himachal Pradesh": "The land of snow-capped peaks",
  Goa: "Sun, sand & Portuguese charm",
  Ladakh: "High-altitude desert beauty",
  "Jammu & Kashmir": "Paradise on earth",
  Uttarakhand: "Land of gods & Himalayas",
  Karnataka: "Heritage & coffee country",
  Maharashtra: "From Mumbai dreams to hill stations",
  Gujarat: "White desert & vibrant culture",
  "Tamil Nadu": "Temples & tea hills",
  "West Bengal": "Culture, hills & coast",
  Sikkim: "Himalayan kingdom",
  "Uttar Pradesh": "Taj Mahal & spiritual ghats",
  Delhi: "Heart of the nation",
  Assam: "Tea gardens & wildlife",
  Meghalaya: "Abode of clouds",
  Punjab: "Land of five rivers",
  Telangana: "Pearls & Nizami heritage",
};

export function getStateTagline(stateName) {
  return STATE_TAGLINES[stateName] || "Discover incredible India";
}

const STATE_PASTEL = [
  "bg-orange-50",
  "bg-sky-50",
  "bg-rose-50",
  "bg-emerald-50",
  "bg-violet-50",
  "bg-amber-50",
];

export function getStatePastelBg(index) {
  return STATE_PASTEL[index % STATE_PASTEL.length];
}

/** Always-show popular cities — merged with live API list. */
export const STATIC_POPULAR_CITIES = [
  "Delhi",
  "Mumbai",
  "Jaipur",
  "Goa",
  "Manali",
  "Shimla",
  "Udaipur",
  "Kochi",
  "Srinagar",
  "Leh",
  "Agra",
  "Bangalore",
  "Kolkata",
  "Varanasi",
  "Rishikesh",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Amritsar",
  "Darjeeling",
  "Gangtok",
  "Mysore",
  "Jodhpur",
  "Nainital",
  "Alleppey",
  "Munnar",
  "Port Blair",
  "Guwahati",
  "Chandigarh",
  "Lucknow",
  "Coorg",
  "Ooty",
  "Pondicherry",
];

export function getPopularCities(apiCities = [], limit = 32) {
  const picked = [];
  const seen = new Set();

  const add = (name) => {
    const key = String(name || "").trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    picked.push(String(name).trim());
  };

  for (const name of STATIC_POPULAR_CITIES) add(name);
  for (const name of apiCities) add(name);

  return picked.slice(0, limit);
}

/** Full static list for country search (hero & enquiries). */
export const STATIC_SEARCH_COUNTRIES = [
  "India",
  "Nepal",
  "Bhutan",
  "Bangladesh",
  "Sri Lanka",
  "Maldives",
  "Thailand",
  "Singapore",
  "Malaysia",
  "Indonesia",
  "Vietnam",
  "Cambodia",
  "Myanmar",
  "Dubai",
  "UAE",
  "Qatar",
  "Saudi Arabia",
  "Oman",
  "Turkey",
  "Egypt",
  "Jordan",
  "Kenya",
  "South Africa",
  "Mauritius",
  "Seychelles",
  "United Kingdom",
  "France",
  "Switzerland",
  "Italy",
  "Germany",
  "Spain",
  "Greece",
  "Netherlands",
  "USA",
  "Canada",
  "Australia",
  "New Zealand",
  "Japan",
  "South Korea",
  "China",
  "Hong Kong",
  "Tibet",
];

export function getCountrySearchOptions() {
  const seen = new Set();
  const merged = [];

  for (const name of [
    ...COUNTRIES.map((c) => c.name),
    ...STATIC_SEARCH_COUNTRIES,
  ]) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(name);
  }

  return merged.sort((a, b) => {
    if (a === "India") return -1;
    if (b === "India") return 1;
    return a.localeCompare(b, "en", { sensitivity: "base" });
  });
}

export const STATE_CITY_HINTS = {
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
  Rajasthan: ["Jaipur", "Udaipur", "Jodhpur"],
  Kerala: ["Munnar", "Alleppey", "Kochi"],
  Goa: ["North Goa", "South Goa", "Panaji"],
  Ladakh: ["Leh", "Nubra", "Pangong"],
  Uttarakhand: ["Rishikesh", "Nainital", "Mussoorie"],
  "Jammu & Kashmir": ["Srinagar", "Gulmarg", "Pahalgam"],
  Karnataka: ["Bangalore", "Coorg", "Mysore"],
  Maharashtra: ["Mumbai", "Pune", "Lonavala"],
  Delhi: ["Old Delhi", "New Delhi", "Agra"],
  Gujarat: ["Ahmedabad", "Kutch", "Dwarka"],
  "Tamil Nadu": ["Chennai", "Ooty", "Madurai"],
  "West Bengal": ["Kolkata", "Darjeeling", "Digha"],
  Sikkim: ["Gangtok", "Pelling", "Lachung"],
  "Uttar Pradesh": ["Agra", "Varanasi", "Lucknow"],
};

export const CITY_META = {
  Delhi: { tagline: "The Heart of India", fromPrice: 5999 },
  Mumbai: { tagline: "The City of Dreams", fromPrice: 6499 },
  Jaipur: { tagline: "Pink City", fromPrice: 5499 },
  Goa: { tagline: "Beach Paradise", fromPrice: 4999 },
  Manali: { tagline: "Snowy Retreat", fromPrice: 6999 },
  Shimla: { tagline: "Queen of Hills", fromPrice: 6499 },
  Udaipur: { tagline: "City of Lakes", fromPrice: 5999 },
  Kochi: { tagline: "Spice Coast", fromPrice: 5799 },
  Srinagar: { tagline: "Paradise on Earth", fromPrice: 7499 },
  Leh: { tagline: "High Altitude", fromPrice: 8999 },
  Agra: { tagline: "Taj Mahal", fromPrice: 4999 },
  Bangalore: { tagline: "The Silicon Valley of India", fromPrice: 5499 },
  Kolkata: { tagline: "City of Joy", fromPrice: 5299 },
  Varanasi: { tagline: "Spiritual Capital", fromPrice: 4999 },
  Rishikesh: { tagline: "Yoga Capital", fromPrice: 4499 },
  Chennai: { tagline: "The Gateway to South", fromPrice: 5199 },
  Hyderabad: { tagline: "City of Pearls", fromPrice: 5399 },
  Pune: { tagline: "Oxford of the East", fromPrice: 4999 },
  Amritsar: { tagline: "Home of Golden Temple", fromPrice: 4799 },
  Darjeeling: { tagline: "Queen of the Hills", fromPrice: 6299 },
  Gangtok: { tagline: "Himalayan Capital", fromPrice: 6799 },
  Mysore: { tagline: "City of Palaces", fromPrice: 5099 },
  Jodhpur: { tagline: "The Blue City", fromPrice: 5699 },
  Nainital: { tagline: "Lake District", fromPrice: 5499 },
  Alleppey: { tagline: "Venice of the East", fromPrice: 5899 },
  Munnar: { tagline: "Tea Country", fromPrice: 5999 },
  "Port Blair": { tagline: "Andaman Gateway", fromPrice: 7499 },
  Guwahati: { tagline: "Northeast Hub", fromPrice: 5299 },
  Chandigarh: { tagline: "The Planned City", fromPrice: 4999 },
  Lucknow: { tagline: "City of Nawabs", fromPrice: 4799 },
  Coorg: { tagline: "Scotland of India", fromPrice: 5599 },
  Ooty: { tagline: "Queen of Nilgiris", fromPrice: 5299 },
  Pondicherry: { tagline: "French Quarters", fromPrice: 4999 },
};

export function getCityMeta(cityName) {
  const known = CITY_META[cityName];
  if (known) return known;
  return {
    tagline: "Explore with us",
    fromPrice: getStartingPrice(cityName, 4999),
  };
}

const CITY_IMAGE_STATE = {
  Delhi: "Delhi",
  Mumbai: "Maharashtra",
  Jaipur: "Rajasthan",
  Udaipur: "Rajasthan",
  Goa: "Goa",
  Manali: "Himachal Pradesh",
  Shimla: "Himachal Pradesh",
  Kochi: "Kerala",
  Srinagar: "Jammu & Kashmir",
  Leh: "Ladakh",
  Agra: "Uttar Pradesh",
  Bangalore: "Karnataka",
  Kolkata: "West Bengal",
  Varanasi: "Uttar Pradesh",
  Rishikesh: "Uttarakhand",
  Chennai: "Tamil Nadu",
  Hyderabad: "Telangana",
  Pune: "Maharashtra",
  Amritsar: "Punjab",
  Darjeeling: "Darjeeling",
  Gangtok: "Sikkim",
  Mysore: "Karnataka",
  Jodhpur: "Rajasthan",
  Nainital: "Uttarakhand",
  Alleppey: "Kerala",
  Munnar: "Kerala",
  "Port Blair": "Andaman and Nicobar",
  Guwahati: "Assam",
  Chandigarh: "Chandigarh",
  Lucknow: "Uttar Pradesh",
  Coorg: "Karnataka",
  Ooty: "Tamil Nadu",
  Pondicherry: "Pondicherry",
};

export function getCityImage(cityName) {
  const stateKey = CITY_IMAGE_STATE[cityName];
  if (stateKey) return getStateImage(stateKey);
  return getStateImage(cityName);
}

export function getStateCities(stateName) {
  return STATE_CITY_HINTS[stateName] || [];
}

export function getStartingPrice(name, base = 4999) {
  const str = String(name || "");
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return base + (Math.abs(hash) % 6) * 1000;
}

export function formatFromPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
