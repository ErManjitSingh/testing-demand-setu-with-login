import { AMENITY_ICON_MAP } from "@/lib/property";

function resolveAmenityIcon(item) {
  if (AMENITY_ICON_MAP[item]) return AMENITY_ICON_MAP[item];
  const key = String(item || "").toLowerCase();
  if (key.includes("wifi")) return "wifi";
  if (key.includes("parking")) return "parking";
  if (key.includes("gym") || key.includes("fitness")) return "gym";
  if (key.includes("restaurant") || key.includes("dining")) return "restaurant";
  if (key.includes("pool") || key.includes("swim")) return "pool";
  if (key.includes("laundry")) return "laundry";
  if (key.includes("room service")) return "service";
  if (key.includes("air conditioning") || key === "ac") return "ac";
  return "check";
}

export default function PropertyAmenities({ groups, rating }) {
  const popularItems = groups.flatMap((g) => g.items).slice(0, 8);

  return (
    <section id="amenities" className="scroll-mt-44">
      <h2 className="text-lg font-bold text-[#1a1a1a] sm:text-xl">Amenities</h2>
      {rating > 0 && (
        <p className="mt-1 text-sm text-[#4a4a4a]">
          Amenities rated <span className="font-bold text-[#1a1a1a]">{rating}</span> by guests
        </p>
      )}

      {popularItems.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {popularItems.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-2 rounded-sm border border-[#e0e0e0] bg-white px-3 py-2 text-xs font-semibold text-[#4a4a4a] sm:text-sm"
            >
              <AmenityIcon name={resolveAmenityIcon(item)} />
              {item}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 space-y-4">
        {groups.map((group) => (
          <div
            key={group.title}
            className="rounded-sm border border-[#e0e0e0] bg-white p-4 sm:p-5"
          >
            <h3 className="text-sm font-bold text-[#1a1a1a]">{group.title}</h3>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              {group.items.map((item) => (
                <li key={item} className="flex min-w-0 items-start gap-2 text-sm text-[#4a4a4a]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-brand-muted text-brand">
                    <AmenityIcon name={resolveAmenityIcon(item)} />
                  </span>
                  <span className="min-w-0 leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function AmenityIcon({ name }) {
  const cls = "h-3.5 w-3.5";
  if (name === "wifi") {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M2.34 8.76a9.75 9.75 0 0113.32 0" />
      </svg>
    );
  }
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
