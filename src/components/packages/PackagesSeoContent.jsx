import AnimateIn from "@/components/packages/AnimateIn";

/** Long-form SEO copy at the bottom of the page (admin: SEO Content / About Section). */
export default function PackagesSeoContent({ config }) {
  if (!config?.html) return null;

  return (
    <section className="bg-[#f6f3ee] px-4 py-12 sm:px-6 sm:py-16" aria-label="About our tour packages">
      <AnimateIn>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(28,25,23,0.4)] sm:p-10 lg:p-14">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-amber-400 to-brand" />
          <div
            className="seo-html seo-columns text-[15px] leading-relaxed text-stone-600 sm:text-base [&_h2]:mb-5 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:text-stone-950 sm:[&_h2]:text-4xl [&_h3]:mb-2 [&_h3]:mt-0 [&_p]:mb-7 [&_h3]:flex [&_h3]:items-center [&_h3]:gap-3 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-stone-900 [&_h3]:before:h-5 [&_h3]:before:w-1 [&_h3]:before:shrink-0 [&_h3]:before:rounded-full [&_h3]:before:bg-brand [&_h3]:before:content-['']"
            dangerouslySetInnerHTML={{ __html: config.html }}
          />
        </div>
      </AnimateIn>
    </section>
  );
}
