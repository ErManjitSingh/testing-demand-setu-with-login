/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/stays",
        destination: "/accommodations",
        permanent: false,
      },
      // Places guide: state URLs read "places-to-visit-in-<state>". Send old un-prefixed URLs there (308).
      {
        source: "/places/india/:state((?!places-to-visit-in-)[^/]+)",
        destination: "/places/india/places-to-visit-in-:state",
        permanent: true,
      },
      {
        source: "/places/india/:state((?!places-to-visit-in-)[^/]+)/:rest*",
        destination: "/places/india/places-to-visit-in-:state/:rest*",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.demandsetutours.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "packagemaker-image.firebasestorage.app",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
