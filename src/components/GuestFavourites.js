import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import SectionHeading from "@/components/SectionHeading";

export default function GuestFavourites({ featured }) {
  const spotlight = featured[0];
  const sideCards = featured.slice(1, 3);

  if (!spotlight) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Guest favourites"
        title="Stays loved by thousands"
        subtitle="Rated 4.9+ with exceptional reviews from real travellers."
        action={
          <Link
            href="/listings?state=Himachal%20Pradesh"
            className="inline-flex items-center gap-2 rounded-full border-2 border-brand bg-white px-5 py-2.5 text-sm font-bold text-brand shadow-sm transition hover:bg-brand hover:text-white"
          >
            See all
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        }
      />

      {/* Desktop: stable 60/40 split — no broken CSS grid row-span */}
      <div className="mt-8 hidden lg:flex lg:gap-5" style={{ height: "520px" }}>
        <div className="w-[58%] shrink-0">
          <PropertyCard listing={spotlight} featured />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
          {sideCards.map((listing) => (
            <div key={listing.slug} className="flex-1">
              <PropertyCard listing={listing} variant="horizontal" />
            </div>
          ))}
        </div>
      </div>

      {/* Tablet: 2-column grid, spotlight full width */}
      <div className="mt-8 hidden gap-5 sm:grid sm:grid-cols-2 lg:hidden">
        <div className="sm:col-span-2">
          <PropertyCard listing={spotlight} featured />
        </div>
        {sideCards.map((listing) => (
          <PropertyCard key={listing.slug} listing={listing} />
        ))}
      </div>

      {/* Mobile: horizontal scroll — no overlapping bento */}
      <div className="no-scrollbar mt-8 flex gap-4 overflow-x-auto pb-2 sm:hidden">
        {featured.map((listing) => (
          <div key={listing.slug} className="w-[85vw] max-w-[340px] shrink-0">
            <PropertyCard listing={listing} />
          </div>
        ))}
      </div>
    </section>
  );
}
