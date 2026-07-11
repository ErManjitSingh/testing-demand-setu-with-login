import ListingRowCard from "@/components/listings/ListingRowCard";

export default function AllPropertiesList({
  listings,
  requireBooking = false,
  onBookingBlocked,
}) {
  if (!listings.length) return null;

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Full catalogue
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-foreground sm:text-2xl">
            All properties
          </h2>
          <p className="mt-1 text-sm text-muted">
            {listings.length} stays · scroll to explore
          </p>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-600 ring-1 ring-stone-200">
          {listings.length} listings
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {listings.map((listing, index) => (
          <ListingRowCard
            key={listing.slug}
            listing={listing}
            featured={index === 0}
            requireBooking={requireBooking}
            onBookingBlocked={onBookingBlocked}
          />
        ))}
      </div>
    </section>
  );
}
