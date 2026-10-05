import Image from "next/image";
import Link from "next/link";
import AllPackagesCatalog from "@/components/packages/AllPackagesCatalog";
import FamousPackagesSection from "@/components/packages/FamousPackagesSection";
import PackagesContentMarquee from "@/components/packages/PackagesContentMarquee";
import PackagesExploreCountries from "@/components/packages/PackagesExploreCountries";
import PackagesExploreStates from "@/components/packages/PackagesExploreStates";
import PackagesFAQ from "@/components/packages/PackagesFAQ";
import PackagesHeroSearch from "@/components/packages/PackagesHeroSearch";
import PackagesHowItWorks from "@/components/packages/PackagesHowItWorks";
import PackagesPopularCities from "@/components/packages/PackagesPopularCities";
import PackagesPromoBanner from "@/components/packages/PackagesPromoBanner";
import PackagesThemeTiles from "@/components/packages/PackagesThemeTiles";
import { buildListingHref } from "@/lib/packageBooking";
import { getFamousPackages } from "@/lib/tourPackages";
import { formatFromPrice, getCityImage, getCityMeta } from "@/lib/tourDestinations";

/**
 * Home page. Every destination, theme and package tile is a real link into the
 * listing (`/packages?...`) or product (`/packages/[slug]`) pages — no popups.
 */
export default function PackagesPageClient({ states = [], cities = [] }) {
  const famousPackages = getFamousPackages();

  return (
    <div className="bg-[#f6f3ee]">
      <PackagesHeroSearch states={states} cities={cities} />
      <PackagesContentMarquee />
      <FamousPackagesSection packages={famousPackages} />
      <PackagesThemeTiles />
      <PackagesExploreStates states={states} />
      <CityChoiceBridge />
      <PackagesPopularCities cities={cities} />
      <PlaceBridge
        dark
        videoSrc="/videos/beyond-india.mp4"
        kicker="Beyond India"
        title="The same plan, a little further from home."
        detail="A wider set of countries we already know how to run. The desk writes the days either way."
      />
      <PackagesExploreCountries />
      <AllPackagesCatalog />
      <PackagesHowItWorks />
      <PackagesPromoBanner />
      <PackagesFAQ />
    </div>
  );
}

const CITY_CHOICES = [
  { city: "Manali", kind: "Hill station", frame: "h-40 sm:h-[240px]" },
  { city: "Jaipur", kind: "Old capital", frame: "h-36 sm:mt-6 sm:h-[200px]" },
  { city: "Goa", kind: "Coast", frame: "h-38 sm:mt-3 sm:h-[220px]" },
];

function CityChoiceBridge() {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10 ">
      <div className="mx-auto grid max-w-7xl  items-center gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div>
          <p className="font-serif text-lg italic text-brand">The next choice</p>
          <h2 className="mt-2 max-w-md font-serif text-3xl font-medium leading-[1.08] tracking-tight text-stone-950 sm:text-4xl">
            A city is a different trip from a whole state.
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-600">
            Hill stations, old capitals, and coasts. The cities people ask for first.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {CITY_CHOICES.map((item) => (
              <li
                key={item.kind}
                className="rounded-full bg-[#ea580c] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white"
              >
                {item.kind}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-3 items-end gap-2.5 sm:gap-3">
          {CITY_CHOICES.map((item) => {
            const meta = getCityMeta(item.city);
            return (
              <Link
                key={item.city}
                href={buildListingHref({ q: item.city })}
                aria-label={`${item.city} tour packages`}
                className={`group relative overflow-hidden rounded-2xl text-left shadow-md ring-2 ring-white transition duration-500 hover:-translate-y-1 ${item.frame}`}
              >
                <Image
                  src={getCityImage(item.city)}
                  alt={item.city}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 220px, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-orange-200">
                    {item.kind}
                  </span>
                  <span className="mt-0.5 block font-serif text-base leading-none text-white sm:text-xl">
                    {item.city}
                  </span>
                  <span className="mt-1.5 inline-flex rounded-full bg-[#ea580c] px-2 py-0.5 text-[11px] font-bold text-white">
                    {formatFromPrice(meta.fromPrice)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PlaceBridge({ kicker, title, detail, dark = false, videoSrc }) {
  return (
    <section
      className={`relative isolate overflow-hidden ${
        dark ? "bg-stone-950 text-white" : "bg-[#efe6dc] text-stone-950"
      }`}
    >
      {videoSrc ? (
        <>
          <video
            className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-stone-950/55" />
        </>
      ) : null}
      <div className="relative z-10 mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
        <div>
          <p className={`font-serif text-lg italic ${dark ? "text-orange-200" : "text-brand"}`}>{kicker}</p>
          <h2 className="mt-2 max-w-xl font-serif text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            {title}
          </h2>
        </div>
        <p className={`text-sm leading-relaxed sm:text-base ${dark ? "text-white/70" : "text-stone-600"}`}>
          {detail}
        </p>
      </div>
    </section>
  );
}
