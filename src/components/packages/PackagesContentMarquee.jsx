const MARQUEE_ITEMS = [
  "🏔️ 18+ curated tour packages",
  "🌏 6 countries covered",
  "⭐ 4.9 average guest rating",
  "🛡️ Verified local partners",
  "📞 24/7 orange-line support",
  "✈️ International & domestic",
  "💰 Best price guarantee",
  "🎯 Custom itineraries",
];

export default function PackagesContentMarquee() {
  return (
    <div className="overflow-hidden border-y border-brand/15 bg-gradient-to-r from-brand-muted via-orange-50 to-brand-muted py-3">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap px-4 text-sm font-bold text-stone-700">
        {[...Array(2)].map((_, set) => (
          <span key={set} className="flex gap-10">
            {MARQUEE_ITEMS.map((item) => (
              <span key={`${set}-${item}`}>{item}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
