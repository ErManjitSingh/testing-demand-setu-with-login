import { MapPin, Quote, Star } from "lucide-react";
import StaticPageShell from "@/components/static/StaticPageShell";
import { CtaBand } from "@/components/static/StaticUi";
import { SITE_TESTIMONIALS } from "@/lib/staticPagesContent";

export const metadata = {
  title: "Testimonials",
  description:
    "Read what travellers say about booking hotels, homestays, villas, and tour packages with Demand Setu.",
};

const STATS = [
  { label: "Average guest rating", value: "4.9 / 5" },
  { label: "Happy travellers", value: "10,000+" },
  { label: "Support availability", value: "24 / 7" },
];

const AVATAR_TONES = [
  "from-orange-500 to-amber-400",
  "from-rose-500 to-orange-400",
  "from-emerald-500 to-teal-400",
  "from-sky-500 to-indigo-400",
  "from-violet-500 to-fuchsia-400",
  "from-amber-500 to-yellow-400",
];

function StarRow({ rating, className = "h-4 w-4" }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${className} ${i < rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"}`} />
      ))}
    </div>
  );
}

function Avatar({ text, index, size = "h-11 w-11" }) {
  return (
    <span
      className={`grid ${size} shrink-0 place-items-center rounded-full bg-gradient-to-br ${AVATAR_TONES[index % AVATAR_TONES.length]} text-sm font-extrabold text-white shadow-md`}
    >
      {text}
    </span>
  );
}

export default function TestimonialsPage() {
  const [featured, ...rest] = SITE_TESTIMONIALS;

  return (
    <StaticPageShell
      eyebrow="Loved by travellers"
      icon={Star}
      title="Testimonials"
      subtitle="Real feedback from guests who booked stays and tour packages with Demand Setu."
      stats={STATS}
    >
      {/* featured */}
      <figure className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-brand-muted via-white to-white p-7 sm:p-12">
        <Quote aria-hidden className="absolute -right-4 -top-4 h-40 w-40 rotate-12 fill-brand/10 text-brand/10 sm:h-56 sm:w-56" />
        <StarRow rating={featured.rating} className="h-5 w-5" />
        <blockquote className="relative mt-5 max-w-3xl text-xl font-semibold leading-relaxed text-stone-800 sm:text-2xl">
          &ldquo;{featured.text}&rdquo;
        </blockquote>
        <figcaption className="relative mt-7 flex items-center gap-4">
          <Avatar text={featured.avatar} index={0} size="h-14 w-14" />
          <div>
            <p className="font-extrabold text-stone-900">{featured.name}</p>
            <p className="flex items-center gap-1.5 text-sm font-medium text-stone-500">
              <MapPin className="h-3.5 w-3.5" />
              {featured.location} · {featured.stay}
            </p>
          </div>
        </figcaption>
      </figure>

      {/* masonry */}
      <div className="mt-8 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        {rest.map((t, i) => (
          <figure
            key={t.name + t.stay}
            className="pk-fade-up group relative break-inside-avoid rounded-3xl border border-stone-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <Quote className="absolute right-5 top-5 h-8 w-8 fill-stone-100 text-stone-100 transition group-hover:fill-brand-muted group-hover:text-brand-muted" />
            <StarRow rating={t.rating} />
            <blockquote className="relative mt-4 text-sm font-medium leading-relaxed text-stone-600">
              &ldquo;{t.text}&rdquo;
            </blockquote>
            <span className="mt-4 inline-block rounded-full bg-brand-muted px-3 py-1 text-[11px] font-extrabold text-brand-dark">
              {t.stay}
            </span>
            <figcaption className="mt-5 flex items-center gap-3 border-t border-stone-100 pt-4">
              <Avatar text={t.avatar} index={i + 1} />
              <div className="min-w-0">
                <p className="truncate font-extrabold text-stone-900">{t.name}</p>
                <p className="text-xs font-medium text-stone-500">{t.location}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-12">
        <CtaBand
          title="Your story could be next"
          text="Join thousands of travellers who planned their trip with Demand Setu."
          primary={{ href: "/packages", label: "Explore packages" }}
        />
      </div>
    </StaticPageShell>
  );
}
