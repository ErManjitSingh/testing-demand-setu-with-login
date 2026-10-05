import Link from "next/link";
import { ArrowRight, CalendarCheck, Compass, CreditCard, Plane } from "lucide-react";

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
    <section className="bg-white py-14 sm:py-24" aria-labelledby="how-it-works">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-serif text-xl italic text-brand">Simple by design</p>
            <h2 id="how-it-works" className="mt-1 font-serif text-4xl font-medium tracking-tight text-stone-900 sm:text-5xl">
              From idea to boarding pass
            </h2>
          </div>
          <Link
            href="/packages"
            className="group inline-flex items-center gap-2 self-start rounded-full bg-stone-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand sm:self-auto"
          >
            Browse all packages
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <ol className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="group relative overflow-hidden rounded-3xl border border-stone-200 bg-[#fbf8f3] p-6 transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl"
            >
              <span
                aria-hidden
                className="absolute -right-2 -top-4 font-serif text-[6rem] font-medium leading-none text-stone-900/[0.05] transition group-hover:text-brand/10"
              >
                {i + 1}
              </span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white shadow-lg shadow-brand/30 transition group-hover:rotate-6 group-hover:scale-105">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-extrabold text-stone-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
