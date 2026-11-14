import Image from "next/image";
import Link from "next/link";
import {
  FOOTER_COMPANY,
  FOOTER_INDIA_DESTINATIONS,
  FOOTER_INTERNATIONAL,
  FOOTER_LEGAL,
  FOOTER_PLACE_CITIES,
  FOOTER_PLACE_STATES,
  FOOTER_TRIP_TYPES,
} from "@/lib/footerLinks";

const PHONE_DISPLAY = "+91 83530 56000";
const PHONE_HREF = "tel:+918353056000";

const SOCIAL = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/p/DemandsetuTours-61554146676519/",
    icon: FacebookIcon,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/demandsetutours/",
    icon: InstagramIcon,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@demandsetutours?si=pI-doee8dY4p1sL6",
    icon: YouTubeIcon,
  },
];

const LINK_CLASS = "inline-block text-sm text-stone-400 transition hover:text-white";

function FooterLink({ href, children }) {
  return (
    <Link href={href} className={LINK_CLASS}>
      {children}
    </Link>
  );
}

function FooterColumn({ title, children, className = "" }) {
  return (
    <nav aria-label={title} className={className}>
      <h3 className="text-xs font-extrabold uppercase tracking-[0.18em] text-white">
        {title}
        <span aria-hidden className="mt-2 block h-0.5 w-6 rounded-full bg-brand" />
      </h3>
      {children}
    </nav>
  );
}

function LinkList({ items }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <FooterLink href={item.href}>{item.label}</FooterLink>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-stone-950 pb-24 text-white md:pb-0">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        {/* Main columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-6 lg:gap-x-8">
          <div className="col-span-2">
            <Link href="/" aria-label="Demand Setu Tours home" className="relative block h-14 w-44">
              <Image src="/logo-on-dark.png" alt="Demand Setu Tours" fill sizes="176px" className="object-contain object-left" />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">
              Tour packages across India and the world. We plan the stay, cabs and sightseeing, so you only have to
              pick the trip.
            </p>

            <ul className="mt-5 space-y-3">
              <li>
                <a href={PHONE_HREF} className="flex items-start gap-3 text-sm text-stone-300 transition hover:text-white">
                  <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@demandsetutours.com"
                  className="flex items-start gap-3 text-sm text-stone-300 transition hover:text-white"
                >
                  <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                  info@demandsetutours.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-stone-300">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                <span>First floor, Mother Bindra Tower, 39 mile, Shahpur, Himachal Pradesh 176206</span>
              </li>
            </ul>

            <div className="mt-5 flex gap-2">
              {SOCIAL.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-stone-300 transition hover:bg-brand hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Tour Packages">
            <LinkList items={FOOTER_TRIP_TYPES} />
          </FooterColumn>

          <FooterColumn title="Destinations">
            <LinkList items={FOOTER_INDIA_DESTINATIONS} />
          </FooterColumn>

          <FooterColumn title="Places to Visit">
            <LinkList items={FOOTER_PLACE_STATES} />
          </FooterColumn>

          <div className="col-span-2 grid grid-cols-2 gap-x-6 gap-y-10 lg:col-span-1 lg:block lg:space-y-8">
            <FooterColumn title="International">
              <LinkList items={FOOTER_INTERNATIONAL} />
            </FooterColumn>
            <FooterColumn title="Company">
              <LinkList items={FOOTER_COMPANY} />
            </FooterColumn>
          </div>
        </div>

        {/* Popular places */}
        <section aria-labelledby="footer-places" className="mt-12 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 sm:p-6">
          <h3 id="footer-places" className="text-xs font-extrabold uppercase tracking-[0.18em] text-white">
            Popular places to visit
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {FOOTER_PLACE_CITIES.map((city) => (
              <li key={city.href}>
                <Link
                  href={city.href}
                  title={city.label}
                  className="inline-block rounded-full border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-stone-300 transition hover:border-brand hover:bg-brand hover:text-white"
                >
                  {city.short}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/places"
                className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-3.5 py-1.5 text-xs font-extrabold text-orange-300 transition hover:bg-brand hover:text-white"
              >
                View all places
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </li>
          </ul>
        </section>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/10" />
        <div className="flex flex-col items-center gap-5 py-7 lg:flex-row lg:justify-between">
          <p className="text-center text-sm text-stone-500">
            © 2019–{year} Demand Setu Tours. All rights reserved.
          </p>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            {FOOTER_LEGAL.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-stone-500 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function EnvelopeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.956 1.294c-.28.38-.739.557-1.183.411a12.034 12.034 0 01-7.143-7.143c-.146-.444.031-.902.411-1.183l1.294-.956c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function MapPinIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YouTubeIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
