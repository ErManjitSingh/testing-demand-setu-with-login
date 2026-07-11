import StaticPageShell from "@/components/static/StaticPageShell";
import { TRAVEL_BLOG_POSTS } from "@/lib/staticPagesContent";

export const metadata = {
  title: "Travel Blog",
  description:
    "Destination guides, travel tips, and inspiration from the Demand Setu team.",
};

export default function TravelBlogPage() {
  return (
    <StaticPageShell
      title="Travel Blog"
      subtitle="Stories, guides, and practical tips to help you plan your next hotel stay or holiday."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {TRAVEL_BLOG_POSTS.map((post) => (
          <article
            key={post.title}
            className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-orange-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider">
              <span className="rounded-full bg-brand-muted px-3 py-1 text-brand">
                {post.category}
              </span>
              <span className="text-stone-400">{post.date}</span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-stone-900 group-hover:text-brand">
              {post.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
              {post.excerpt}
            </p>
            <p className="mt-4 text-xs font-medium text-stone-400">{post.readTime}</p>
          </article>
        ))}
      </div>

      <p className="mt-10 rounded-2xl bg-stone-100 px-6 py-4 text-center text-sm text-stone-600">
        New articles are added regularly. Subscribe via our footer newsletter to
        stay updated on destinations and exclusive offers.
      </p>
    </StaticPageShell>
  );
}
