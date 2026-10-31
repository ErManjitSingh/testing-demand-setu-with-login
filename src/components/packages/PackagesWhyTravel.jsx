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
import HomeSection from "@/components/packages/HomeSection";

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
    <HomeSection
      headingId="why-choose"
      eyebrow="Why Demand Setu"
      title={config?.title || "Why travel with Demand Setu?"}
      subtitle="From first enquiry to your return flight, one trip desk handles the details so you can enjoy every moment of the journey."
      action={
        <Link
          href="/contact-us"
          className="group inline-flex items-center gap-2 self-start rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark sm:self-auto"
        >
          Talk to a trip expert
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      }
    >
      <ol className="mt-6 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((item, index) => {
          const Icon = pickIcon(item.title, index);
          return (
            <li key={`${item.title}-${index}`} className="group flex items-start gap-4 rounded-2xl p-3 transition hover:bg-brand-muted/70">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-muted text-brand ring-1 ring-brand/15 transition group-hover:bg-brand group-hover:text-white">
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-extrabold leading-snug text-stone-950">{item.title}</h3>
                {item.desc ? <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.desc}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </HomeSection>
  );
}
