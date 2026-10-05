import Link from "next/link";

export default function PackageNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-xl italic text-brand">Lost the trail</p>
      <h1 className="mt-2 text-3xl font-extrabold text-stone-900 sm:text-4xl">We couldn&apos;t find that package</h1>
      <p className="mt-3 text-stone-600">It may have been renamed or retired. Browse all of our current trips instead.</p>
      <Link
        href="/packages"
        className="mt-7 rounded-full bg-brand px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand/30 transition hover:bg-brand-dark"
      >
        View all packages
      </Link>
    </div>
  );
}
