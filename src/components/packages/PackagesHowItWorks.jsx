import Link from "next/link";
import { ArrowRight, CalendarCheck, Compass, CreditCard, Plane } from "lucide-react";
import HomeSection from "@/components/packages/HomeSection";

const STEPS = [
  {
    icon: Compass,
    title: "Find your trip",
    text: "Search by place, dates and travellers. Every package is priced for exactly who is going.",
  },
  {
    icon: CalendarCheck,
    title: "Customise it",
    text: "Pick a departure, hotel grade and room setup — the total updates live, GST included.",
  },
  {
    icon: CreditCard,
    title: "Reserve in minutes",
    text: "Share traveller details on our booking page and pay just 25% to lock your seats.",
  },
  {
    icon: Plane,
    title: "Travel stress-free",
    text: "A trip coordinator stays one call away from your first transfer to your last.",
  },
];

export default function PackagesHowItWorks() {
  return (
    <HomeSection
      headingId="how-it-works"
      title="From idea to boarding pass"
      subtitle="Four simple steps — no phone tag, no hidden charges."
      action={
        <Link
          href="/packages"
          className="group inline-flex items-center gap-2 self-start rounded-full bg-stone-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand sm:self-auto"
        >
          Browse all packages
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      }
    >
      <ol className="relative mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 p-5 transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:bg-white hover:shadow-lg"
          >
            <span
              aria-hidden
              className="absolute -right-1 -top-3 text-[5.5rem] font-extrabold leading-none text-stone-900/[0.05] transition group-hover:text-brand/10"
            >
              {i + 1}
            </span>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-muted text-brand ring-1 ring-brand/15 transition group-hover:bg-brand group-hover:text-white">
              <step.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-base font-extrabold text-stone-950 sm:text-lg">{step.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{step.text}</p>
          </li>
        ))}
      </ol>
    </HomeSection>
  );
}
