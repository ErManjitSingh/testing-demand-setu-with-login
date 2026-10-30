import PackagesPageClient from "@/components/packages/PackagesPageClient";
import {
  fetchHotelCitiesList,
  fetchHotelStatesList,
} from "@/lib/locationResolve";
import { fetchPackageHomeConfig } from "@/lib/packageHomeApi";

const DEFAULT_TITLE = "Demand Setu Tours | Tour Packages Across India & The World";
const DEFAULT_DESCRIPTION =
  "Tour packages across India and the world — explore states, cities and famous itineraries with Demand Setu.";

// Admin edits (Package Home Page) show up within about five minutes
export const revalidate = 300;

export async function generateMetadata() {
  const seo = (await fetchPackageHomeConfig())?.seo;

  return {
    title: seo?.title || DEFAULT_TITLE,
    description: seo?.description || DEFAULT_DESCRIPTION,
    ...(seo?.keywords ? { keywords: seo.keywords } : {}),
    ...(seo?.canonical ? { alternates: { canonical: seo.canonical } } : {}),
  };
}

export default async function Home() {
  const [states, cities, homeConfig] = await Promise.all([
    fetchHotelStatesList(),
    fetchHotelCitiesList(),
    fetchPackageHomeConfig(),
  ]);

  return <PackagesPageClient states={states} cities={cities} homeConfig={homeConfig} />;
}
