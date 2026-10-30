import Link from "next/link";
import { ArrowUpRight, Clock, HelpCircle, Mail, MapPin, MessageCircle, Phone, MessagesSquare } from "lucide-react";
import ContactForm from "@/components/static/ContactForm";
import StaticPageShell from "@/components/static/StaticPageShell";
import { EMAIL, PHONE_DISPLAY, PHONE_HREF } from "@/components/static/StaticUi";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Demand Setu for hotel bookings, tour packages, group stays, and travel support.",
};

const ADDRESS = "First floor, Mother Bindra Tower, 39 mile, Shahpur, Himachal Pradesh 176206";

const CHANNELS = [
  {
    icon: Phone,
    label: "Call us",
    value: PHONE_DISPLAY,
    href: PHONE_HREF,
    note: "Available 24/7 for bookings and trip support",
  },
  {
    icon: Mail,
    label: "Email us",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    note: "We reply within a few hours on business days",
  },
  {
    icon: MapPin,
    label: "Visit us",
    value: "Shahpur, Himachal Pradesh",
    href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
    note: "By appointment, Monday to Saturday",
  },
];

const HOURS = [
  { day: "Monday – Saturday", time: "9:00 AM – 8:00 PM" },
  { day: "Sunday", time: "10:00 AM – 6:00 PM" },
  { day: "Emergency trip support", time: "24 / 7 by phone", highlight: true },
];

export default function ContactUsPage() {
  return (
    <StaticPageShell
      eyebrow="We're here to help"
      icon={MessagesSquare}
      title="Contact Us"
      subtitle="Questions about a stay, package, or group booking? Our travel specialists are ready to help."
    >
      {/* channels */}
      <div className="grid gap-4 md:grid-cols-3">
        {CHANNELS.map((c, i) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("http") ? "_blank" : undefined}
            rel={c.href.startsWith("http") ? "noreferrer" : undefined}
            className="pk-fade-up group relative overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-muted text-brand transition group-hover:bg-brand group-hover:text-white">
              <c.icon className="h-6 w-6" />
            </span>
            <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-brand">{c.label}</p>
            <p className="mt-1 break-words text-lg font-extrabold text-stone-900">{c.value}</p>
            <p className="mt-1.5 text-sm font-medium text-stone-500">{c.note}</p>
            <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 text-stone-300 transition group-hover:text-brand" />
          </a>
        ))}
      </div>

      {/* form + side */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
          <p className="font-serif text-lg italic text-brand">Drop us a line</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900">Send us a message</h2>
          <p className="mb-6 mt-1.5 text-sm font-medium text-stone-500">
            Fill in the form and a travel specialist will call you back shortly.
          </p>
          <ContactForm />
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-stone-950 p-6 text-white sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-extrabold">
              <Clock className="h-5 w-5 text-orange-300" />
              Business hours (IST)
            </h2>
            <ul className="mt-4 divide-y divide-white/10 text-sm">
              {HOURS.map((h) => (
                <li key={h.day} className="flex items-center justify-between gap-3 py-3">
                  <span className="font-medium text-white/70">{h.day}</span>
                  <span className={`font-extrabold ${h.highlight ? "text-emerald-300" : "text-white"}`}>{h.time}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/918353056000"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-400 active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </section>

          <Link
            href="/faq"
            className="group flex items-center gap-4 rounded-[2rem] border border-stone-200 bg-brand-muted/60 p-6 transition hover:border-brand/40"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-brand shadow-sm">
              <HelpCircle className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold text-stone-900">Looking for quick answers?</span>
              <span className="block text-sm font-medium text-stone-500">Browse our frequently asked questions</span>
            </span>
            <ArrowUpRight className="h-5 w-5 text-stone-400 transition group-hover:text-brand" />
          </Link>
        </div>
      </div>

      {/* map */}
      <section className="mt-10 overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-50">
        <div className="flex items-start gap-3 px-6 py-5 sm:px-8">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div>
            <p className="font-extrabold text-stone-900">Head office</p>
            <p className="text-sm font-medium text-stone-500">{ADDRESS}</p>
          </div>
        </div>
        <iframe
          title="Demand Setu office location"
          src={`https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-72 w-full border-0 sm:h-80"
        />
      </section>
    </StaticPageShell>
  );
}
