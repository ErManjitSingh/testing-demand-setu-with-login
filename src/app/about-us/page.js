import {
  BadgePercent,
  Car,
  Compass,
  Headset,
  HeartHandshake,
  Hotel,
  Mail,
  MapPin,
  Mountain,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Plane,
} from "lucide-react";
import StaticPageShell from "@/components/static/StaticPageShell";
import { CtaBand, EMAIL, IconTile, PHONE_DISPLAY, PHONE_HREF, SectionHeading } from "@/components/static/StaticUi";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Demand Setu — your trusted travel partner for hotels, homestays, villas, and curated tour packages across India.",
};

const STATS = [
  { label: "Happy travellers", value: "10,000+" },
  { label: "Average guest rating", value: "4.9 / 5" },
  { label: "Trip support", value: "24 / 7" },
];

const OFFERINGS = [
  { icon: Hotel, title: "Stays", text: "Hotels, homestays, Airbnbs and private villas across India." },
  { icon: Compass, title: "Tour packages", text: "Domestic and international itineraries you can customise." },
  { icon: Car, title: "Transport", text: "Private cabs and transfers with experienced local drivers." },
  { icon: Plane, title: "Visa & insurance", text: "Visa assistance and travel insurance on request." },
];

const WHY = [
  { icon: ShieldCheck, title: "Verified stays", text: "Properties checked for quality, location accuracy and guest safety." },
  { icon: BadgePercent, title: "Best price focus", text: "Competitive rates with transparent pricing — no hidden surprises." },
  { icon: Mountain, title: "Local expertise", text: "Based in Himachal Pradesh with deep knowledge of mountain and leisure routes." },
  { icon: HeartHandshake, title: "End-to-end support", text: "From enquiry to checkout to on-trip assistance, we stay with you." },
];

const STEPS = [
  { icon: Search, title: "Tell us your plan", text: "Share destination, dates and group size — or pick a package you like." },
  { icon: Sparkles, title: "Get a tailored quote", text: "A specialist builds the stay, cab and meals around your budget." },
  { icon: Headset, title: "Travel with support", text: "Confirm, pay securely and reach us any time during the trip." },
];

export default function AboutUsPage() {
  return (
    <StaticPageShell
      eyebrow="Our story"
      icon={Compass}
      title="About Us"
      subtitle="Crafting memorable journeys across India with handpicked stays and personalised travel support."
      stats={STATS}
    >
      {/* story */}
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
        <div>
          <SectionHeading eyebrow="Who we are" title="Travel that feels personal, not generic" />
          <div className="mt-5 space-y-4 text-base leading-relaxed text-stone-600">
            <p className="text-lg font-semibold leading-relaxed text-stone-800">
              Demand Setu is a Himachal Pradesh–based travel company built for travellers who want more than a
              generic booking experience.
            </p>
            <p>
              From boutique hotels and cosy homestays to private villas and fully curated tour packages, we connect
              you with verified properties and reliable on-ground partners. Whether you are planning a family
              vacation, a honeymoon, a workation, or a group trip, our team helps you find the right stay at the
              right price.
            </p>
            <p>
              Every enquiry is handled by real specialists — not bots — who understand destinations, seasons and
              local nuances. Our goal is simple: make booking easy, stays memorable, and support available whenever
              you need it.
            </p>
          </div>
        </div>

        <aside className="h-fit overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm lg:sticky lg:top-28">
          <div className="bg-gradient-to-br from-brand to-orange-400 px-6 py-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/80">At a glance</p>
            <p className="mt-1 text-xl font-extrabold">Demand Setu Tours</p>
          </div>
          <ul className="space-y-4 p-6 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <span className="font-medium text-stone-700">
                First floor, Mother Bindra Tower, 39 mile, Shahpur, Himachal Pradesh 176206
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <a href={PHONE_HREF} className="font-bold text-stone-900 hover:text-brand">
                {PHONE_DISPLAY}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <a href={`mailto:${EMAIL}`} className="break-all font-bold text-stone-900 hover:text-brand">
                {EMAIL}
              </a>
            </li>
          </ul>
        </aside>
      </div>

      {/* offerings */}
      <section className="mt-16 sm:mt-20">
        <SectionHeading eyebrow="What we offer" title="Everything for your trip, in one place" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OFFERINGS.map((item, i) => (
            <div
              key={item.title}
              className="pk-fade-up group rounded-3xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <IconTile icon={item.icon} />
              <h3 className="mt-4 text-lg font-extrabold text-stone-900">{item.title}</h3>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-stone-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* why */}
      <section className="mt-16 rounded-[2rem] bg-stone-50 px-5 py-10 sm:mt-20 sm:px-10 sm:py-14">
        <SectionHeading eyebrow="Why Demand Setu" title="Why travellers choose us" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {WHY.map((item) => (
            <div key={item.title} className="group flex gap-4 rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-brand/40 hover:shadow-md">
              <IconTile icon={item.icon} />
              <div>
                <h3 className="font-extrabold text-stone-900">{item.title}</h3>
                <p className="mt-1 text-sm font-medium leading-relaxed text-stone-500">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="mt-16 sm:mt-20">
        <SectionHeading eyebrow="How it works" title="From first message to boarding the car" align="center" />
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-3xl border border-stone-200 bg-white p-6 pt-9 text-center shadow-sm">
              <span className="absolute -top-5 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-brand text-sm font-extrabold text-white shadow-lg shadow-brand/30 ring-4 ring-white">
                {i + 1}
              </span>
              <step.icon className="mx-auto h-7 w-7 text-brand" />
              <h3 className="mt-3 text-lg font-extrabold text-stone-900">{step.title}</h3>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-stone-500">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-16 sm:mt-20">
        <CtaBand />
      </div>
    </StaticPageShell>
  );
}
