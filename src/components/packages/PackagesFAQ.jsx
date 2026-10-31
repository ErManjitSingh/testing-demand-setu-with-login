import Link from "next/link";
import { MessageCircle, Phone, Plus } from "lucide-react";
import { HOME_CARD, HOME_WRAP, HomeHeading } from "@/components/packages/HomeSection";
import { PHONE_DISPLAY, PHONE_HREF } from "@/components/static/StaticUi";
import { PACKAGE_FAQ } from "@/lib/tourPackages";

export default function PackagesFAQ({ config = null }) {
  // Admin FAQs carry sanitised HTML answers; the built-in ones are plain text
  const items = config?.items?.length
    ? config.items
    : PACKAGE_FAQ.map((item) => ({ q: item.q, text: item.a }));

  return (
    <section id="packages-faq" className={HOME_WRAP} aria-labelledby="packages-faq-heading">
      <div className={`${HOME_CARD} grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14`}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <HomeHeading
            id="packages-faq-heading"
            eyebrow="FAQ"
            title={config?.title || "Questions before you travel?"}
            subtitle="The answers travellers ask for most. Anything else, our trip desk is happy to help."
          />

          <div className="mt-6 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white shadow-[0_10px_24px_-10px_rgba(234,88,12,0.8)]">
              <MessageCircle className="h-5 w-5" />
            </span>
            <p className="mt-3 text-lg font-extrabold text-stone-950">Still have a question?</p>
            <p className="mt-1 text-sm text-stone-600">Talk to a travel specialist. We reply within a few hours.</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <a
                href={PHONE_HREF}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
              >
                <Phone className="h-4 w-4" />
                {PHONE_DISPLAY}
              </a>
              <Link
                href="/contact-us"
                className="inline-flex items-center rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold text-stone-800 transition hover:border-brand hover:text-brand"
              >
                Send a message
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {items.map((item, index) => (
            <details
              key={`${item.q}-${index}`}
              className="group rounded-xl border border-stone-200 bg-white px-5 transition open:border-brand/30 open:bg-orange-50/50 hover:border-stone-300"
              open={index === 0}
            >
              <summary className="cursor-pointer list-none py-4 text-base font-bold text-stone-950 marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-700 transition group-open:rotate-45 group-open:bg-brand group-open:text-white">
                    <Plus className="h-4 w-4" />
                  </span>
                </span>
              </summary>
              {item.html ? (
                <div
                  className="seo-html pb-5 text-sm leading-relaxed text-stone-600 sm:text-base"
                  dangerouslySetInnerHTML={{ __html: item.html }}
                />
              ) : (
                <p className="pb-5 text-sm leading-relaxed text-stone-600 sm:text-base">{item.text}</p>
              )}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
