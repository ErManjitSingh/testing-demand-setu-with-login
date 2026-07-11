import { getSitemapEntries } from "@/lib/sitemapData";

export const revalidate = 3600;

export default async function sitemap() {
  return getSitemapEntries();
}
