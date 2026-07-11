export default function LegalPageSections({ sections, lastUpdated = "July 2026" }) {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <p className="text-sm text-stone-500">Last updated: {lastUpdated}</p>
      {sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-xl font-bold text-stone-900">{section.title}</h2>
          {section.paragraphs?.length ? (
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-600">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}
          {section.list?.length ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-600">
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
