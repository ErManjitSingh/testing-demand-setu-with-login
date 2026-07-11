export default function PageLoading({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center gap-4 px-4 py-16">
      <span
        className="h-11 w-11 animate-spin rounded-full border-[3px] border-brand/20 border-t-brand"
        aria-hidden
      />
      <p className="text-sm font-bold text-stone-600">{label}</p>
    </div>
  );
}
