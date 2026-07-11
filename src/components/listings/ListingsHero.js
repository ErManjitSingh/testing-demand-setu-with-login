import { Suspense } from "react";
import { Playfair_Display } from "next/font/google";
import ListingsHeroSearch from "@/components/listings/ListingsHeroSearch";
import ListingsHeroBackground from "@/components/listings/ListingsHeroBackground";
import { plainSeoText } from "@/lib/seoListingApi";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["italic"],
});

const TRUST_ITEMS = [
  { icon: "tag", label: "Best Price Guarantee" },
  { icon: "home", label: "Handpicked Properties" },
  { icon: "headset", label: "24/7 Customer Support" },
  { icon: "calendar", label: "Free Cancellation" },
];

export default function ListingsHero({
  category,
  cover,
  description,
  seo = null,
  initialCity = "",
  initialState = "",
  initialLocationKind = null,
  initialCheckIn = "",
  initialCheckOut = "",
  initialAdults = 2,
  initialChildren = 0,
  initialRooms = 1,
}) {
  const heroTitle = seo?.heading || null;
  const heroSubtitle =
    plainSeoText(seo?.subHeading) ||
    plainSeoText(description) ||
    "Hotels, villas & unique stays for unforgettable memories.";
  const heroImageAlt =
    seo?.images?.[0]?.name || seo?.focusKeyword || seo?.heading || "Destination stays";

  return (
    <section className="relative z-30">
      <div className="absolute inset-0 overflow-hidden">
        <ListingsHeroBackground
          images={seo?.images}
          fallbackCover={cover}
          fallbackAlt={heroImageAlt}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)] sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            {heroTitle ? (
              heroTitle
            ) : (
              <>
                Extraordinary stays,{" "}
                <span className={`${playfair.className} text-brand`}>
                  crafted for you.
                </span>
              </>
            )}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)] sm:text-lg">
            {heroSubtitle}
          </p>

          <div className="relative z-20 mx-auto mt-8 max-w-4xl overflow-visible sm:mt-10">
            <Suspense fallback={null}>
              <ListingsHeroSearch
                category={category}
                initialCity={initialCity}
                initialState={initialState}
                initialLocationKind={initialLocationKind}
                initialCheckIn={initialCheckIn}
                initialCheckOut={initialCheckOut}
                initialAdults={initialAdults}
                initialChildren={initialChildren}
                initialRooms={initialRooms}
              />
            </Suspense>
          </div>

          <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-8">
            {TRUST_ITEMS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-xs font-medium text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)] sm:text-sm"
              >
                <TrustIcon type={item.icon} />
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
function TrustIcon({ type }) {
  const className = "h-4 w-4 text-orange-300 sm:h-[18px] sm:w-[18px]";
  switch (type) {
    case "tag":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      );
    case "home":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case "headset":
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 0v3.75m-9 0V21m-1.5 0H4.875c-.621 0-1.125-.504-1.125-1.125v-9.75c0-.621.504-1.125 1.125-1.125h3.375c.621 0 1.125.504 1.125 1.125v3.75M19.125 12H21.75c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-3.375c-.621 0-1.125-.504-1.125-1.125v-3.75" />
        </svg>
      );
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5a2.25 2.25 0 012.25 2.25V18.75M3 18.75h18" />
        </svg>
      );
  }
}

