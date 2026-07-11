export default function LocationOptionsSkeleton({ rows = 6 }) {
  return (
    <ul className="py-1" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="px-3 py-2">
          <div
            className="h-4 animate-pulse rounded bg-stone-200"
            style={{ width: `${55 + (i % 3) * 12}%` }}
          />
        </li>
      ))}
    </ul>
  );
}
