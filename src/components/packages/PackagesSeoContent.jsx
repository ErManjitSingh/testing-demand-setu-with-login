/** Long-form SEO copy at the bottom of the page (admin: SEO Content / About Section). */
export default function PackagesSeoContent({ config }) {
  if (!config?.html) return null;

  return (
    <section className="px-3 pb-6 pt-3 sm:px-6 sm:pb-10 sm:pt-4" aria-label="About our tour packages">
      <div>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:rounded-3xl sm:p-8 lg:p-12">
          <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-amber-400 to-brand" />
          <div
            className="seo-html seo-columns text-[15px] leading-relaxed text-stone-600 sm:text-base [&_h2]:mb-5 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:text-stone-950 sm:[&_h2]:text-3xl [&_h3]:mb-2 [&_h3]:mt-0 [&_p]:mb-7 [&_h3]:flex [&_h3]:items-center [&_h3]:gap-3 [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:text-stone-900 [&_h3]:before:h-5 [&_h3]:before:w-1 [&_h3]:before:shrink-0 [&_h3]:before:rounded-full [&_h3]:before:bg-brand [&_h3]:before:content-['']"
            dangerouslySetInnerHTML={{ __html: config.html }}
          />
        </div>
      </div>
    </section>
  );
}
