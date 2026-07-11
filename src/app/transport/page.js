import StaticPageShell from "@/components/static/StaticPageShell";

export const metadata = {
  title: "Transport",
  description:
    "Book cabs, tempo travellers, and private transport for holidays, airport transfers, and outstation trips with Demand Setu.",
};

const TRANSPORT_OPTIONS = [
  {
    title: "Airport transfers",
    text: "Pick-up and drop services for major airports with verified drivers and on-time reporting.",
  },
  {
    title: "Outstation cabs",
    text: "One-way and round-trip cabs for hill stations, heritage circuits, and multi-city holidays.",
  },
  {
    title: "Tempo travellers & buses",
    text: "Comfortable group transport for families, weddings, school trips, and corporate outings.",
  },
  {
    title: "Tour route cabs",
    text: "Dedicated vehicles for Ladakh, Himachal, Rajasthan, and other curated package routes.",
  },
];

export default function TransportPage() {
  return (
    <StaticPageShell
      title="Transport"
      subtitle="Reliable cabs and group vehicles for airport runs, outstation trips, and full holiday routes."
    >
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 text-stone-600 leading-relaxed">
          <p className="text-lg font-medium text-stone-800">
            From a single airport pickup to a multi-day holiday cab, Demand Setu
            arranges transport that matches your group size, route, and budget.
          </p>
          <p>
            Tell us your pickup city, destination, dates, and number of travellers.
            We share vehicle options with transparent pricing, driver details, and
            inclusions before you confirm.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {TRANSPORT_OPTIONS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-bold text-stone-900">{item.title}</h2>
                <p className="mt-2 text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          <h2 className="pt-2 text-xl font-bold text-stone-900">What we need from you</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            <li>Pickup and drop locations with preferred date and time</li>
            <li>Number of passengers and luggage requirements</li>
            <li>Vehicle preference (sedan, SUV, tempo traveller, etc.)</li>
            <li>Any planned sightseeing stops along the route</li>
          </ul>
        </div>

        <aside className="h-fit rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">Request transport</h2>
          <p className="mt-3 text-sm text-stone-600">
            Share your route details and our coordinators will send a quote within
            a few hours.
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <a
              href="tel:+918353056000"
              className="block font-semibold text-brand hover:underline"
            >
              +91 8353056000
            </a>
            <a
              href="mailto:info@demandsetutours.com"
              className="block font-semibold text-brand hover:underline"
            >
              info@demandsetutours.com
            </a>
          </div>
        </aside>
      </div>
    </StaticPageShell>
  );
}
