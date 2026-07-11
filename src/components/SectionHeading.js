export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  action,
}) {
  const isCenter = align === "center";

  return (
    <div
      className={`flex flex-col gap-4 ${isCenter ? "items-center text-center" : ""}`}
    >
      <div
        className={`flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${
          isCenter ? "flex-col items-center sm:flex-col" : ""
        }`}
      >
        <div className={`min-w-0 flex-1 ${isCenter ? "max-w-xl" : ""}`}>
          {eyebrow && (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-muted px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-brand-dark">
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              {eyebrow}
            </span>
          )}
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className={`shrink-0 ${isCenter ? "" : "self-start sm:self-end"}`}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
