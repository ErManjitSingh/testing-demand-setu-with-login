import Image from "next/image";
import {
  isHtmlContent,
  normalizeSeoRichText,
  sanitizeSeoHtml,
  seoTagsFromRecord,
  splitSeoParagraphs,
} from "@/lib/seoListingApi";

function SectionShell({ id, eyebrow, title, children, className = "" }) {
  return (
    <section
      id={id}
      className={`scroll-mt-28 rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-8 ${className}`}
    >
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-widest text-brand">{eyebrow}</p>
      )}
      {title && (
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ProseBlock({ text }) {
  const paragraphs = splitSeoParagraphs(text);
  if (!paragraphs.length) return null;

  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted sm:text-base">
      {paragraphs.map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

function SeoRichText({ content }) {
  const value = normalizeSeoRichText(content);
  if (!value) return null;

  if (isHtmlContent(value)) {
    return (
      <div
        className="seo-html text-sm leading-relaxed text-muted sm:text-base"
        dangerouslySetInnerHTML={{ __html: sanitizeSeoHtml(value) }}
      />
    );
  }

  return <ProseBlock text={value} />;
}

function PlainTipsList({ text }) {
  const items = String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!items.length) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((tip, i) => (
        <li
          key={i}
          className="flex gap-3 rounded-2xl border border-border bg-brand-muted/20 p-4 text-sm leading-relaxed text-foreground"
        >
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
            {i + 1}
          </span>
          <span>{tip}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ListingsSeoContent({ seo }) {
  if (!seo) return null;

  const aboutValue = normalizeSeoRichText(seo.aboutLocation);
  const aboutParagraphs = isHtmlContent(aboutValue) ? [] : splitSeoParagraphs(aboutValue);
  const highlights = Array.isArray(seo.highlights) ? seo.highlights.filter(Boolean) : [];
  const faqs = Array.isArray(seo.faqs) ? seo.faqs.filter((f) => f?.question) : [];
  const tags = seoTagsFromRecord(seo);
  const images = Array.isArray(seo.images) ? seo.images.filter((img) => img?.preview) : [];
  const locationLabel = [seo.city, seo.state].filter(Boolean).join(", ");

  return (
    <div className="mt-12 space-y-6 border-t border-border pt-12 sm:mt-16 sm:pt-16">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">
          {locationLabel || "Destination guide"}
        </p>
        {seo.heading && (
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {seo.heading}
          </h2>
        )}
        {(seo.subHeading || seo.focusKeyword) && (
          <div className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            <SeoRichText content={seo.subHeading || seo.focusKeyword} />
          </div>
        )}
      </header>

     

      {(aboutValue || aboutParagraphs.length > 0) && (
        <SectionShell
          id="about-destination"
          eyebrow="About the destination"
          title={`About ${seo.city || seo.state || "this destination"}`}
        >
          <SeoRichText content={aboutValue} />
        </SectionShell>
      )}

    

      {highlights.length > 0 && (
        <SectionShell id="seo-highlights" eyebrow="Why visit" title="Highlights">
          <ul className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item, i) => (
              <li
                key={i}
                className="rounded-2xl border border-border bg-gradient-to-br from-white to-brand-muted/30 p-5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                  ✦
                </span>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground">
                  {item}
                </p>
              </li>
            ))}
          </ul>
        </SectionShell>
      )}

      {seo.bestTimeToVisit && (
        <SectionShell id="seo-best-time" eyebrow="When to go" title="Best time to visit">
          <SeoRichText content={seo.bestTimeToVisit} />
        </SectionShell>
      )}

      {seo.howToReach && (
        <SectionShell
          id="seo-how-to-reach"
          eyebrow="Getting there"
          title={`How to reach ${seo.city || seo.state || ""}`.trim()}
        >
          <SeoRichText content={seo.howToReach} />
        </SectionShell>
      )}

      {seo.travelTips && (
        <SectionShell id="seo-travel-tips" eyebrow="Good to know" title="Travel tips">
          {isHtmlContent(seo.travelTips) ? (
            <SeoRichText content={seo.travelTips} />
          ) : (
            <PlainTipsList text={seo.travelTips} />
          )}
        </SectionShell>
      )}

      {faqs.length > 0 && (
        <SectionShell id="seo-faqs" eyebrow="Questions" title="Frequently asked questions">
          <div className="divide-y divide-border rounded-2xl border border-border">
            {faqs.map((faq, i) => (
              <details key={faq._id || i} className="group px-5 py-1">
                <summary className="cursor-pointer list-none py-4 text-sm font-bold text-foreground marker:content-none sm:text-base">
                  <span className="flex items-start justify-between gap-4">
                    {faq.question}
                    <span className="mt-1 shrink-0 text-brand transition group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <div className="pb-4">
                  <SeoRichText content={faq.answer} />
                </div>
              </details>
            ))}
          </div>
        </SectionShell>
      )}
    </div>
  );
}
