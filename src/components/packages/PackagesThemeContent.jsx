import { createElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <section className="px-3 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 sm:rounded-3xl">
        <div className={`grid items-stretch ${image ? "lg:grid-cols-[0.95fr_1.05fr]" : ""}`}>
          {image ? (
            <div className={`group relative min-h-[16rem] sm:min-h-[22rem] ${reverse ? "lg:order-2" : ""}`}>
              <Image
                src={image}
                alt={title || themeLabel || ""}
                fill
                loading="lazy"
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover transition duration-[1200ms] ease-out group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {themeLabel ? (
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wider text-stone-900 shadow-sm sm:bottom-5 sm:left-5">
                  {themeId ? <ThemeIcon id={themeId} className="h-4 w-4 text-brand" /> : null}
                  {themeLabel}
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="p-5 sm:p-8 lg:p-10">
            {themeLabel ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-muted px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-brand-dark ring-1 ring-brand/15">
                {themeId ? <ThemeIcon id={themeId} className="h-3.5 w-3.5" /> : null}
                {themeLabel}
              </span>
            ) : null}
            {title ? (
              <h2 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-stone-950 sm:text-3xl lg:text-4xl">
                {title}
              </h2>
            ) : null}
            <div
              className="seo-html seo-checks mt-4 text-[15px] leading-relaxed text-stone-600 sm:text-base [&_h3]:mb-2 [&_h3]:mt-0 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:text-stone-900"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {themeId ? (
              <Link
                href={buildListingHref({ themes: [themeId] })}
                className="group/cta mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-12px_rgba(234,88,12,0.7)] transition hover:bg-brand-dark"
              >
                Explore {themeLabel || "these"} trips
                <ArrowRight className="h-4 w-4 transition group-hover/cta:translate-x-1" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
