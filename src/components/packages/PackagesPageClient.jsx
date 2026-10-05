"use client";

import { useCallback, useState } from "react";
import AllPackagesCatalog from "@/components/packages/AllPackagesCatalog";
import PackageEnquiryForm from "@/components/booking/PackageEnquiryForm";
import FamousPackagesSection from "@/components/packages/FamousPackagesSection";
import PackagesContentMarquee from "@/components/packages/PackagesContentMarquee";
import PackagesExploreCountries from "@/components/packages/PackagesExploreCountries";
import PackagesExploreStates from "@/components/packages/PackagesExploreStates";
import PackagesFAQ from "@/components/packages/PackagesFAQ";
import PackagesHeroSearch from "@/components/packages/PackagesHeroSearch";
import PackagesPopularCities from "@/components/packages/PackagesPopularCities";
import PackagesPromoBanner from "@/components/packages/PackagesPromoBanner";
import PackagesWhyTravel from "@/components/packages/PackagesWhyTravel";
import { DEFAULT_PACKAGE_IMAGE, getFamousPackages } from "@/lib/tourPackages";
import { buildEnquiryDestination } from "@/lib/tourEnquiryTypes";

export default function PackagesPageClient({ states = [], cities = [] }) {
  const [enquiryPackage, setEnquiryPackage] = useState(null);
  const famousPackages = getFamousPackages();

  const openEnquiry = useCallback((pkg) => {
    setEnquiryPackage(pkg);
  }, []);

  const openLocationEnquiry = useCallback(
    ({ country, state, city, label, adults, travelDate, tourType }) => {
      const enquiryCountry = country || "India";
      const enquiryState = state || "";
      const enquiryCity = city || "";
      const enquiryLocation = [enquiryCity, enquiryState, enquiryCountry].filter(Boolean).join(", ");

      setEnquiryPackage({
        id: "custom-enquiry",
        title: label || enquiryCity || enquiryState || enquiryCountry || "Custom tour",
        duration: "Flexible",
        location: enquiryLocation || "India",
        destination: buildEnquiryDestination({
          city: enquiryCity,
          state: enquiryState,
          country: enquiryCountry,
          location: enquiryLocation,
          title: label,
        }),
        city: enquiryCity,
        state: enquiryState,
        country: enquiryCountry,
        image: DEFAULT_PACKAGE_IMAGE,
        defaultTravellers: adults ?? 2,
        defaultTravelDate: travelDate ?? "",
        defaultTourType: tourType ?? "",
      });
    },
    []
  );

  return (
    <div className="bg-[#f6f3ee]">
      <PackagesHeroSearch states={states} cities={cities} />
      <PackagesContentMarquee />
      <FamousPackagesSection packages={famousPackages} onViewDetails={openEnquiry} />
      <PackagesExploreStates states={states} onEnquire={openLocationEnquiry} />
      <PlaceBridge
        kicker="The next choice"
        title="A city is a different trip from a whole state."
        detail="Hill stations, old capitals, and coasts. The cities people ask for first."
      />
      <PackagesPopularCities cities={cities} onEnquire={openLocationEnquiry} />
      <PlaceBridge
        dark
        videoSrc="/videos/beyond-india.mp4"
        kicker="Beyond India"
        title="The same plan, a little further from home."
        detail="A wider set of countries we already know how to run. The desk writes the days either way."
      />
      <PackagesExploreCountries onEnquire={openLocationEnquiry} />
      <AllPackagesCatalog onViewDetails={openEnquiry} />
      <PackagesPromoBanner onEnquire={() => openLocationEnquiry({ label: "Promo package enquiry" })} />
      <PackagesWhyTravel />
      <PackagesFAQ />

      <PackageEnquiryForm
        open={Boolean(enquiryPackage)}
        onClose={() => setEnquiryPackage(null)}
        tourPackage={enquiryPackage}
      />
    </div>
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
