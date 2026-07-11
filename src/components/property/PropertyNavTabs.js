"use client";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "rooms", label: "Rooms" },
  { id: "amenities", label: "Amenities" },
  { id: "location", label: "Location" },
  { id: "policies", label: "Policies" },
];

export default function PropertyNavTabs({ showReviews = false }) {
  const tabs = showReviews
    ? [...TABS, { id: "reviews", label: "Reviews" }]
    : TABS;

  return (
    <div className="sticky top-[7.5rem] z-30 -mx-4 border-b border-[#e0e0e0] bg-white px-4 sm:-mx-0 sm:px-0 lg:top-[10.5rem]">
      <ul className="no-scrollbar flex items-stretch gap-0 overflow-x-auto">
        {tabs.map((tab) => (
          <li key={tab.id}>
            <a
              href={`#${tab.id}`}
              className="inline-flex min-h-[3rem] items-center whitespace-nowrap border-b-[3px] border-transparent px-4 py-3 text-sm font-bold text-stone-600 transition hover:text-brand [&:target]:border-brand [&:target]:text-brand"
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
