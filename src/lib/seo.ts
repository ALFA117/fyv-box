import type { Metadata } from "next";
import { BRAND } from "./brand";

const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${BRAND.name} — ${BRAND.tagline}`,
};

/**
 * Next replaces (does not merge) `openGraph` / `twitter` objects from parent
 * layouts, so every page builds the complete set here to keep image and card.
 */
export function pageMetadata(p: {
  title: string;
  description: string;
  path: string;
  shareTitle?: string;
  index?: boolean;
}): Metadata {
  const shareTitle = p.shareTitle ?? `${p.title} · ${BRAND.name}`;
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: p.path },
    robots: p.index === false ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      locale: "es_MX",
      siteName: BRAND.name,
      url: p.path,
      title: shareTitle,
      description: p.description,
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: p.description,
      images: [OG_IMAGE.url],
    },
  };
}
