"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BadgePercent,
  CreditCard,
  FileCheck2,
  Headphones,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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

const FALLBACK_ICONS = [BadgeCheck, Sparkles, ShieldCheck, Route, Headphones, CreditCard];

/** Pick an icon from the wording of the title; fall back to a rotating set. */
function pickIcon(title, index) {
  const t = String(title || "").toLowerCase();
  if (/price|value|cost|save|deal/.test(t)) return BadgePercent;
  if (/custom|flexible|itinerar|plan/.test(t)) return Route;
  if (/verif|trust|partner|safe|handpick/.test(t)) return ShieldCheck;
  if (/visa|document/.test(t)) return FileCheck2;
  if (/support|assist|help|24/.test(t)) return Headphones;
  if (/pay|emi|booking/.test(t)) return CreditCard;
  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

export default function PackagesWhyTravel({ config = null }) {
  const features = config?.items?.length
    ? config.items.map((item) => ({ title: item.title, desc: item.description }))
    : FEATURES;

  return (
    <section className="relative isolate overflow-hidden bg-stone-950 py-16 text-white sm:py-24">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-orange-600/35 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:26px_26px]"
      />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <AnimateIn className="lg:sticky lg:top-28 lg:self-start">
          <span className="pk-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-100">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Why Demand Setu
          </span>
          <h2 className="mt-5 font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl">
            {config?.title || "Why travel with Demand Setu?"}
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70 sm:text-base">
            From first enquiry to your return flight, one trip desk handles the details so you can enjoy every moment of the
            journey.
          </p>
          <Link
            href="/contact-us"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-stone-950 transition hover:bg-orange-50"
          >
            Talk to a trip expert
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </AnimateIn>

        <ol className="grid gap-4 sm:grid-cols-2">
          {features.map((item, index) => {
            const Icon = pickIcon(item.title, index);
            return (
              <AnimateIn key={`${item.title}-${index}`} as="li" delay={index * 80} className="h-full">
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition duration-500 hover:-translate-y-1 hover:border-orange-400/50 hover:bg-white/[0.08]">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-1 -top-3 font-serif text-7xl font-semibold leading-none text-white/[0.06] transition group-hover:text-orange-400/20"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-[0_12px_28px_-10px_rgba(249,115,22,0.8)]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold leading-snug">{item.title}</h3>
                  {item.desc ? <p className="mt-2 text-sm leading-relaxed text-white/65">{item.desc}</p> : null}
                </div>
              </AnimateIn>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
