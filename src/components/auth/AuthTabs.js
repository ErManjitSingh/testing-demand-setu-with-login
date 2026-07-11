"use client";

import Link from "next/link";

const tabs = [
  { href: "/signin", label: "Sign in", key: "signin" },
  { href: "/signup", label: "Sign up", key: "signup" },
];

export default function AuthTabs({ active }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-xl border border-stone-200 bg-stone-100/80 p-0.5">
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`rounded-lg px-3 py-2 text-center text-xs font-bold transition sm:text-sm ${
              isActive
                ? "bg-white text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
