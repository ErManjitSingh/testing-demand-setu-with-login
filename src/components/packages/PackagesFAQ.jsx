import AnimateIn from "@/components/packages/AnimateIn";
import { PACKAGE_FAQ } from "@/lib/tourPackages";

export default function PackagesFAQ() {
  return (
    <section id="packages-faq" className="bg-white py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="font-serif text-lg italic text-brand">FAQ</p>
          <h2 className="mt-1 font-serif text-4xl font-medium tracking-tight text-stone-950 sm:text-5xl">
            Questions before you travel?
          </h2>
        </div>

        <div className="divide-y divide-stone-200 border-y border-stone-200">
          {PACKAGE_FAQ.map((item, index) => (
            <AnimateIn key={item.q} delay={index * 60}>
            <details className="group" open={index === 0}>
              <summary className="cursor-pointer list-none py-5 text-base font-semibold text-stone-950 marker:content-none">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span className="mt-0.5 shrink-0 text-brand transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="pb-5 text-sm leading-relaxed text-stone-600 sm:text-base">{item.a}</p>
            </details>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  );
}
