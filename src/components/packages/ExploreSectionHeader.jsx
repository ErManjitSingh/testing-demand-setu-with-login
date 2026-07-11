export default function ExploreSectionHeader({
  scriptLabel,
  title,
  subtitle,
  icon,
  count,
  onScrollPrev,
  onScrollNext,
  align = "left",
}) {
  const hasScroll = onScrollPrev || onScrollNext;

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${
        align === "center" ? "sm:text-center" : ""
      }`}
    >
      <div className={align === "center" ? "mx-auto max-w-2xl" : ""}>
        <div className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
          <p className="font-serif text-lg italic text-brand sm:text-xl">{scriptLabel}</p>
          {count != null && (
            <span className="rounded-full bg-brand-muted px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-dark">
              {count}
            </span>
          )}
        </div>
        <h2
          className={`mt-2 flex items-center gap-2.5 text-2xl font-extrabold tracking-tight sm:text-3xl ${
            align === "center" ? "justify-center" : ""
          } ${align === "dark" ? "text-white" : "text-stone-900"}`}
        >
          {icon && (
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${
                align === "dark" ? "bg-white/10" : "bg-brand-muted"
              }`}
              aria-hidden
            >
              {icon}
            </span>
          )}
          {title}
        </h2>
        {subtitle && (
          <p
            className={`mt-2 max-w-xl text-sm leading-relaxed sm:text-base ${
              align === "center" ? "mx-auto" : ""
            } ${align === "dark" ? "text-stone-400" : "text-stone-500"}`}
          >
            {subtitle}
          </p>
        )}
        <div
          className={`mt-4 h-0.5 w-12 rounded-full bg-gradient-to-r from-brand to-brand/20 ${
            align === "center" ? "mx-auto" : ""
          }`}
        />
      </div>
      {hasScroll && (
        <div className={`flex gap-2 ${align === "center" ? "justify-center sm:justify-end" : ""}`}>
          <ScrollBtn onClick={onScrollPrev} label="Scroll left" direction="left" dark={align === "dark"} />
          <ScrollBtn onClick={onScrollNext} label="Scroll right" direction="right" dark={align === "dark"} />
        </div>
      )}
    </div>
  );
}

function ScrollBtn({ onClick, label, direction, dark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition ${
        dark
          ? "border-white/20 bg-white/10 text-white hover:border-brand hover:bg-brand"
          : "border-stone-200 bg-white text-stone-600 hover:border-brand hover:bg-brand-muted hover:text-brand"
      }`}
      aria-label={label}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
        {direction === "left" ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );
}

function PinIcon({ className = "h-4 w-4" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
    </svg>
  );
}

export { PinIcon };
