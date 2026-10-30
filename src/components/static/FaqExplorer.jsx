"use client";

import { useMemo, useState } from "react";
import { ChevronDown, SearchX, Search } from "lucide-react";

export default function FaqExplorer({ items }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .map((item, index) => ({ ...item, index }))
      .filter((item) => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search questions</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — cancellation, refund, group booking…"
          className="input-no-ios-zoom w-full rounded-2xl border border-stone-200 bg-white py-4 pl-12 pr-4 text-sm font-semibold text-stone-900 shadow-sm outline-none transition placeholder:font-medium placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
      </label>

      <ul className="mt-5 space-y-3">
        {results.map((item) => {
          const isOpen = open === item.index || Boolean(query.trim());
          return (
            <li
              key={item.q}
              className={`overflow-hidden rounded-2xl border bg-white transition ${
                isOpen ? "border-brand/40 shadow-lg shadow-brand/5" : "border-stone-200 hover:border-stone-300"
              }`}
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(open === item.index ? -1 : item.index)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold transition ${
                      isOpen ? "bg-brand text-white" : "bg-brand-muted text-brand"
                    }`}
                  >
                    {String(item.index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-sm font-extrabold text-stone-900 sm:text-base">{item.q}</span>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-stone-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand" : ""}`} />
                </button>
              </h3>
              <div className="pk-collapse" data-open={isOpen}>
                <div>
                  <p className="px-5 pb-5 pl-[4.75rem] pr-6 text-sm font-medium leading-relaxed text-stone-600 sm:pl-[5.25rem]">
                    {item.a}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {results.length === 0 ? (
        <div className="pk-fade mt-5 rounded-2xl border border-dashed border-stone-300 px-6 py-12 text-center">
          <SearchX className="mx-auto h-9 w-9 text-stone-300" />
          <p className="mt-3 font-extrabold text-stone-900">No questions match &ldquo;{query}&rdquo;</p>
          <p className="mt-1 text-sm font-medium text-stone-500">Try a different word, or ask our team directly.</p>
        </div>
      ) : null}
    </div>
  );
}
