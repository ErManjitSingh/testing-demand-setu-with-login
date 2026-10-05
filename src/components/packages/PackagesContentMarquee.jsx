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
    <section className="bg-[#f6f3ee] px-4 pb-4 pt-8 sm:px-6">
      <div className="mx-auto grid max-w-6xl grid-cols-2 overflow-hidden rounded-3xl border border-stone-200 bg-white sm:grid-cols-4">
        {MARQUEE_ITEMS.map((item, index) => (
          <p
            key={item}
            className={`px-4 py-4 text-sm font-semibold text-stone-800 ${
              index % 4 !== 0 ? "sm:border-l sm:border-stone-100" : ""
            } ${index >= 4 ? "border-t border-stone-100" : ""} ${
              index % 2 === 1 ? "border-l border-stone-100 sm:border-l" : ""
            }`}
          >
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}
