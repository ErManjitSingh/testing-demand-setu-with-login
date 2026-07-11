import { cache } from "react";
import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { inferLocationType } from "@/lib/logSearchSelection";

const SEO_HTML_SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "span",
  ],
  ALLOWED_ATTR: ["href", "title", "class", "target", "rel"],
};

const BLOCKED_TAG_RE =
  /<\s*(script|iframe|object|embed|form|input|button|style|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi;
const VOID_BLOCKED_TAG_RE =
  /<\s*(script|iframe|object|embed|form|input|button|style|link|meta)[^>]*\/?>/gi;

/** Build `/api/seo-listing/:category/:locationType/:stateOrCity` from listings search. */
export function buildSeoListingApiPath({ category, city = "", state = "", locationKind = null }) {
  const cat = String(category || "").trim();
  if (!cat || cat === "all") return null;

  const locationType = inferLocationType({ city, state, locationKind });
  if (locationType !== "state" && locationType !== "city") return null;

  const trimmedCity = String(city || "").trim();
  const trimmedState = String(state || "").trim();
  const location =
    locationType === "state"
      ? trimmedState || trimmedCity
      : trimmedCity || trimmedState;

  if (!location) return null;

  return `api/seo-listing/${encodeURIComponent(cat)}/${encodeURIComponent(locationType)}/${encodeURIComponent(location)}`;
}

export async function fetchSeoListingData(search) {
  const path = buildSeoListingApiPath(search);
  if (!path) return null;

  const response = await fetchWithTimeout(buildApiUrl(path), {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new Error(`SEO listing fetch failed (${response.status})`);
  }

  return response.json();
}

/** Cached server fetch — returns `data[0]` when present. */
export const fetchSeoListingRecord = cache(async (category, city, state, locationKind) => {
  try {
    const payload = await fetchSeoListingData({
      category,
      city,
      state,
      locationKind,
    });
    if (!payload?.success || !Array.isArray(payload.data) || payload.data.length === 0) {
      return null;
    }
    return payload.data[0];
  } catch {
    return null;
  }
});

/** Decode entity-encoded CMS HTML and trim whitespace. */
export function normalizeSeoRichText(text) {
  let value = String(text || "").trim();
  if (!value) return "";

  if (/&lt;[a-z]/i.test(value) || /&amp;lt;/i.test(value)) {
    value = value
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/gi, "'");
  }

  return value;
}

export function isHtmlContent(text) {
  const value = normalizeSeoRichText(text);
  return /<\/?[a-z][^>]*>/i.test(value);
}

/** Plain text for one-line UI (hero subtitles, meta fallbacks). */
export function plainSeoText(text) {
  const value = normalizeSeoRichText(text);
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Clean Quill HTML and normalize list markup for display. */
export function prepareSeoHtml(html) {
  let value = normalizeSeoRichText(html);
  if (!value) return "";

  value = value.replace(/<span class="ql-ui"[^>]*>\s*<\/span>/gi, "");

  // Quill bullet lists use <ol><li data-list="bullet"> — render as a real unordered list.
  if (/<ol[^>]*>[\s\S]*<li[^>]*data-list="bullet"/i.test(value)) {
    value = value
      .replace(/<ol([^>]*)>/gi, "<ul$1>")
      .replace(/<\/ol>/gi, "</ul>")
      .replace(/\s*data-list="bullet"/gi, "");
  }

  return value;
}

/** Strip unsafe markup without jsdom (serverless-safe on Vercel). */
export function sanitizeSeoHtml(html) {
  const prepared = prepareSeoHtml(html);
  if (!prepared) return "";

  const allowedTags = new Set(
    SEO_HTML_SANITIZE_OPTIONS.ALLOWED_TAGS.map((tag) => tag.toLowerCase())
  );
  const allowedAttrs = new Set(
    SEO_HTML_SANITIZE_OPTIONS.ALLOWED_ATTR.map((attr) => attr.toLowerCase())
  );

  let value = prepared
    .replace(BLOCKED_TAG_RE, "")
    .replace(VOID_BLOCKED_TAG_RE, "")
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"');

  value = value.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tagName) => {
    const tag = String(tagName || "").toLowerCase();
    if (!allowedTags.has(tag)) return "";
    if (match.startsWith("</")) return `</${tag}>`;

    const attrs = [];
    const attrPattern = /([a-z][a-z0-9-]*)\s*=\s*("([^"]*)"|'([^']*)')/gi;
    let attrMatch;
    while ((attrMatch = attrPattern.exec(match)) !== null) {
      const name = attrMatch[1].toLowerCase();
      if (!allowedAttrs.has(name)) continue;
      const rawValue = attrMatch[3] ?? attrMatch[4] ?? "";
      const safeValue = name === "href" && /^javascript:/i.test(rawValue) ? "#" : rawValue;
      attrs.push(`${name}="${safeValue}"`);
    }

    return attrs.length > 0 ? `<${tag} ${attrs.join(" ")}>` : `<${tag}>`;
  });

  return value;
}

export function seoTagsFromRecord(seo) {
  if (!seo || !Array.isArray(seo.tags)) return [];
  return seo.tags.map((tag) => String(tag || "").trim()).filter(Boolean);
}

export function seoMetadataFromRecord(seo) {
  if (!seo) return null;
  const tags = seoTagsFromRecord(seo);
  const keywords =
    seo.metaKeywords ||
    (tags.length > 0 ? tags.join(", ") : null);

  return {
    title: seo.metaTitle || seo.heading || null,
    description: seo.metaDescription || seo.subHeading || null,
    keywords,
    robots: seo.robotsMeta || null,
    alternates: seo.canonicalTag ? { canonical: seo.canonicalTag } : undefined,
  };
}

export function splitSeoParagraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}
