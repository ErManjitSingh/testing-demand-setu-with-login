export const CATEGORIES = [
  {
    id: "hotel",
    label: "Hotels",
    description: "Premium stays with concierge & dining",
    icon: "🏨",
    count: "120+",
    cover:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  },
  {
    id: "airbnb",
    label: "Airbnb",
    description: "Unique homes hosted by locals",
    icon: "🏠",
    count: "85+",
    cover:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
  },
  {
    id: "homestay",
    label: "HomeStay & Villa",
    description: "Private villas & family homestays",
    icon: "🌴",
    count: "60+",
    cover:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
  },
];

/** Category showcase covers — fallback when a listing has no photo. */
export function getCategoryFallbackImage(categoryId = "hotel") {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat?.cover ?? CATEGORIES[0].cover;
}

export const DESTINATIONS = [
  {
    name: "Goa",
    stays: 48,
    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80",
  },
  {
    name: "Manali",
    stays: 32,
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3b008a0e8?w=600&q=80",
  },
  {
    name: "Udaipur",
    stays: 27,
    image:
      "https://images.unsplash.com/photo-1599661046280-ea67c9e43577?w=600&q=80",
  },
  {
    name: "Kerala",
    stays: 41,
    image:
      "https://images.unsplash.com/photo-1602211447921-45921b81a06b?w=600&q=80",
  },
  {
    name: "Jaipur",
    stays: 35,
    image:
      "https://images.unsplash.com/photo-1477587459743-66bbfb8d9db9?w=600&q=80",
  },
  {
    name: "Mumbai",
    stays: 29,
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c0f802?w=600&q=80",
  },
];

export const TESTIMONIALS = [
  {
    name: "Ananya Sharma",
    location: "Mumbai",
    avatar: "AS",
    rating: 5,
    text: "The Orange Grove Villa in Coorg was breathtaking. Demand Setu handled everything—from ferry to butler service. Felt like a 5-star retreat.",
    stay: "Orange Grove Private Villa",
  },
  {
    name: "Rohit Mehta",
    location: "Delhi",
    avatar: "RM",
    rating: 5,
    text: "Booked a heritage hotel in Udaipur through the app. Seamless check-in, incredible rooftop dinner. Already planning our next trip!",
    stay: "Sunset Palace Heritage Hotel",
  },
  {
    name: "Priya Nair",
    location: "Bangalore",
    avatar: "PN",
    rating: 5,
    text: "Our Bandra loft had the most stunning sea views. The host recommendations and 24/7 orange-line support made it stress-free.",
    stay: "Cozy Bandra Loft",
  },
];

export const SAMPLE_REVIEWS = [
  {
    name: "Vikram S.",
    date: "March 2026",
    avatar: "VS",
    rating: 5,
    text: "Absolutely stunning property. The photos don't do justice—the pool at sunset was magical. Staff went above and beyond.",
  },
  {
    name: "Meera K.",
    date: "February 2026",
    avatar: "MK",
    rating: 5,
    text: "Perfect for our anniversary. Clean, luxurious, and the breakfast spread was incredible. Will definitely return.",
  },
  {
    name: "Arjun P.",
    date: "January 2026",
    avatar: "AP",
    rating: 4,
    text: "Great location and amenities. Only minor note—WiFi was slow in one room but fixed quickly after we reported it.",
  },
];

export const AMENITIES = [
  "Free WiFi",
  "Pool",
  "Breakfast",
  "Parking",
  "AC",
  "Kitchen",
  "Pet friendly",
  "Spa",
];

