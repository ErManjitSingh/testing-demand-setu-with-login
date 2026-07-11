"use client";

import AnimateIn from "@/components/packages/AnimateIn";

const FEATURES = [
  {
    title: "Expert guidance",
    desc: "Destination specialists with years of on-ground experience plan every route.",
    color: "from-violet-500 to-purple-600",
    icon: "🧭",
  },
  {
    title: "Handpicked experiences",
    desc: "Verified hotels, trusted drivers, and authentic local activities — never generic.",
    color: "from-brand to-orange-500",
    icon: "✨",
  },
  {
    title: "Best value",
    desc: "Bundled pricing with transparent quotes. No surprise add-ons at checkout.",
    color: "from-emerald-500 to-teal-600",
    icon: "💰",
  },
  {
    title: "Flexible planning",
    desc: "Custom dates, group sizes, hotel upgrades, and special requests welcome.",
    color: "from-amber-500 to-yellow-500",
    icon: "📅",
  },
  {
    title: "24/7 assistance",
    desc: "Orange-line support from enquiry through your return — always one call away.",
    color: "from-rose-500 to-pink-600",
    icon: "📞",
  },
];

export default function PackagesWhyTravel() {
  return (
    <section className="border-t border-stone-100 bg-gradient-to-b from-stone-50 to-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-dark">
            Why us
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-stone-900 sm:text-4xl">
            Why travel with Demand Setu?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-600 sm:text-base">
            From first enquiry to your return flight — we handle the details so you enjoy every
            moment of the journey.
          </p>
        </AnimateIn>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {FEATURES.map((item, i) => (
            <AnimateIn key={item.title} delay={i * 80} direction="scale">
              <div className="package-card-hover group h-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-xl text-white shadow-md transition group-hover:scale-110`}
                >
                  {item.icon}
                </span>
                <h3 className="mt-4 text-sm font-bold text-stone-900">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-stone-500">{item.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
