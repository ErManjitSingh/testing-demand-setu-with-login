import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ExploreSectionHeader from "@/components/packages/ExploreSectionHeader";
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

const LAYOUT = [
  "sm:col-span-2 lg:col-span-2 lg:row-span-2",
  "",
  "",
  "",
  "",
  "lg:col-span-2",
  "",
  "",
  "col-span-2 sm:col-span-3 lg:col-span-4",
];

export default function PackagesThemeTiles() {
  const counts = {};
  getListingPackages().forEach((p) => p.meta.themes.forEach((t) => (counts[t] = (counts[t] ?? 0) + 1)));

  return (
    <section className="bg-[#f6f3ee] py-14 sm:py-24" aria-labelledby="theme-tiles-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ExploreSectionHeader
          scriptLabel="Travel your way"
          title="Trips by mood"
          subtitle="Mountains or beaches, honeymoon or family — jump straight to the style of trip you want."
          count={`${PACKAGE_THEMES.length} styles`}
        />

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:auto-rows-[190px]">
          {PACKAGE_THEMES.map((theme, i) => {
            const Icon = getThemeIcon(theme.id);
            return (
              <Link
                key={theme.id}
                href={buildListingHref({ themes: [theme.id] })}
                className={`group relative isolate min-h-[170px] overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/5 transition duration-500 hover:-translate-y-1 hover:shadow-2xl ${LAYOUT[i] ?? ""}`}
              >
                <Image
                  src={getStateImage(THEME_COVER[theme.id] ?? "Kerala")}
                  alt=""
                  fill
                  loading="lazy"
                  sizes="(min-width:1024px) 25vw, 50vw"
                  className="-z-10 object-cover transition duration-700 group-hover:scale-110"
                />
                <span className="absolute inset-0 -z-10 bg-gradient-to-t from-stone-950/85 via-stone-950/25 to-stone-950/5" />
                <span className="absolute left-3 top-3 grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition group-hover:rotate-6 group-hover:bg-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-stone-900 opacity-0 transition duration-300 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="block font-serif text-xl font-medium leading-tight sm:text-2xl">{theme.label}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-white/70">{counts[theme.id] ?? 0} trips</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
