import Link from "next/link";

export default function StaticPageShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <section className="border-b border-orange-100 bg-gradient-to-br from-orange-50 via-white to-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav className="flex items-center gap-2 text-xs text-stone-500 sm:text-sm">
            <Link href="/" className="transition hover:text-brand">
              Home
            </Link>
            <span>/</span>
            <span className="font-medium text-stone-700">{title}</span>
          </nav>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
              {subtitle}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">{children}</div>
    </div>
  );
}
