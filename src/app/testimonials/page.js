import StaticPageShell from "@/components/static/StaticPageShell";
import { SITE_TESTIMONIALS } from "@/lib/staticPagesContent";

export const metadata = {
  title: "Testimonials",
  description:
    "Read what travellers say about booking hotels, homestays, villas, and tour packages with Demand Setu.",
};

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-stone-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  return (
    <StaticPageShell
      title="Testimonials"
      subtitle="Real feedback from guests who booked stays and tour packages with Demand Setu."
    >
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          { stat: "4.9/5", label: "Average guest rating" },
          { stat: "10,000+", label: "Happy travellers" },
          { stat: "24/7", label: "Support availability" },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-orange-100 bg-white px-6 py-5 text-center shadow-sm"
          >
            <p className="text-2xl font-extrabold text-brand">{item.stat}</p>
            <p className="mt-1 text-sm text-stone-500">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SITE_TESTIMONIALS.map((t) => (
          <blockquote
            key={t.name}
            className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <StarRow rating={t.rating} />
            <p className="mt-4 flex-1 text-sm leading-relaxed text-stone-600">
              &ldquo;{t.text}&rdquo;
            </p>
            <footer className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {t.avatar}
              </span>
              <div>
                <p className="font-semibold text-stone-900">{t.name}</p>
                <p className="text-xs text-stone-500">
                  {t.location} · {t.stay}
                </p>
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </StaticPageShell>
  );
}
