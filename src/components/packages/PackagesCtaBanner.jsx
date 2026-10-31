import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Phone } from "lucide-react";
import AnimateIn from "@/components/packages/AnimateIn";

const PERKS = ["Free itinerary changes", "Pay just 25% to confirm", "A reply from our trip desk within hours"];

/** Full-width call-to-action banner (admin: Call To Action Banner). */
export default function PackagesCtaBanner({ config }) {
  if (!config?.heading) return null;

  const { heading, description, buttonText, buttonLink, phone, image } = config;
  const showButton = Boolean(buttonText && buttonLink);
  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";
  const isInternal = buttonLink?.startsWith("/");

  const buttonClass =
    "group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#c2410c] shadow-[0_16px_34px_-14px_rgba(0,0,0,0.6)] transition hover:bg-orange-50";
  const buttonInner = (
    <>
      {buttonText}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </>
  );

  return (
    <section className="px-3 py-3 sm:px-6 sm:py-4">
      <AnimateIn direction="scale">
        <div className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-2xl bg-stone-950 text-white shadow-sm sm:rounded-3xl">
          {image ? (
            <>
              <Image
                src={image}
                alt=""
                fill
                loading="lazy"
                sizes="(min-width: 1280px) 1280px, 100vw"
                className="-z-10 object-cover"
              />
              <span className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-950/95 via-stone-950/75 to-stone-950/35" />
            </>
          ) : (
            <span className="absolute inset-0 -z-10 bg-gradient-to-br from-[#c2410c] to-[#ea580c]" />
          )}
          <span aria-hidden className="absolute -left-20 -top-20 -z-10 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />

          <div className="grid items-center gap-10 px-5 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12 lg:px-14 lg:py-16">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-orange-200">Ready when you are</p>
              <h2 className="mt-2 text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
              {description ? (
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/80 sm:text-lg">{description}</p>
              ) : null}

              {showButton || phone ? (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  {showButton ? (
                    isInternal ? (
                      <Link href={buttonLink} className={buttonClass}>
                        {buttonInner}
                      </Link>
                    ) : (
                      <a href={buttonLink} className={buttonClass}>
                        {buttonInner}
                      </a>
                    )
                  ) : null}
                  {phone ? (
                    <a
                      href={phoneHref}
                      className="pk-glass inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      <Phone className="h-4 w-4 text-amber-300" />
                      Call {phone}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <ul className="pk-glass hidden space-y-4 rounded-3xl p-7 lg:block">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-sm font-semibold text-white/95">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-brand">
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </AnimateIn>
    </section>
  );
}
