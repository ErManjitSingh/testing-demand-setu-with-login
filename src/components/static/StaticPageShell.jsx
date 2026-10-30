import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Shared layout for static / marketing pages (About, Contact, FAQ, Blog, policies…).
 * Dark hero with soft brand glows, breadcrumb, optional stats strip, then the page body.
 */
export default function StaticPageShell({ title, subtitle, eyebrow, icon: Icon, stats, children, bodyClassName = "" }) {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative isolate overflow-hidden bg-stone-950 text-white">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="pk-drift absolute -left-28 -top-28 h-96 w-96 rounded-full bg-brand/35 blur-3xl" />
          <div className="pk-drift absolute -right-20 top-10 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl [animation-delay:-3s]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-950/80 to-transparent" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
          <nav aria-label="Breadcrumb" className="pk-fade flex items-center gap-1.5 text-xs font-semibold text-white/60 sm:text-sm">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{title}</span>
          </nav>

          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              {eyebrow ? (
                <p className="pk-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-200 backdrop-blur">
                  {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                  {eyebrow}
                </p>
              ) : null}
              <h1
                className="pk-fade-up mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
                style={{ animationDelay: "80ms" }}
              >
                {title}
              </h1>
              {subtitle ? (
                <p
                  className="pk-fade-up mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg"
                  style={{ animationDelay: "160ms" }}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>

          {stats?.length ? (
            <dl className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((item, i) => (
                <div
                  key={item.label}
                  className="pk-fade-up pk-glass rounded-2xl px-5 py-4"
                  style={{ animationDelay: `${240 + i * 80}ms` }}
                >
                  <dt className="text-xs font-semibold uppercase tracking-wider text-white/60">{item.label}</dt>
                  <dd className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      <div className={`mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
