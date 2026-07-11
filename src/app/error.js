"use client";

export default function Error({ error, reset }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">Something went wrong</p>
      <h1 className="mt-3 text-2xl font-extrabold text-foreground sm:text-3xl">
        We couldn&apos;t load this page
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {error?.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-brand/90"
      >
        Try again
      </button>
    </div>
  );
}
