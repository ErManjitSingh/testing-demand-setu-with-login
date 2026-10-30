import { cache } from "react";
import { buildApiUrl } from "@/lib/apiConfig";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { plainSeoText, sanitizeSeoHtml } from "@/lib/seoListingApi";
import { THEME_BY_ID } from "@/lib/tourPackageMeta";

/**
 * Admin-managed content for the packages home page (`/api/package-home/get`).
 *
 * Rules that keep the home page safe:
 *  - Any failure (network, bad data, inactive page) returns `null`, and the home
 *    page then renders exactly what it rendered before this API existed.
 *  - Every value is validated here once, so components never receive anything
 *    that could crash rendering (unknown image hosts, bad links, empty lists).
 */

const REVALIDATE_SECONDS = 300;

/** Must stay in sync with `images.remotePatterns` in next.config.mjs. */
const ALLOWED_IMAGE_HOSTS = new Set([
  "www.demandsetutours.com",
  "images.unsplash.com",
  "images.pexels.com",
  "firebasestorage.googleapis.com",
  "packagemaker-image.firebasestorage.app",
  "encrypted-tbn0.gstatic.com",
  "lh3.googleusercontent.com",
]);

/** Section types the home page knows how to render. */
const RENDERABLE_TYPES = new Set([
  "announcement",
  "theme",
  "content",
  "state",
  "city",
  "country",
  "whyChoose",
  "testimonial",
  "cta",
  "faq",
  "seoContent",
]);

/** Sections that already existed on the page before the admin config. */
const LEGACY_TYPES = ["theme", "state", "city", "country", "faq"];

/** Default top-to-bottom order of the admin-controlled part of the page. */
const DEFAULT_SEQUENCE = ["theme", "state", "city", "country", "tail", "faq"];

const text = (value) => (value === undefined || value === null ? "" : String(value).trim());

/** Returns the URL only when next/image is allowed to load it, otherwise "". */
export function safeImageUrl(value) {
  const raw = text(value);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    return ALLOWED_IMAGE_HOSTS.has(url.hostname) ? url.toString() : "";
  } catch {
    return "";
  }
}

/** Allows site-relative paths, http(s), tel: and mailto: links only. */
export function safeLink(value) {
  const raw = text(value);
  if (!raw) return "";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  if (/^(https?:|tel:|mailto:)/i.test(raw)) return raw;
  return "";
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function initials(name) {
  return (
    text(name)
      .split(/\s+|&/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "DS"
  );
}

function normalizePlaceItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => ({
      name: text(item?.name),
      slug: text(item?.slug),
      image: safeImageUrl(item?.image),
      tagline: text(item?.tagline),
      fromPrice: numberOrNull(item?.fromPrice),
      featured: Boolean(item?.featured),
    }))
    .filter((item) => item.name);
}

function normalizeSection(raw, themeNames) {
  const base = {
    id: text(raw.id) || `${raw.type}-${raw.position}`,
    type: raw.type,
    title: text(raw.title),
  };

  switch (raw.type) {
    case "announcement": {
      const values = raw.values ?? {};
      const message = text(values.text);
      if (!message) return null;
      return {
        ...base,
        text: message,
        linkText: text(values.linkText),
        linkUrl: safeLink(values.linkUrl),
      };
    }

    case "state":
    case "city":
    case "country": {
      const items = normalizePlaceItems(raw.items);
      if (!items.length) return null;
      return { ...base, items, maxVisible: Math.max(0, Number(raw.maxVisible) || 0) };
    }

    case "theme": {
      // Only themes the listing page can filter by (slug = theme id) are kept
      const items = (Array.isArray(raw.items) ? raw.items : [])
        .map((item) => ({
          id: text(item?.slug),
          label: text(item?.name) || THEME_BY_ID[text(item?.slug)]?.label || "",
          image: safeImageUrl(item?.image),
        }))
        .filter((item) => item.id && THEME_BY_ID[item.id] && item.label);
      if (!items.length) return null;
      return { ...base, items };
    }

    case "content": {
      const html = sanitizeSeoHtml(raw.content);
      const themeId = text(raw.themeSlug);
      if (!html || !plainSeoText(html)) return null;
      return {
        ...base,
        themeId: THEME_BY_ID[themeId] ? themeId : "",
        themeLabel: themeNames[themeId] || THEME_BY_ID[themeId]?.label || "",
        html,
        image: safeImageUrl(raw.image),
      };
    }

    case "whyChoose": {
      const items = (Array.isArray(raw.items) ? raw.items : [])
        .map((item) => ({ title: text(item?.title), description: plainSeoText(item?.description) }))
        .filter((item) => item.title);
      if (!items.length) return null;
      return { ...base, items };
    }

    case "testimonial": {
      const items = (Array.isArray(raw.items) ? raw.items : [])
        .map((item) => ({
          name: text(item?.name),
          location: text(item?.location),
          rating: Math.min(5, Math.max(1, Math.round(Number(item?.rating) || 5))),
          text: plainSeoText(item?.review),
          avatar: initials(item?.name),
        }))
        .filter((item) => item.name && item.text);
      if (!items.length) return null;
      return { ...base, items };
    }

    case "cta": {
      const values = raw.values ?? {};
      const heading = text(values.heading);
      if (!heading) return null;
      return {
        ...base,
        heading,
        description: plainSeoText(values.subHeading),
        buttonText: text(values.buttonText),
        buttonLink: safeLink(values.buttonLink),
        phone: text(values.phone),
        image: safeImageUrl(values.image),
      };
    }

    case "faq": {
      const items = (Array.isArray(raw.faqs) ? raw.faqs : [])
        .map((faq) => ({ q: text(faq?.question), html: sanitizeSeoHtml(faq?.answer) }))
        .filter((faq) => faq.q && faq.html);
      if (!items.length) return null;
      return { ...base, items };
    }

    case "seoContent": {
      const html = sanitizeSeoHtml(raw.values?.content);
      if (!html || !plainSeoText(html)) return null;
      return { ...base, html };
    }

    default:
      return null;
  }
}

