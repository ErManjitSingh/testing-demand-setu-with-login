"use client";

import { useMemo, useState } from "react";
import { Backpack, BookOpen, CalendarDays, Clock, Compass, Mountain, Wallet } from "lucide-react";

const CATEGORY_STYLE = {
  Destinations: { icon: Compass, cover: "from-orange-500 via-amber-500 to-yellow-400" },
  "Travel Tips": { icon: Backpack, cover: "from-sky-600 via-cyan-500 to-teal-400" },
  Adventure: { icon: Mountain, cover: "from-emerald-700 via-emerald-500 to-lime-400" },
  "Budget Travel": { icon: Wallet, cover: "from-rose-600 via-pink-500 to-orange-400" },
};
const FALLBACK = { icon: BookOpen, cover: "from-stone-700 via-stone-600 to-stone-500" };

function Cover({ category, className = "" }) {
  const style = CATEGORY_STYLE[category] ?? FALLBACK;
  const Icon = style.icon;
  return (
    <div className={`relative isolate overflow-hidden bg-gradient-to-br ${style.cover} ${className}`}>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div aria-hidden className="absolute -bottom-10 -right-6 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <Icon aria-hidden className="absolute -bottom-6 -right-4 h-36 w-36 -rotate-12 text-white/25 transition duration-500 group-hover:scale-110 group-hover:-rotate-6" strokeWidth={1.4} />
      <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-stone-800 shadow-sm">
        <Icon className="h-3.5 w-3.5 text-brand" />
        {category}
      </span>
    </div>
  );
}

function Meta({ post }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-stone-400">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5" />
        {post.date}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        {post.readTime}
      </span>
    </div>
  );
}

export default function BlogExplorer({ posts }) {
  const categories = useMemo(() => ["All", ...new Set(posts.map((p) => p.category))], [posts]);
  const [active, setActive] = useState("All");

  const visible = active === "All" ? posts : posts.filter((p) => p.category === active);
  const [featured, ...rest] = visible;

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter articles">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={active === cat}
            onClick={() => setActive(cat)}
            className={`rounded-full border px-4 py-2 text-xs font-extrabold transition active:scale-95 ${
              active === cat
                ? "border-brand bg-brand text-white shadow-md shadow-brand/25"
                : "border-stone-200 bg-white text-stone-600 hover:border-brand/50 hover:text-brand"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {featured ? (
        <article key={featured.title} className="pk-fade-up group mt-6 grid overflow-hidden rounded-[2rem] border border-stone-200 bg-white transition hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10 md:grid-cols-2">
          <Cover category={featured.category} className="min-h-56 md:min-h-80" />
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand">Featured story</p>
            <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-stone-900 transition group-hover:text-brand sm:text-3xl">
              {featured.title}
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-stone-600 sm:text-base">{featured.excerpt}</p>
            <div className="mt-5">
              <Meta post={featured} />
            </div>
          </div>
        </article>
      ) : null}

      {rest.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <article
              key={post.title}
              className="pk-fade-up group flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <Cover category={post.category} className="h-40" />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-extrabold leading-snug text-stone-900 transition group-hover:text-brand">{post.title}</h3>
                <p className="mt-2 flex-1 text-sm font-medium leading-relaxed text-stone-500">{post.excerpt}</p>
                <div className="mt-4 border-t border-stone-100 pt-4">
                  <Meta post={post} />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
