"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsEmbedUrl,
  buildPropertyMapSearchQuery,
} from "@/lib/propertyMap";

export default function PropertyLocationMap({
  propertyName,
  address,
  className = "",
}) {
  const mapQuery = buildPropertyMapSearchQuery(propertyName, address);
  const containerRef = useRef(null);
  const [shouldLoadMap, setShouldLoadMap] = useState(false);

  useEffect(() => {
    if (!mapQuery || shouldLoadMap) return;

    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoadMap(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoadMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [mapQuery, shouldLoadMap]);

  if (!mapQuery) {
    return (
      <div
        className={`flex h-48 items-center justify-center rounded-sm border border-[#e8e8e8] bg-[#f8f8f8] sm:h-56 ${className}`}
      >
        <p className="px-4 text-center text-sm text-[#757575]">
          Map unavailable for this property.
        </p>
      </div>
    );
  }

  const embedUrl = buildGoogleMapsEmbedUrl(
    mapQuery,
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY
  );
  const directionsUrl = buildGoogleMapsDirectionsUrl(mapQuery);

  return (
    <div ref={containerRef} className={className}>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-[#e8e8e8] bg-[#f8f8f8] sm:aspect-[21/9]">
        {shouldLoadMap ? (
          <iframe
            title={`Map for ${propertyName || "property"}`}
            src={embedUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm font-medium text-[#757575]">Loading map…</p>
          </div>
        )}
      </div>

      {directionsUrl ? (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          Open in Google Maps
          <span aria-hidden>↗</span>
        </a>
      ) : null}
    </div>
  );
}
