/**
 * Shared shell for the home page: a white rounded card on the grey page, with a bold title row.
 * (Server-safe — no hooks. `HomeRail` adds the horizontal scroller on top of the same look.)
 */
export const HOME_WRAP = "px-3 py-3 sm:px-6 sm:py-4";
export const HOME_CARD = "mx-auto max-w-7xl rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:rounded-3xl sm:p-7";

export function HomeHeading({ id, eyebrow, title, subtitle, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      {eyebrow ? <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand">{eyebrow}</p> : null}
      <h2 id={id} className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-stone-950 sm:text-4xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-1 text-sm font-medium text-stone-600 sm:text-base">{subtitle}</p> : null}
    </div>
  );
}

export default function HomeSection({ id, headingId, eyebrow, title, subtitle, action = null, children, cardClassName = "" }) {
  return (
    <section id={id} aria-labelledby={headingId} className={HOME_WRAP}>
      <div className={`${HOME_CARD} ${cardClassName}`}>
        {title ? (
          <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <HomeHeading id={headingId} eyebrow={eyebrow} title={title} subtitle={subtitle} />
            {action}
          </header>
        ) : null}
        {children}
      </div>
    </section>
  );
}
