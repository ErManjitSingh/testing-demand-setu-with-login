import Image from "next/image";
import Link from "next/link";
import HomeRail from "@/components/packages/HomeRail";
import { getThemeIcon } from "@/components/packages/shared/themeIcons";
import { getStateImage } from "@/components/state/stateImageMap";
import { buildListingHref } from "@/lib/packageBooking";
import { PACKAGE_THEMES, getListingPackages } from "@/lib/tourPackageMeta";

const THEME_COVER = {
  mountains: "Ladakh",
  beaches: "Goa",
  heritage: "Rajasthan",
  spiritual: "Uttarakhand",
  wildlife: "Assam",
  honeymoon: "Kerala",
  adventure: "Himachal Pradesh",
  city: "Delhi",
  family: "Karnataka",
};

const MAX_THEMES = 12;

export default function PackagesThemeTiles({ config = null }) {
  // Admin-managed themes (already limited to ids the listing page can filter by)
  const themes = config?.items?.length
    ? config.items.slice(0, MAX_THEMES).map((item) => ({
        id: item.id,
        label: item.label,
        cover: item.image || getStateImage(THEME_COVER[item.id] ?? "Kerala"),
      }))
    : PACKAGE_THEMES.map((theme) => ({
        id: theme.id,
        label: theme.label,
        cover: getStateImage(THEME_COVER[theme.id] ?? "Kerala"),
      }));

  const counts = {};
  getListingPackages().forEach((p) => p.meta.themes.forEach((t) => (counts[t] = (counts[t] ?? 0) + 1)));

  return (
    <HomeRail
      id="theme-tiles"
      variant="theme"
      title={config?.title || "Holidays by theme"}
      subtitle="Mountains or beaches, honeymoon or family — pick the style of trip you want."
    >
      {themes.map((theme) => {
        const Icon = getThemeIcon(theme.id);
        return (
          <Link
            key={theme.id}
            data-snap-card
            href={buildListingHref({ themes: [theme.id] })}
            className="group w-[11.5rem] shrink-0 snap-start overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[13rem]"
          >
            <span className="relative block aspect-[4/3] overflow-hidden">
              <Image
                src={theme.cover}
                alt=""
                fill
                loading="lazy"
                sizes="210px"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute left-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-brand shadow-sm">
                <Icon className="h-4 w-4" />
              </span>
            </span>
            <span className="block px-3 py-3 text-center">
              <span className="block text-[13px] font-extrabold uppercase tracking-wide text-stone-900">{theme.label}</span>
              <span className="mt-1 inline-block rounded-full border border-brand/30 bg-brand-muted px-2.5 py-0.5 text-[11px] font-bold text-brand">
                {(counts[theme.id] ?? 0) > 0 ? `${counts[theme.id]} trips` : "Explore"}
              </span>
            </span>
          </Link>
        );
      })}
    </HomeRail>
  );
}
