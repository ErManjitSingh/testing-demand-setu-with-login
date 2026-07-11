"use client";

import AnimateIn from "@/components/packages/AnimateIn";

const ITEMS = [
  {
    title: "Pan-India coverage",
    desc: "Every state & major city",
    icon: GlobeIcon,
  },
  {
    title: "Best price guarantee",
    desc: "Matched group rates",
    icon: TagIcon,
  },
  {
    title: "24/7 support",
    desc: "Orange-line concierge",
    icon: HeadsetIcon,
  },
  {
    title: "Customizable trips",
    desc: "Tailor any itinerary",
    icon: SlidersIcon,
  },
  {
    title: "Trusted by thousands",
    desc: "4.9★ guest rating",
    icon: StarIcon,
  },
];

export default function PackagesTrustBar() {
  return (
    <section className="border-b border-stone-200 bg-white py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:gap-4">
        {ITEMS.map((item, i) => (
          <AnimateIn key={item.title} delay={i * 70}>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-muted to-orange-100 text-brand shadow-sm">
                <item.icon />
              </span>
              <div>
                <p className="text-sm font-bold text-stone-900">{item.title}</p>
                <p className="mt-0.5 text-xs text-stone-500">{item.desc}</p>
              </div>
            </div>
          </AnimateIn>
        ))}
      </div>
    </section>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.264.26-2.47.732-3.565" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3.75 0H7.5m3-6h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
