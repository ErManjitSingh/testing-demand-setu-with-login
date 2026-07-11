import StaticPageShell from "@/components/static/StaticPageShell";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Demand Setu for hotel bookings, tour packages, group stays, and travel support.",
};

const CONTACT_CHANNELS = [
  {
    label: "Phone",
    value: "+91 8353056000",
    href: "tel:+918353056000",
    note: "Available 24/7 for bookings and trip support",
  },
  {
    label: "Email",
    value: "info@demandsetutours.com",
    href: "mailto:info@demandsetutours.com",
    note: "We respond within a few hours on business days",
  },
  {
    label: "Office",
    value:
      "First floor, Mother Bindra Tower, 39 mile, Shahpur, Himachal Pradesh 176206",
    note: "Visit by appointment Monday to Saturday",
  },
];

export default function ContactUsPage() {
  return (
    <StaticPageShell
      title="Contact Us"
      subtitle="Questions about a stay, package, or group booking? Our travel specialists are ready to help."
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          {CONTACT_CHANNELS.map((channel) => (
            <div
              key={channel.label}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-brand">
                {channel.label}
              </p>
              {channel.href ? (
                <a
                  href={channel.href}
                  className="mt-2 block text-lg font-semibold text-stone-900 transition hover:text-brand"
                >
                  {channel.value}
                </a>
              ) : (
                <p className="mt-2 text-lg font-semibold text-stone-900">
                  {channel.value}
                </p>
              )}
              <p className="mt-2 text-sm text-stone-500">{channel.note}</p>
            </div>
          ))}

          <div className="rounded-2xl bg-brand-muted p-6">
            <h2 className="font-bold text-stone-900">Business hours</h2>
            <ul className="mt-3 space-y-2 text-sm text-stone-600">
              <li>Monday – Saturday: 9:00 AM – 8:00 PM IST</li>
              <li>Sunday: 10:00 AM – 6:00 PM IST</li>
              <li>Emergency trip support: 24/7 via phone</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-stone-900">Send us a message</h2>
          <p className="mt-2 text-sm text-stone-500">
            Fill in the form and our team will get back to you shortly.
          </p>

          <form className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="font-medium text-stone-700">Full name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-stone-700">Phone</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">Email</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">Subject</span>
              <select
                name="subject"
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                defaultValue="booking"
              >
                <option value="booking">Hotel / stay booking</option>
                <option value="package">Tour package enquiry</option>
                <option value="group">Group or bulk booking</option>
                <option value="support">Booking support</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-stone-700">Message</span>
              <textarea
                name="message"
                rows={5}
                placeholder="Tell us about your travel plans..."
                className="mt-1.5 w-full resize-y rounded-xl border border-stone-200 px-4 py-2.5 text-stone-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <button
              type="button"
              className="w-full rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-dark sm:w-auto"
            >
              Submit enquiry
            </button>
            <p className="text-xs text-stone-400">
              For urgent booking help, call us directly at{" "}
              <a href="tel:+918353056000" className="text-brand hover:underline">
                +91 8353056000
              </a>
              .
            </p>
          </form>
        </div>
      </div>
    </StaticPageShell>
  );
}