function normalizeHeader(raw) {
  if (!raw) return null;
  const heading = text(raw.heading);
  const description = plainSeoText(raw.subHeading);
  const poster =
    (Array.isArray(raw.images) ? raw.images : [])
      .map((image) => safeImageUrl(image?.url))
      .find(Boolean) || "";

  if (!heading && !description && !poster) return null;
  return { heading, description, poster };
}

function normalizeStats(raw) {
  if (!raw) return null;
  const items = (Array.isArray(raw.items) ? raw.items : [])
    .map((item) => ({ value: text(item?.value), label: text(item?.label) }))
    .filter((item) => item.value && item.label)
    .slice(0, 4);
  return items.length ? items : null;
}

export function normalizePackageHome(doc) {
  if (!doc || doc.isActive === false || !Array.isArray(doc.sections)) return null;

  const rawSections = doc.sections
    .filter((section) => section && typeof section === "object")
    .slice()
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  // Types the admin switched off on purpose: they must stay hidden
  const hidden = new Set(rawSections.filter((s) => s.enabled === false).map((s) => s.type));
  const visible = rawSections.filter((s) => s.enabled !== false && s.hasContent !== false);

  const themeSection = visible.find((s) => s.type === "theme");
  const themeNames = Object.fromEntries(
    (themeSection?.items ?? []).map((item) => [text(item?.slug), text(item?.name)])
  );

  const sections = visible
    .filter((s) => RENDERABLE_TYPES.has(s.type) && s.type !== "announcement")
    .map((s) => normalizeSection(s, themeNames))
    .filter(Boolean);

  const announcement = normalizeSection(
    visible.find((s) => s.type === "announcement") ?? { type: "announcement" },
    themeNames
  );

  const seo = doc.seo ?? {};

  return {
    seo: {
      title: text(seo.metaTitle),
      description: plainSeoText(seo.metaDescription),
      keywords: text(seo.metaKeywords),
      canonical: safeLink(seo.canonicalTag),
    },
    header: normalizeHeader(visible.find((s) => s.type === "header")),
    stats: normalizeStats(visible.find((s) => s.type === "stats")),
    announcement,
    sections,
    hidden: [...hidden],
  };
}

/** Cached per request. Returns the normalised config, or null when unavailable. */
export const fetchPackageHomeConfig = cache(async () => {
  try {
    const response = await fetchWithTimeout(buildApiUrl("api/package-home/get"), {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;

    const payload = await response.json();
    if (!payload?.success) return null;

    return normalizePackageHome(payload.data);
  } catch {
    return null;
  }
});

/**
 * Final top-to-bottom list of blocks for the admin-controlled part of the home
 * page. `section` is the admin data, or null when the block should use the
 * content that is built into the website (the original page).
 *
 * Existing blocks (themes, states, cities, countries, FAQ) fall back to the
 * built-in content when the admin left them empty, unless the admin switched
 * them off. The "tail" block (all packages, how it works, promo banner) is
 * website-only and always follows the last destination block.
 */
export function resolveHomeBlocks(config) {
  if (!config) {
    return DEFAULT_SEQUENCE.map((type) => ({ key: type, type, section: null }));
  }

  const blocks = config.sections.map((section) => ({ key: section.id, type: section.type, section }));

  for (const type of LEGACY_TYPES) {
    if (blocks.some((block) => block.type === type) || config.hidden.includes(type)) continue;

    const position = DEFAULT_SEQUENCE.indexOf(type);
    const before = DEFAULT_SEQUENCE.slice(0, position);
    const after = DEFAULT_SEQUENCE.slice(position + 1);

    let index = blocks.length;
    const lastBefore = blocks.map((b) => before.includes(b.type)).lastIndexOf(true);
    if (lastBefore !== -1) {
      index = lastBefore + 1;
    } else {
      const firstAfter = blocks.findIndex((b) => after.includes(b.type));
      if (firstAfter !== -1) index = firstAfter;
    }
    blocks.splice(index, 0, { key: type, type, section: null });
  }

  const destinations = ["theme", "state", "city", "country"];
  const lastDestination = blocks.map((b) => destinations.includes(b.type)).lastIndexOf(true);
  const faqIndex = blocks.findIndex((b) => b.type === "faq");
  const tailIndex = lastDestination !== -1 ? lastDestination + 1 : faqIndex !== -1 ? faqIndex : blocks.length;
  blocks.splice(tailIndex, 0, { key: "tail", type: "tail", section: null });

  return blocks;
}
