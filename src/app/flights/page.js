import StaticPageShell from "@/components/static/StaticPageShell";

export const metadata = {
  title: "Flights",
  description:
    "Book domestic and international flights with Demand Setu. Compare fares, get support, and plan your trip end to end.",
};

const FLIGHT_SERVICES = [
  {
    title: "Domestic flights",
    text: "Daily connections across major Indian cities including Delhi, Mumbai, Bangalore, Goa, Srinagar, and more.",
  },
  {
    title: "International flights",
    text: "Flights to Dubai, Thailand, Nepal, Sri Lanka, and other popular destinations with flexible date options.",
  },
  {
    title: "Group & family bookings",
    text: "Special assistance for wedding travel, corporate trips, and family holidays with coordinated itineraries.",
  },
  {
    title: "Trip coordination",
    text: "Combine flights with hotels, cabs, and tour packages for a single point of contact throughout your journey.",
  },
];

export default function FlightsPage() {
  return (
    <StaticPageShell
      title="Flights"
      subtitle="Compare fares, book confidently, and travel with dedicated support from the Demand Setu team."
    >
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 text-stone-600 leading-relaxed">
          <p className="text-lg font-medium text-stone-800">
            Whether you are flying solo, with family, or planning a group trip, we
            help you find the right route at a competitive price.
          </p>
          <p>
            Share your travel dates, preferred airlines, and budget — our specialists
            will shortlist options and confirm your booking with clear fare rules and
            cancellation terms before you pay.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {FLIGHT_SERVICES.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <h2 className="font-bold text-stone-900">{item.title}</h2>
                <p className="mt-2 text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          <h2 className="pt-2 text-xl font-bold text-stone-900">How to book</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>Call us or submit an enquiry with your route and travel dates.</li>
            <li>Review fare options, baggage allowance, and cancellation policy.</li>
            <li>Confirm and pay securely — receive your e-ticket and trip summary.</li>
          </ol>
        </div>

        <aside className="h-fit rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900">Book a flight</h2>
          <p className="mt-3 text-sm text-stone-600">
            Our team handles flight enquiries personally for the best fares and
            reliable support.
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
