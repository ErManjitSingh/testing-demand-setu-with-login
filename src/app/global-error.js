"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[#f8f6f3] p-6 font-sans text-[#1c1917]">
        <div className="max-w-md text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ea580c]">
            Something went wrong
          </p>
          <h1 className="mt-3 text-2xl font-extrabold">Demand Setu</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#57534e]">
            {error?.message || "An unexpected error occurred. Please refresh the page."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-full bg-[#ea580c] px-6 py-3 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
