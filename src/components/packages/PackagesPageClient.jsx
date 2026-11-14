import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import AllPackagesCatalog from "@/components/packages/AllPackagesCatalog";
import FamousPackagesSection from "@/components/packages/FamousPackagesSection";
import PackagesAnnouncement from "@/components/packages/PackagesAnnouncement";
import PackagesContentMarquee from "@/components/packages/PackagesContentMarquee";
import PackagesExploreCountries from "@/components/packages/PackagesExploreCountries";
import PackagesExploreStates from "@/components/packages/PackagesExploreStates";
import PackagesFAQ from "@/components/packages/PackagesFAQ";
import PackagesHeroSearch from "@/components/packages/PackagesHeroSearch";
import PackagesPopularCities from "@/components/packages/PackagesPopularCities";
import PackagesPromoBanner from "@/components/packages/PackagesPromoBanner";
import PackagesThemeContent from "@/components/packages/PackagesThemeContent";
import PackagesThemeTiles from "@/components/packages/PackagesThemeTiles";
import { buildListingHref } from "@/lib/packageBooking";
import { resolveHomeBlocks } from "@/lib/packageHomeApi";
import { getFamousPackages } from "@/lib/tourPackages";
import { formatFromPrice, getCityImage, getCityMeta } from "@/lib/tourDestinations";

/**
 * Home page. Every destination, theme and package tile is a real link into the
 * listing (`/packages?...`) or product (`/packages/[slug]`) pages — no popups.
 *
 * `homeConfig` is the admin-managed content (see `lib/packageHomeApi.js`). When it
 * is missing the page renders exactly its built-in content.
 */
export default function PackagesPageClient({ states = [], cities = [], homeConfig = null }) {
  const famousPackages = getFamousPackages();
  const blocks = resolveHomeBlocks(homeConfig);

  // Consecutive theme-content blocks alternate their image side
  let contentIndex = 0;

  const renderBlock = ({ type, section }) => {
    switch (type) {
      case "theme":
        return <PackagesThemeTiles config={section} />;
      case "content":
        return <PackagesThemeContent block={section} reverse={contentIndex++ % 2 === 1} />;
      case "state":
        return <PackagesExploreStates states={states} config={section} />;
      case "city":
        return (
          <>
            <CityChoiceBridge />
            <PackagesPopularCities cities={cities} config={section} />
          </>
        );
      case "country":
        return (
          <>
            <PlaceBridge
              videoSrc="/videos/beyond-india.mp4"
              kicker="Beyond India"
              title="The same plan, a little further from home."
              detail="A wider set of countries we already know how to run. The desk writes the days either way."
            />
            <PackagesExploreCountries config={section} />
          </>
        );
      case "tail":
        return (
          <>
            <AllPackagesCatalog />
            <PackagesPromoBanner />
          </>
        );
      case "testimonial":
        // "Guest stories" section is intentionally not shown on the home page
        return null;
      case "faq":
        return <PackagesFAQ config={section} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-stone-100">
      <PackagesHeroSearch
        states={states}
        cities={cities}
        header={homeConfig?.header ?? null}
        stats={homeConfig?.stats ?? null}
      />
      <PackagesAnnouncement config={homeConfig?.announcement ?? null} />
      <PackagesContentMarquee />
      {homeConfig?.hidden?.includes("famousPackage") ? null : (
        <FamousPackagesSection packages={famousPackages} config={homeConfig?.famousPackage ?? null} />
      )}
      {blocks.map((block) => (
        <Fragment key={block.key}>{renderBlock(block)}</Fragment>
      ))}
    </div>
  );
}

const CITY_CHOICES = [
  { city: "Manali", kind: "Hill station" },
  { city: "Jaipur", kind: "Old capital" },
  { city: "Goa", kind: "Coast" },
];

function CityChoiceBridge() {
  return (
    <section className="px-3 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto grid max-w-7xl items-center gap-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#fff7ec] via-[#fdf1e2] to-[#fbe7d0] p-4 shadow-sm ring-1 ring-orange-100 sm:rounded-3xl sm:p-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">The next choice</p>
          <h2 className="mt-1 max-w-md text-2xl font-extrabold leading-tight tracking-tight text-[#7a2e12] sm:text-4xl">
            A city is a different trip from a whole state.
          </h2>
          <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-stone-600">
            Hill stations, old capitals, and coasts. The cities people ask for first.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CITY_CHOICES.map((item) => (
              <li
                key={item.kind}
                className="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-brand shadow-sm ring-1 ring-brand/20"
              >
                {item.kind}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {CITY_CHOICES.map((item) => {
            const meta = getCityMeta(item.city);
            return (
              <Link
                key={item.city}
                href={buildListingHref({ place: item.city })}
                aria-label={`${item.city} tour packages`}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Image
                  src={getCityImage(item.city)}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 220px, 33vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-2.5 text-white sm:p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-orange-200">{item.kind}</span>
                  <span className="mt-0.5 block text-sm font-extrabold leading-tight sm:text-lg">{item.city}</span>
                  <span className="mt-1.5 inline-flex rounded-md bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white">
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

function PlaceBridge({ kicker, title, detail, videoSrc }) {
  return (
    <section className="px-3 py-3 sm:px-6 sm:py-4">
      <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-2xl bg-stone-950 text-white shadow-sm sm:rounded-3xl">
        {videoSrc ? (
          <>
            <video
              className="absolute inset-0 -z-10 h-full w-full object-cover motion-reduce:hidden"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-950/80 via-stone-950/55 to-stone-950/30" />
          </>
        ) : null}
        <div className="grid gap-4 px-5 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-200">{kicker}</p>
            <h2 className="mt-2 max-w-xl text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">{title}</h2>
          </div>
          <p className="text-sm font-medium leading-relaxed text-white/80 sm:text-base">{detail}</p>
        </div>
      </div>
    </section>
  );
}
