"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * next/image with a graceful fallback: if the source fails to load (dead link, blocked, offline),
 * swap to `fallback` instead of showing a broken-image icon.
 */
export default function SafeImage({ src, fallback, alt, ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const showFallback = Boolean(fallback) && failedSrc === src;

  return <Image {...props} src={showFallback ? fallback : src} alt={alt} onError={() => setFailedSrc(src)} />;
}
