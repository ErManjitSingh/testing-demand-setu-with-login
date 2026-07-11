"use client";

export default function ListingsBookingAlert({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <span className="text-lg" aria-hidden>
        ⚠️
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">Complete your search first</p>
        <p className="mt-0.5">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-full p-1 text-red-600 hover:bg-red-100"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
