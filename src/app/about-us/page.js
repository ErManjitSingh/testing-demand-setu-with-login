import StaticPageShell from "@/components/static/StaticPageShell";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Demand Setu — your trusted travel partner for hotels, homestays, villas, and curated tour packages across India.",
};

export default function AboutUsPage() {
  return (
    <StaticPageShell
      title="About Us"
      subtitle="Crafting memorable journeys across India with handpicked stays and personalised travel support."
    >
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 text-stone-600 leading-relaxed">
          <p className="text-lg font-medium text-stone-800">
            Demand Setu is a Himachal Pradesh–based travel company built for
            travellers who want more than a generic booking experience.
          </p>
          <p>
            From boutique hotels and cosy homestays to private villas and
            fully curated tour packages, we connect you with verified properties
            and reliable on-ground partners. Whether you are planning a family
            vacation, a honeymoon, a workation, or a group trip, our team helps
            you find the right stay at the right price.
          </p>
          <p>
            We believe travel should feel personal. That is why every enquiry is
            handled by real specialists — not bots — who understand destinations,
            seasons, and local nuances. Our goal is simple: make booking easy,
            stays memorable, and support available whenever you need it.
          </p>

          <h2 className="pt-4 text-xl font-bold text-stone-900">What we offer</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Hotels, homestays, Airbnbs, and private villas across India</li>
            <li>Domestic and international tour packages</li>
            <li>Transport, visa assistance, and travel insurance on request</li>
            <li>24/7 customer support before, during, and after your trip</li>
          </ul>

          <h2 className="pt-4 text-xl font-bold text-stone-900">Why travellers choose us</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Verified stays",
                text: "Properties checked for quality, location accuracy, and guest safety.",
              },
              {
                title: "Best price focus",
                text: "Competitive rates with transparent pricing — no hidden surprises.",
              },
              {
                title: "Local expertise",
                text: "Based in Himachal Pradesh with deep knowledge of mountain and leisure routes.",
              },
              {
                title: "End-to-end support",
                text: "From enquiry to checkout to on-trip assistance, we stay with you.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-bold text-stone-900">{item.title}</h3>
                <p className="mt-2 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">At a glance</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-stone-500">Founded</dt>
              <dd className="mt-1 text-stone-800">Himachal Pradesh, India</dd>
            </div>
            <div>
              <dt className="font-semibold text-stone-500">Head office</dt>
              <dd className="mt-1 text-stone-800">
                First floor, Mother Bindra Tower, 39 mile, Shahpur, Himachal
                Pradesh 176206
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-stone-500">Phone</dt>
              <dd className="mt-1">
                <a href="tel:+918353056000" className="text-brand hover:underline">
                  +91 8353056000
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-stone-500">Email</dt>
              <dd className="mt-1">
                <a
                  href="mailto:info@demandsetutours.com"
                  className="text-brand hover:underline"
                >
                  info@demandsetutours.com
                </a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </StaticPageShell>
  );
}
