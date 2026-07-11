import { PACKAGE_FAQ } from "@/lib/tourPackages";

export default function PackagesFAQ() {
  return (
    <section id="packages-faq" className=" py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="scroll-mt-28 rounded-3xl border border-border  p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">FAQ</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Questions before you travel?
          </h2>

          <div className="mt-5 divide-y divide-border rounded-2xl border border-border">
            {PACKAGE_FAQ.map((item, index) => (
              <details key={item.q} className="group px-5 py-1" open={index === 0}>
                <summary className="cursor-pointer list-none py-4 text-sm font-bold text-foreground marker:content-none sm:text-base">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span className="mt-1 shrink-0 text-brand transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-muted sm:text-base">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
