import { createElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimateIn from "@/components/packages/AnimateIn";
import { getThemeIcon } from "@/components/packages/shared/themeIcons";
import { buildListingHref } from "@/lib/packageBooking";

function ThemeIcon({ id, className }) {
  return createElement(getThemeIcon(id), { className });
}

/**
 * Editorial block about one theme, placed between sections (admin: Theme Content Block).
 * `reverse` flips the image side and the background tone so consecutive blocks alternate.
 */
export default function PackagesThemeContent({ block, reverse = false }) {
  if (!block?.html) return null;

  const { title, themeId, themeLabel, html, image } = block;

  return (
    <section className={`relative overflow-hidden py-12 sm:py-16 lg:py-20 ${reverse ? "bg-white" : "bg-[#f6f3ee]"}`}>
      <div
        aria-hidden
        className={`pointer-events-none absolute top-1/2 hidden h-96 w-96 -translate-y-1/2 rounded-full bg-orange-200/40 blur-3xl lg:block ${
          reverse ? "-left-32" : "-right-32"
        }`}
      />

      <div
        className={`relative mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:gap-16 ${
          image ? "lg:grid-cols-[1.02fr_0.98fr]" : "lg:max-w-4xl"
        }`}
      >
        {image ? (
          <AnimateIn direction="scale" className={reverse ? "lg:order-2" : ""}>
            <div className="relative">
              {/* soft offset frame behind the photo */}
              <span
                aria-hidden
                className={`absolute inset-0 hidden rounded-[2rem] border-2 border-brand/25 lg:block ${
                  reverse ? "translate-x-4 translate-y-4" : "-translate-x-4 translate-y-4"
                }`}
              />
              <div className="group relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[0_30px_60px_-30px_rgba(124,45,18,0.45)] ring-1 ring-black/5 sm:rounded-[2rem] lg:aspect-[5/4]">
                <Image
                  src={image}
                  alt={title || themeLabel || ""}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1024px) 600px, 100vw"
                  className="object-cover transition duration-[1200ms] ease-out group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                {themeLabel ? (
                  <span className="pk-glass absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white sm:bottom-5 sm:left-5">
                    {themeId ? <ThemeIcon id={themeId} className="h-4 w-4 text-amber-300" /> : null}
                    {themeLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </AnimateIn>
        ) : null}

        <AnimateIn delay={80}>
          {themeLabel ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-dark">
              {themeId ? <ThemeIcon id={themeId} className="h-3.5 w-3.5" /> : null}
              {themeLabel}
            </span>
          ) : null}
          {title ? (
            <h2 className="mt-4 font-serif text-3xl font-medium leading-[1.1] tracking-tight text-stone-950 sm:text-4xl lg:text-[2.8rem]">
              {title}
            </h2>
          ) : null}
          <div
            className="seo-html seo-checks mt-5 text-[15px] leading-relaxed text-stone-600 sm:text-base [&_h3]:mb-2 [&_h3]:mt-0 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-stone-900"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {themeId ? (
            <Link
              href={buildListingHref({ themes: [themeId] })}
              className="group/cta mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_-12px_rgba(234,88,12,0.7)] transition hover:bg-brand-dark"
            >
              Explore {themeLabel || "these"} trips
              <ArrowRight className="h-4 w-4 transition group-hover/cta:translate-x-1" />
            </Link>
          ) : null}
        </AnimateIn>
      </div>
    </section>
  );
}
