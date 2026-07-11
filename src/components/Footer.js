import Link from "next/link";
import PaymentLogos from "@/components/PaymentLogos";
import { FOOTER_SERVICES, getFooterDestinations } from "@/lib/footerLinks";

const QUICK_LINKS = [
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Travel Blog", href: "/travel-blog" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "FAQ", href: "/faq" },
];

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

function FooterLink({ href, children }) {
  const className =
    "text-sm text-stone-300 transition hover:text-white inline-block";

  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (href === "#") {
    return <span className={`${className} cursor-default`}>{children}</span>;
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default async function Footer() {
  const destinations = await getFooterDestinations();

  return (
    <footer className="mt-auto bg-[#121212] pb-24 text-white md:pb-0">
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        {/* Newsletter — orange card */}
    

        {/* Main columns */}
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Company */}
          <div className="lg:col-span-4">
            <Link href="/" className="text-2xl font-extrabold text-[#ea580c] sm:text-3xl">
              Demand Setu
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-400">
              Your trusted travel partner for unforgettable journeys. We craft
              personalized travel experiences that create lasting memories.
            </p>

            <ul className="mt-6 space-y-3">
              <li>
                <a
                  href="tel:+918353056000"
                  className="flex items-start gap-3 text-sm text-stone-300 transition hover:text-white"
                >
                  <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#ea580c]" />
                  +91 8353056000
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@demandsetutours.com"
                  className="flex items-start gap-3 text-sm text-stone-300 transition hover:text-white"
                >
                  <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#ea580c]" />
                  info@demandsetutours.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-stone-300">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#ea580c]" />
                <span>
                  First floor, Mother Bindra Tower, 39 mile, Shahpur, Himachal
                  Pradesh 176206
                </span>
              </li>
            </ul>

            <div className="mt-6 flex gap-2">
              {SOCIAL.map(({ name, href, icon: Icon }) => (
                <a
                  key={name}
                  href={href}
                  aria-label={name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-stone-300 transition hover:bg-[#ea580c] hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="flex items-center gap-2 text-base font-bold text-white">
              <LinkChainIcon className="h-5 w-5 text-[#ea580c]" />
              Quick Links
            </h4>
            <ul className="mt-5 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div className="lg:col-span-3">
            <h4 className="flex items-center gap-2 text-base font-bold text-white">
              <MapPinIcon className="h-5 w-5 text-[#ea580c]" />
              Popular Destinations
            </h4>
            <ul className="mt-5 space-y-2.5">
              {destinations.map((dest) => (
                <li key={dest.label}>
                  <FooterLink href={dest.href}>{dest.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h4 className="flex items-center gap-2 text-base font-bold text-white">
              <UmbrellaIcon className="h-5 w-5 text-[#ea580c]" />
              Travel Services
            </h4>
            <ul className="mt-5 space-y-2.5">
              {FOOTER_SERVICES.map((service) => (
                <li key={service.label}>
                  <FooterLink href={service.href}>{service.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-stone-800" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-stone-500">
            © 2019 Demand Setu. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-stone-500">
            <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
            <span className="text-stone-700">|</span>
            <FooterLink href="/terms-of-service">Terms of Service</FooterLink>
            <span className="text-stone-700">|</span>
            <FooterLink href="/cancellation-policy">Cancellation Policy</FooterLink>
          </div>
        </div>

      
      </div>
    </footer>
  );
}

function EnvelopeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.956 1.294c-.28.38-.739.557-1.183.411a12.034 12.034 0 01-7.143-7.143c-.146-.444.031-.902.411-1.183l1.294-.956c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function MapPinIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function LinkChainIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function UmbrellaIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 15V21m0-16.5A9 9 0 003 12h18a9 9 0 00-9-10.5zM12 7.5v3" />
    </svg>
  );
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YouTubeIcon({ className }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
