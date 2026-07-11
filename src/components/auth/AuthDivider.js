export default function AuthDivider({ label = "or" }) {
  return (
    <div className="relative py-0.5">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-stone-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-2 text-[10px] font-bold uppercase tracking-wide text-muted">
          {label}
        </span>
      </div>
    </div>
  );
}
