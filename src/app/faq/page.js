import Link from "next/link";
import { Headset, HelpCircle, Mail, MessageCircle, Phone } from "lucide-react";
import FaqExplorer from "@/components/static/FaqExplorer";
import StaticPageShell from "@/components/static/StaticPageShell";
import { EMAIL, PHONE_DISPLAY, PHONE_HREF } from "@/components/static/StaticUi";
import { SITE_FAQ } from "@/lib/staticPagesContent";

export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about booking hotels, homestays, villas, and tour packages with Demand Setu.",
};

export default function FaqPage() {
  return (
    <StaticPageShell
      eyebrow="Help centre"
      icon={HelpCircle}
      title="FAQ"
      subtitle="Quick answers about bookings, cancellations, payments, and support."
    >
      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
        <FaqExplorer items={SITE_FAQ} />

        <aside className="h-fit space-y-4 lg:sticky lg:top-28">
          <div className="relative isolate overflow-hidden rounded-[2rem] bg-stone-950 p-7 text-white">
            <div aria-hidden className="absolute -right-12 -top-12 -z-10 h-48 w-48 rounded-full bg-brand/40 blur-3xl" />
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-orange-300">
              <Headset className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-extrabold">Still have questions?</h2>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-white/70">
              Our travel specialists are happy to help — real people, no bots.
            </p>
            <div className="mt-5 space-y-2.5">
              <a
                href={PHONE_HREF}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-extrabold transition hover:bg-white/20"
              >
                <Phone className="h-4 w-4 text-orange-300" />
                {PHONE_DISPLAY}
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-extrabold transition hover:bg-white/20"
              >
                <Mail className="h-4 w-4 text-orange-300" />
                <span className="truncate">{EMAIL}</span>
              </a>
            </div>
            <Link
              href="/contact-us"
              className="pk-sweep mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-extrabold text-white transition hover:bg-brand-dark active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              Contact our team
            </Link>
          </div>
        </aside>
      </div>
    </StaticPageShell>
  );
}
