import Link from "next/link";
import { Sparkles } from "lucide-react";

/** Slim message strip under the hero (admin: Announcement Bar). */
export default function PackagesAnnouncement({ config }) {
  if (!config?.text) return null;

  const { text, linkText, linkUrl } = config;
  const isInternal = linkUrl?.startsWith("/");
  const linkClass =
    "ml-1 inline-flex items-center rounded-full bg-white/20 px-3 py-0.5 font-bold underline-offset-2 transition hover:bg-white/30";

  return (
    <div className="bg-gradient-to-r from-[#c2410c] via-[#ea580c] to-[#f97316] px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-white sm:text-sm">
      <span className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-200" aria-hidden />
        <span>{text}</span>
        {linkUrl && linkText ? (
          isInternal ? (
            <Link href={linkUrl} className={linkClass}>
              {linkText}
            </Link>
          ) : (
            <a href={linkUrl} className={linkClass}>
              {linkText}
            </a>
          )
        ) : null}
      </span>
    </div>
  );
}
