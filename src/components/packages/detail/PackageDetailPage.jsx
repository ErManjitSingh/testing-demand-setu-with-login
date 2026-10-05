"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Eye,
  MapPin,
  Search,
  Share2,
  Star,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import BookingCard from "@/components/packages/detail/BookingCard";
import DetailGallery from "@/components/packages/detail/DetailGallery";
import {
  DepartureStrip,
  FaqAccordion,
  HighlightsGrid,
  InclusionsExclusions,
  PolicyTabs,
  QuickFacts,
  ReviewsSection,
  SectionHeading,
  SectionNav,
  StaysList,
  TrustRow,
} from "@/components/packages/detail/DetailSections";
import ItineraryTimeline from "@/components/packages/detail/ItineraryTimeline";
import LeadDialog from "@/components/packages/detail/LeadDialog";
import ListingPackageCard from "@/components/packages/listing/ListingPackageCard";
import AnimatedPrice from "@/components/packages/shared/AnimatedPrice";
import { getThemeIcon } from "@/components/packages/shared/themeIcons";
import TripSearchBar from "@/components/packages/shared/TripSearchBar";
import WishlistButton from "@/components/packages/shared/WishlistButton";
import { buildBookingHref } from "@/lib/packageBooking";
import { calculateTripPrice } from "@/lib/tourPackageDetails";
import { THEME_BY_ID } from "@/lib/tourPackageMeta";
import { formatPackagePrice } from "@/lib/tourPackages";
import PackageEnquiryForm from "@/components/booking/PackageEnquiryForm";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "itinerary", label: "Itinerary" },
  { id: "dates", label: "Dates & prices" },
  { id: "inclusions", label: "Inclusions" },
  { id: "stays", label: "Stays" },
  { id: "reviews", label: "Reviews" },
  { id: "policies", label: "Policies" },
  { id: "faqs", label: "FAQs" },
];

