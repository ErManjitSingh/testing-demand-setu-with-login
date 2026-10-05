const MARQUEE_ITEMS = [
  "18+ curated tour packages",
  "6 countries covered",
  "4.9 average guest rating",
  "Verified local partners",
  "24/7 orange-line support",
  "International & domestic",
  "Best price guarantee",
  "Custom itineraries",
];

export default function PackagesContentMarquee() {
  return (
    <section className="overflow-hidden py-5" aria-label="Why travellers choose Demand Setu">
      <div className="animate-marquee-ltr flex w-max">
        {[0, 1].map((set) => (
          <div key={set} className="flex items-center gap-10 pr-10">
            {MARQUEE_ITEMS.map((item) => (
              <span
                key={`${set}-${item}`}
                className="flex items-center gap-3 whitespace-nowrap text-sm font-semibold tracking-wide text-stone-800"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
