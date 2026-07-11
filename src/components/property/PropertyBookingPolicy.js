import { BOOKING_POLICIES, PROPERTY_POLICIES } from "@/lib/property";

export default function PropertyBookingPolicy({
  bookingPolicies = BOOKING_POLICIES,
  quickReference = PROPERTY_POLICIES,
}) {
  return (
    <section id="policies" className="scroll-mt-44">
      <h2 className="text-lg font-bold text-[#1a1a1a] sm:text-xl">
        House Rules & Policies
      </h2>

      {quickReference.length > 0 && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {quickReference.map((p) => (
            <div
              key={p.label}
              className="rounded-sm border border-[#e0e0e0] bg-white px-4 py-4"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[#757575]">
                {p.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#1a1a1a]">{p.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 divide-y divide-[#e8e8e8] border border-[#e0e0e0] bg-white">
        {bookingPolicies.map((policy) => (
          <div key={policy.title} className="px-4 py-5 sm:px-5">
            <h3 className="text-sm font-bold text-[#1a1a1a]">{policy.title}</h3>
            <p className="mt-2.5 text-sm leading-relaxed text-[#4a4a4a]">{policy.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