export default function PackageDetailPage({ pkg, detail, similar, initialBooking }) {
  const router = useRouter();
  const [booking, setBooking] = useState(() => ({
    date: initialBooking.date,
    travellers: initialBooking.travellers,
    hotel: "standard",
    departureCity: "Delhi",
    tourType: initialBooking.travellers.children > 0 ? "family" : "private",
    ticketBooked: "no",
  }));
  const [dateError, setDateError] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadKey, setLeadKey] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [enquiry, setEnquiry] = useState(null);

  const patchBooking = useCallback((patch) => {
    if (patch.date) setDateError(false);
    setBooking((b) => ({ ...b, ...patch }));
  }, []);

  const departure = useMemo(
    () => detail.departures.find((d) => d.date === booking.date) ?? null,
    [detail.departures, booking.date]
  );

  const pricing = useMemo(
    () =>
      calculateTripPrice({
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        adults: booking.travellers.adults,
        childAges: booking.travellers.childAges,
        infants: booking.travellers.infants,
        hotelCategory: booking.hotel,
        dateFactor: departure?.factor ?? 1,
      }),
    [pkg.price, pkg.originalPrice, booking.travellers, booking.hotel, departure]
  );

  const reserve = useCallback(() => {
    if (!booking.date) {
      setDateError(true);
      document.getElementById("booking-date")?.focus();
      return;
    }
    setSheetOpen(false);
    router.push(buildBookingHref(pkg.slug, booking));
  }, [booking, pkg.slug, router]);

  const quote = useCallback(() => {
    setLeadKey((k) => k + 1);
    setLeadOpen(true);
    setSheetOpen(false);
  }, []);

  const flash = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }, []);

  const share = useCallback(async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: pkg.title, text: pkg.description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      flash("Link copied to clipboard");
    } catch {
      /* user dismissed the share sheet */
    }
  }, [pkg.title, pkg.description, flash]);

  const openSimilarEnquiry = useCallback(
    (other) =>
      setEnquiry({
        ...other,
        defaultTravellers: booking.travellers.adults,
        defaultChildren: booking.travellers.children,
        defaultChildAges: booking.travellers.childAges,
        defaultInfants: booking.travellers.infants,
        defaultTravelDate: booking.date,
      }),
    [booking.travellers, booking.date]
  );

  const { meta } = pkg;
  const similarFilters = useMemo(
    () => ({ date: booking.date, travellers: booking.travellers }),
    [booking.date, booking.travellers]
  );

  const card = (
    <BookingCard
      pkg={pkg}
      booking={booking}
      onChange={patchBooking}
      pricing={pricing}
      departure={departure}
      onReserve={reserve}
      onQuote={quote}
      dateError={dateError}
    />
  );

  return (
    <div className="bg-[#f6f3ee] pb-28 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-7">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs font-bold text-stone-500">
          <Link href="/" className="transition hover:text-brand">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
          <Link href="/packages" className="transition hover:text-brand">Packages</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
          <Link href={`/packages?q=${encodeURIComponent(pkg.state)}`} className="transition hover:text-brand">{pkg.state}</Link>
          <ChevronRight className="h-3.5 w-3.5 text-stone-300" />
          <span className="text-stone-900">{pkg.title}</span>
        </nav>

        {/* Search another trip */}
        <div className="pk-fade-up mb-6">
          <p className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
            <Search className="h-3.5 w-3.5 text-brand" />
            Looking for something different? Search all trips
          </p>
          <TripSearchBar initialDate={initialBooking.date} initialTravellers={initialBooking.travellers} />
        </div>

        {/* Title row */}
        <header className="pk-fade-up mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {meta.themes.map((id) => {
                const Icon = getThemeIcon(id);
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-brand-dark shadow-sm ring-1 ring-orange-100">
                    <Icon className="h-3.5 w-3.5" />
                    {THEME_BY_ID[id]?.label}
                  </span>
                );
              })}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-[11px] font-extrabold text-rose-600">
                <Eye className="h-3.5 w-3.5" />
                {meta.viewing} people viewing now
              </span>
            </div>
            <h1 className="mt-3 font-serif text-4xl font-medium leading-[1.05] tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              {pkg.title}
            </h1>
            <p className="mt-2 text-base font-medium text-stone-500">{pkg.subtitle}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold text-stone-700">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {pkg.rating}
                <a href="#reviews" className="font-semibold text-stone-500 underline-offset-2 hover:text-brand hover:underline">
                  ({pkg.reviews} reviews)
                </a>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-brand" />
                {pkg.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand" />
                {pkg.duration}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-stone-800 shadow-sm ring-1 ring-stone-200 transition hover:ring-brand/40"
            >
              <ArrowLeft className="h-4 w-4" />
              All trips
            </Link>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-stone-800 shadow-sm ring-1 ring-stone-200 transition hover:ring-brand/40 active:scale-95"
            >
              <Share2 className="h-4 w-4 text-brand" />
              Share
            </button>
            <WishlistButton packageId={pkg.id} label tone="solid" />
          </div>
        </header>

        <DetailGallery images={detail.gallery} badge={pkg.badge} />

        <div className="mt-6">
          <QuickFacts facts={detail.quickFacts} />
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-12">
          {/* Main column */}
          <div className="min-w-0 space-y-14 sm:space-y-16">
            <SectionNav sections={SECTIONS} />

            <section className="-mt-6 sm:-mt-8">
              <SectionHeading id="overview" eyebrow="The trip" title="Overview" subtitle={`Why travellers love ${pkg.title}`} />
              <HighlightsGrid highlights={pkg.highlights} description={pkg.description} />
              <div className="mt-6">
                <TrustRow />
              </div>
            </section>

            <section>
              <SectionHeading
                id="itinerary"
                eyebrow="Day by day"
                title="Itinerary"
                subtitle="A balanced plan — big sights, free time, and a coordinator one call away."
              />
              <ItineraryTimeline itinerary={detail.itinerary} />
            </section>

            <section>
              <SectionHeading
                id="dates"
                eyebrow="Plan your dates"
                title="Departure dates & prices"
                subtitle="Pick a fixed departure for the best rates, or choose any custom date in the booking card."
              />
              <DepartureStrip
                departures={detail.departures}
                selected={booking.date}
                onSelect={(date) => {
                  patchBooking({ date });
                  flash(`Date set · ${new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`);
                }}
              />
              <p className="mt-2 text-xs font-medium text-stone-500">
                Prices are per person on twin sharing in Standard hotels. Adjust hotel grade, adults and children in the
                booking card.
              </p>
            </section>

            <section>
              <SectionHeading id="inclusions" eyebrow="The details" title="Inclusions & exclusions" />
              <InclusionsExclusions inclusions={detail.inclusions} exclusions={detail.exclusions} />
            </section>

            <section>
              <SectionHeading
                id="stays"
                eyebrow="Where you'll sleep"
                title="Your stays"
                subtitle={`${meta.stars}★ hotels chosen for location, cleanliness and service.`}
              />
              <StaysList hotels={detail.hotels} />
            </section>

            <section>
              <SectionHeading id="reviews" eyebrow="Real travellers" title="Guest reviews" />
              <ReviewsSection reviews={detail.reviews} />
            </section>

            <section>
              <SectionHeading id="policies" eyebrow="Good to know" title="Policies & preparation" />
              <PolicyTabs policies={detail.policies} thingsToCarry={detail.thingsToCarry} />
            </section>

            <section>
              <SectionHeading id="faqs" eyebrow="Still wondering?" title="Frequently asked questions" />
              <FaqAccordion faqs={detail.faqs} />
            </section>
          </div>

          {/* Booking column */}
          <aside className="hidden lg:block">
            <div
              className="pk-fade-up no-scrollbar sticky top-24 -m-3 max-h-[calc(100vh-7rem)] overflow-y-auto p-3"
              style={{ animationDelay: "200ms" }}
            >
              {card}
            </div>
          </aside>
        </div>

        {similar.length > 0 ? (
          <section className="mt-20 pb-16">
            <div className="mb-6">
              <p className="font-serif text-lg italic text-brand">You may also like</p>
              <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">Similar trips</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {similar.map((p, i) => (
                <ListingPackageCard
                  key={p.id}
                  pkg={p}
                  filters={similarFilters}
                  index={i}
                  onEnquire={openSimilarEnquiry}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-stone-200 bg-white/95 px-4 pb-[max(0.75rem,var(--safe-bottom))] pt-3 shadow-[0_-12px_40px_-12px_rgba(28,25,23,0.25)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
              Est. total · {booking.travellers.adults + booking.travellers.children + booking.travellers.infants} travellers
            </p>
            <AnimatedPrice value={pricing.total} className="text-xl font-extrabold text-stone-900" />
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="pk-sweep rounded-full bg-brand px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/40 active:scale-95"
          >
            Check dates & book
          </button>
        </div>
      </div>

      {/* Mobile booking sheet */}
      {sheetOpen ? (
        <div className="fixed inset-0 z-[110] lg:hidden" role="dialog" aria-modal="true" aria-label="Book this trip">
          <button
            type="button"
            aria-label="Close"
            className="pk-fade absolute inset-0 bg-stone-950/60 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />
          <div className="pk-slide-up absolute inset-x-0 bottom-0 flex max-h-[92vh] flex-col rounded-t-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
              <div>
                <p className="text-base font-extrabold text-stone-900">{pkg.title}</p>
                <p className="text-xs font-semibold text-stone-500">{pkg.duration} · from {formatPackagePrice(pkg.price)} / person</p>
              </div>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full bg-stone-100 text-stone-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-5 pb-[max(1.25rem,var(--safe-bottom))] pt-5">
              <BookingCard
                compact
                pkg={pkg}
                booking={booking}
                onChange={patchBooking}
                pricing={pricing}
                departure={departure}
                onReserve={reserve}
                onQuote={quote}
                dateError={dateError}
              />
            </div>
          </div>
        </div>
      ) : null}

      <LeadDialog
        key={leadKey}
        open={leadOpen}
        onClose={() => setLeadOpen(false)}
        pkg={pkg}
        booking={booking}
        pricing={pricing}
      />

      <PackageEnquiryForm open={Boolean(enquiry)} onClose={() => setEnquiry(null)} tourPackage={enquiry} />

      {/* Toast */}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed left-1/2 top-24 z-[140] -translate-x-1/2 transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-bold text-white shadow-2xl">
          <Check className="h-4 w-4 text-emerald-400" strokeWidth={3} />
          {toast}
        </div>
      </div>
    </div>
  );
}
