function safeJsonLd(schema) {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

/** JSON-LD for SEO listing pages (FAQ + destination). */
export default function ListingsSeoSchema({ seo }) {
  if (!seo) return null;

  const scripts = [];

  if (seo.enableFaqSchema && Array.isArray(seo.faqs) && seo.faqs.length > 0) {
    scripts.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: seo.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  if (seo.enablePageSchema) {
    const placeName = seo.city || seo.state || seo.focusKeyword || seo.heading;
    scripts.push({
      "@context": "https://schema.org",
      "@type": seo.schemaType || "TouristDestination",
      name: placeName,
      description: seo.metaDescription || seo.subHeading || undefined,
      containedInPlace: seo.state
        ? { "@type": "AdministrativeArea", name: seo.state, containedInPlace: { "@type": "Country", name: seo.country || "India" } }
        : { "@type": "Country", name: seo.country || "India" },
      ...(seo.latitude && seo.longitude
        ? { geo: { "@type": "GeoCoordinates", latitude: seo.latitude, longitude: seo.longitude } }
        : {}),
    });
  }

  if (scripts.length === 0) return null;

  return (
    <>
      {scripts.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
        />
      ))}
    </>
  );
}
