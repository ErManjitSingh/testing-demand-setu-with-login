import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

export const PHONE_DISPLAY = "+91 8353056000";
export const PHONE_HREF = "tel:+918353056000";
export const EMAIL = "info@demandsetutours.com";

export function SectionHeading({ eyebrow, title, subtitle, align = "left", className = "" }) {
  return (
    <div className={`${align === "center" ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      {eyebrow ? <p className="font-serif text-lg italic text-brand">{eyebrow}</p> : null}
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm font-medium leading-relaxed text-stone-500 sm:text-base">{subtitle}</p> : null}
    </div>
  );
}

export function IconTile({ icon: Icon, className = "" }) {
  return (
    <span
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-muted text-brand transition group-hover:bg-brand group-hover:text-white ${className}`}
    >
      <Icon className="h-6 w-6" />
    </span>
  );
}

/** Dark call-to-action band used at the bottom of marketing pages. */
export function CtaBand({
  title = "Ready to plan your next trip?",
  text = "Tell us where you want to go — a travel specialist replies within a few hours with a plan and a price.",
  primary = { href: "/packages", label: "Browse packages" },
  secondary = { href: "/contact-us", label: "Talk to an expert" },
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-stone-950 px-6 py-10 text-white sm:px-12 sm:py-14">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-brand/40 blur-3xl" />
        <div className="absolute -bottom-24 left-10 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl" />
      </div>
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-white/70 sm:text-base">{text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={primary.href}
            className="pk-sweep inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark active:scale-95"
          >
            {primary.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          {secondary ? (
            <Link
              href={secondary.href}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
            >
              {secondary.href.startsWith("tel:") ? <Phone className="h-4 w-4" /> : null}
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
