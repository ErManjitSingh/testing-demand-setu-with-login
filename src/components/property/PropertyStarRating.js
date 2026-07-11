export default function PropertyStarRating({ badge, rating }) {
  const starMatch = String(badge || "").match(/(\d)/);
  const stars = starMatch ? Number(starMatch[1]) : Math.min(5, Math.round(Number(rating) || 0));

  if (!stars) return null;

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${stars} star hotel`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < stars ? "text-[#f3a533]" : "text-[#d4d4d4]"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}
