import Link from "next/link";
import StaticPageShell from "@/components/static/StaticPageShell";
import { SITE_FAQ } from "@/lib/staticPagesContent";

export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about booking hotels, homestays, villas, and tour packages with Demand Setu.",
};

export default function FaqPage() {
  return (
    <StaticPageShell
      title="FAQ"
      subtitle="Quick answers about bookings, cancellations, payments, and support."
    >
      <div className="mx-auto max-w-3xl space-y-3">
        {SITE_FAQ.map((item, index) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-stone-200 bg-white shadow-sm"
            open={index === 0}
          >
            <summary className="cursor-pointer list-none px-6 py-5 font-semibold text-stone-900 marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.q}
                <span className="mt-0.5 text-brand transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <div className="border-t border-stone-100 px-6 pb-5 pt-4 text-sm leading-relaxed text-stone-600">
              {item.a}
            </div>
          </details>
        ))}
      </div>

      <p className="mx-auto mt-10 max-w-3xl rounded-2xl bg-brand-muted px-6 py-5 text-center text-sm text-stone-700">
        Still have questions?{" "}
        <Link href="/contact-us" className="font-semibold text-brand hover:underline">
          Contact our team
        </Link>{" "}
        or call{" "}
        <a href="tel:+918353056000" className="font-semibold text-brand hover:underline">
          +91 8353056000
        </a>
        .
      </p>
    </StaticPageShell>
  );
}
