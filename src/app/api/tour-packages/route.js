import { NextResponse } from "next/server";
import { getPackageMeta } from "@/lib/tourPackageMeta";
import {
  fetchPackagesByPlace,
  fetchPackagesByState,
  fetchPackagesByTheme,
} from "@/lib/tourPackagesApi";

export const revalidate = 300;

function withMeta(packages) {
  return packages.map((pkg) => ({ ...pkg, meta: getPackageMeta(pkg) }));
}

/** Proxies packagemaker list APIs so the listing page can refetch on filter changes. */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const theme = (searchParams.get("theme") || "").trim();
  const place = (searchParams.get("place") || "").trim();
  const state = (searchParams.get("state") || searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(60, Math.max(1, Number(searchParams.get("limit")) || 48));

  try {
    if (theme) {
      const result = await fetchPackagesByTheme(theme, { page, limit });
      return NextResponse.json({
        success: true,
        source: "theme",
        query: theme,
        packages: withMeta(result.packages),
        pagination: result.pagination,
      });
    }

    if (place) {
      const result = await fetchPackagesByPlace(place, { page, limit });
      return NextResponse.json({
        success: true,
        source: "place",
        query: place,
        packages: withMeta(result.packages),
        pagination: result.pagination,
      });
    }

    if (state) {
      const result = await fetchPackagesByState(state, { page, limit });
      return NextResponse.json({
        success: true,
        source: "state",
        query: state,
        packages: withMeta(result.packages),
        pagination: result.pagination,
      });
    }

    return NextResponse.json({ success: true, source: "none", query: "", packages: [], pagination: null });
  } catch {
    return NextResponse.json({ success: false, packages: [], pagination: null }, { status: 502 });
  }
}
