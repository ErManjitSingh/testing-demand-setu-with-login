"use client";

import AnimateIn from "@/components/packages/AnimateIn";

const STEPS = [
  {
    step: "01",
    title: "Search & enquire",
    desc: "Pick a country, state, city, or famous package. Tell us your dates and group size.",
    icon: "🔍",
  },
  {
    step: "02",
    title: "Get custom quote",
    desc: "Our specialists share a detailed itinerary with hotels, transfers, and transparent pricing.",
    icon: "📋",
  },
  {
    step: "03",
    title: "Confirm & pack",
    desc: "Pay securely, receive vouchers, driver contacts, and a dedicated trip coordinator.",
    icon: "✈️",
  },
  {
    step: "04",
    title: "Travel worry-free",
    desc: "24/7 orange-line support on-ground — we're with you from departure to homecoming.",
    icon: "🌏",
  },
];

export default function PackagesHowItWorks() {
  return (
    <section className="bg-stone-900 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <AnimateIn className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">
            Simple process
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            How booking works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-stone-400">
            Four easy steps from your first enquiry to an unforgettable journey.
          </p>
        </AnimateIn>

        <div className="relative mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-transparent via-brand/50 to-transparent lg:block" />

          {STEPS.map((item, i) => (
            <AnimateIn key={item.step} delay={i * 100} direction="scale">
              <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-brand/40 hover:bg-white/10">
                <span className="text-3xl">{item.icon}</span>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-brand">
                  Step {item.step}
                </p>
                <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-400">{item.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
