"use client";

const FIELD =
  "mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-stone-900 outline-none transition placeholder:font-normal placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/15";

export function FieldRow({ title, hint, children, error }) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-stone-100 py-4 sm:grid-cols-3 sm:items-start sm:gap-4">
      <div className="min-w-0">
        <p className="text-sm font-bold text-stone-900">{title}</p>
        {hint ? (
          <p className="mt-0.5 text-xs font-medium leading-relaxed text-stone-500">
            {hint}
          </p>
        ) : null}
      </div>
      <div className="sm:col-span-2">
        {children}
        {error ? (
          <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

export function TextInput(props) {
  return <input {...props} className={`${FIELD} ${props.className || ""}`} />;
}

export function TextSelect({ children, ...props }) {
  return (
    <select {...props} className={`${FIELD} ${props.className || ""}`}>
      {children}
    </select>
  );
}

export function TextTextarea(props) {
  return (
    <textarea
      {...props}
      className={`${FIELD} min-h-[96px] resize-y ${props.className || ""}`}
    />
  );
}

export function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-1 px-0.5 pt-1">
      <h2 className="text-lg font-extrabold tracking-tight text-stone-900 sm:text-xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-1 text-sm font-medium text-stone-500">{subtitle}</p>
      ) : null}
    </div>
  );
}

export { FIELD };
