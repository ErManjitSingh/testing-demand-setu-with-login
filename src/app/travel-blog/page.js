import { BellRing, BookOpen } from "lucide-react";
import BlogExplorer from "@/components/static/BlogExplorer";
import StaticPageShell from "@/components/static/StaticPageShell";
import { CtaBand } from "@/components/static/StaticUi";
import { TRAVEL_BLOG_POSTS } from "@/lib/staticPagesContent";

export const metadata = {
  title: "Travel Blog",
  description:
    "Destination guides, travel tips, and inspiration from the Demand Setu team.",
};

export default function TravelBlogPage() {
  return (
    <StaticPageShell
      eyebrow="Guides & inspiration"
      icon={BookOpen}
      title="Travel Blog"
      subtitle="Stories, guides, and practical tips to help you plan your next hotel stay or holiday."
    >
      <BlogExplorer posts={TRAVEL_BLOG_POSTS} />

      <p className="mt-10 flex items-center justify-center gap-3 rounded-2xl bg-brand-muted/70 px-6 py-4 text-center text-sm font-semibold text-stone-700">
        <BellRing className="h-5 w-5 shrink-0 text-brand" />
        New articles are added regularly. Subscribe via our footer newsletter to stay updated on destinations and
        exclusive offers.
      </p>

      <div className="mt-12">
        <CtaBand
          title="Turn the inspiration into a trip"
          text="Found a place you love? Tell us your dates and we'll handle the stays, cabs and meals."
        />
      </div>
    </StaticPageShell>
  );
}