export const LISTINGS = [
  {
    slug: "grand-orange-resort-goa",
    title: "Grand Orange Resort & Spa",
    category: "hotel",
    location: "Calangute, Goa",
    region: "Goa",
    rating: 4.9,
    reviews: 428,
    price: 6499,
    originalPrice: 8999,
    badge: "Top rated",
    guests: 2,
    beds: 1,
    baths: 1,
    nights: 1,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
    ],
    amenities: ["Free WiFi", "Pool", "Breakfast", "Spa", "Parking"],
    host: "Demand Setu Hospitality",
    description:
      "Wake up to Arabian Sea views from your private balcony. Our orange-themed resort blends Goan charm with boutique luxury—infinity pool, rooftop dining, and curated local experiences.",
  },
  {
    slug: "sunset-palace-udaipur",
    title: "Sunset Palace Heritage Hotel",
    category: "hotel",
    location: "Lake Pichola, Udaipur",
    region: "Rajasthan",
    rating: 4.8,
    reviews: 312,
    price: 8999,
    originalPrice: 11999,
    badge: "Heritage",
    guests: 2,
    beds: 1,
    baths: 1,
    nights: 1,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80",
    ],
    amenities: ["Free WiFi", "Breakfast", "Spa", "Parking"],
    host: "Royal Stays Collection",
    description:
      "A lakeside heritage property with marble courtyards, rooftop candle dinners, and palace views. Perfect for romantic getaways and cultural explorers.",
  },
  {
    slug: "metro-business-suites-delhi",
    title: "Metro Business Suites",
    category: "hotel",
    location: "Connaught Place, Delhi",
    region: "Delhi",
    rating: 4.6,
    reviews: 189,
    price: 4299,
    badge: "Business pick",
    guests: 2,
    beds: 1,
    baths: 1,
    nights: 1,
    image:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80",
    ],
    amenities: ["Free WiFi", "Breakfast", "AC", "Parking"],
    host: "Demand Setu Corporate",
    description:
      "Central Delhi comfort for business travelers—express check-in, work lounge, and quick airport transfers available on request.",
  },
  {
    slug: "cozy-loft-bandra-mumbai",
    title: "Cozy Bandra Loft with Sea View",
    category: "airbnb",
    location: "Bandra West, Mumbai",
    region: "Maharashtra",
    rating: 4.95,
    reviews: 156,
    price: 3499,
    badge: "Superhost",
    guests: 4,
    beds: 2,
    baths: 1,
    nights: 1,
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
    ],
    amenities: ["Free WiFi", "Kitchen", "AC", "Pet friendly"],
    host: "Priya & Rahul",
    description:
      "Sunlit loft steps from Bandstand. Fully equipped kitchen, fast WiFi, and a balcony perfect for evening chai overlooking the bay.",
  },
  {
    slug: "artist-studio-jaipur",
    title: "Artist Studio in Pink City",
    category: "airbnb",
    location: "C-Scheme, Jaipur",
    region: "Rajasthan",
    rating: 4.87,
    reviews: 98,
    price: 2199,
    badge: "Unique stay",
    guests: 2,
    beds: 1,
    baths: 1,
    nights: 1,
    image:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
    ],
    amenities: ["Free WiFi", "Kitchen", "Breakfast"],
    host: "Ananya",
    description:
      "Hand-painted walls, local art, and a courtyard breakfast. Walk to Hawa Mahal and curated bazaar tours arranged by your host.",
  },
  {
    slug: "treehouse-retreat-wayanad",
    title: "Rainforest Treehouse Retreat",
    category: "airbnb",
    location: "Wayanad, Kerala",
    region: "Kerala",
    rating: 4.92,
    reviews: 74,
    price: 4999,
    badge: "Nature escape",
    guests: 2,
    beds: 1,
    baths: 1,
    nights: 1,
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    ],
    amenities: ["Free WiFi", "Breakfast", "Pet friendly"],
    host: "Eco Host Collective",
    description:
      "Elevated among misty canopy—birdwatching mornings, campfire nights, and zero-screen digital detox packages.",
  },
  {
    slug: "orange-grove-villa-coorg",
    title: "Orange Grove Private Villa",
    category: "homestay",
    location: "Madikeri, Coorg",
    region: "Karnataka",
    rating: 4.96,
    reviews: 203,
    price: 7999,
    originalPrice: 9999,
    badge: "Villa exclusive",
    guests: 8,
    beds: 4,
    baths: 3,
    nights: 1,
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    ],
    amenities: ["Free WiFi", "Pool", "Kitchen", "Parking", "Breakfast"],
    host: "The Menon Family",
    description:
      "Four-bedroom estate with private pool, coffee plantation walks, and home-cooked Kodava meals. Ideal for reunions and work retreats.",
  },
  {
    slug: "himalayan-homestay-manali",
    title: "Himalayan Cedar Homestay",
    category: "homestay",
    location: "Old Manali, Himachal",
    region: "Himachal Pradesh",
    rating: 4.88,
    reviews: 167,
    price: 1899,
    badge: "Family hosted",
    guests: 4,
    beds: 2,
    baths: 2,
    nights: 1,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    ],
    amenities: ["Free WiFi", "Breakfast", "Parking", "Kitchen"],
    host: "Dorje & family",
    description:
      "Wood-fired hearth, apple orchards, and snow peak views. Authentic Himachali meals and guided village treks included.",
  },
  {
    slug: "beach-villa-alibaug",
    title: "Coral Sands Beach Villa",
    category: "homestay",
    location: "Alibaug, Maharashtra",
    region: "Maharashtra",
    rating: 4.91,
    reviews: 134,
    price: 12499,
    badge: "Premium villa",
    guests: 10,
    beds: 5,
    baths: 4,
    nights: 1,
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    ],
    amenities: ["Free WiFi", "Pool", "Kitchen", "Parking", "Pet friendly"],
    host: "Coastal Escapes",
    description:
      "Direct beach access, infinity deck, BBQ nights, and ferry pickup from Mumbai. Butler service on weekends.",
  },
];

export function getListingBySlug(slug) {
  return LISTINGS.find((item) => item.slug === slug);
}

export function getListingsByCategory(category) {
  if (!category || category === "all") return LISTINGS;
  return LISTINGS.filter((item) => item.category === category);
}

export function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCategoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? "All stays";
}
