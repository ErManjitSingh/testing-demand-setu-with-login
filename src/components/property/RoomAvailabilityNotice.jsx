"use client";

export default function RoomAvailabilityNotice({ notice, onDismiss }) {
  if (!notice) return null;

  const { requested, available, categoryLabel } = notice;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        aria-label="Close availability notice"
        onClick={onDismiss}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="availability-notice-title"
        className="relative z-10 w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
      >
        <h3 id="availability-notice-title" className="text-lg font-bold text-[#1a1a1a]">
          Limited availability
        </h3>
        <p className="mt-2 text-sm text-[#4a4a4a]">
          You selected {requested} room{requested !== 1 ? "s" : ""} in your search
          {categoryLabel ? (
            <>
              , but <span className="font-semibold">{categoryLabel}</span>
            </>
          ) : null}{" "}
          only has {available} room{available !== 1 ? "s" : ""} available for your dates.
        </p>
        <p className="mt-2 text-sm text-[#757575]">
          We have selected {available} room{available !== 1 ? "s" : ""} and priced your booking
          accordingly.
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-5 w-full rounded bg-brand py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-brand-dark"
        >
          OK, got it
        </button>
      </div>
    </div>
  );
}
