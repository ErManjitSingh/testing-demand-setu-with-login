"use client";

import AnimateIn from "@/components/packages/AnimateIn";

const FEATURES = [
  {
    title: "Expert guidance",
    desc: "Destination specialists with years of on-ground experience plan every route.",
  },
  {
    title: "Handpicked experiences",
    desc: "Verified hotels, trusted drivers, and authentic local activities — never generic.",
  },
  {
    title: "Best value",
    desc: "Bundled pricing with transparent quotes. No surprise add-ons at checkout.",
  },
  {
    title: "Flexible planning",
    desc: "Custom dates, group sizes, hotel upgrades, and special requests welcome.",
  },
  {
    title: "24/7 assistance",
    desc: "Orange-line support from enquiry through your return — always one call away.",
  },
];

export default function PackagesWhyTravel() {
  return (
    <section className="bg-stone-950 py-16 text-white sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="font-serif text-lg italic text-orange-200">Why us</p>
          <h2 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
            Why travel with Demand Setu?
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            From first enquiry to your return flight — we handle the details so you enjoy every
            moment of the journey.
          </p>
        </div>

        <ol className="divide-y divide-white/10 border-y border-white/10">
          {FEATURES.map((item, index) => (
            <AnimateIn key={item.title} as="li" delay={index * 90} direction="right" className="grid gap-2 py-5 sm:grid-cols-[88px_1fr] sm:gap-6">
              <span className="font-serif text-2xl text-orange-200">0{index + 1}</span>
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-white/70">{item.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </ol>
      </div>
    </section>
  );
}
