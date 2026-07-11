import PackagesPageClient from "@/components/packages/PackagesPageClient";
import {
  fetchHotelCitiesList,
  fetchHotelStatesList,
} from "@/lib/locationResolve";

export const metadata = {
  title: "Demand Setu Tours | Tour Packages Across India & The World",
  description:
    "Tour packages across India and the world — explore states, cities and famous itineraries with Demand Setu.",
};

export const revalidate = 1800;

export default async function Home() {
  const [states, cities] = await Promise.all([
    fetchHotelStatesList(),
    fetchHotelCitiesList(),
  ]);

  return <PackagesPageClient states={states} cities={cities} />;
}
