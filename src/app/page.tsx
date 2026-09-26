import type { Metadata } from "next";
import { loadCatalog } from "@/missions/engine";
import { TrackMeta, type Mission } from "@/missions/schema";
import { BRAND, siteUrl } from "@/lib/brand";
import { pageMetadata } from "@/lib/seo";
import { LandingClient } from "./LandingClient";

export const metadata: Metadata = {
  ...pageMetadata({
    title: BRAND.tagline,
    shareTitle: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    path: "/",
  }),
  title: { absolute: `${BRAND.name} — ${BRAND.tagline}` },
};

export default function HomePage() {
  const catalog = loadCatalog().filter((m) => !m.comingSoon);
  const trackCounts = Object.fromEntries(
    (Object.keys(TrackMeta) as Mission["track"][]).map((t) => [t, catalog.filter((m) => m.track === t).length]),
  ) as Record<Mission["track"], number>;

  const url = siteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: BRAND.name,
        description: BRAND.description,
        inLanguage: "es",
      },
      {
        "@type": "Course",
        "@id": `${url}/#course`,
        name: "FYV Box — entrenamiento anti-estafas crypto",
        description: BRAND.description,
        inLanguage: "es",
        url,
        isAccessibleForFree: true,
        provider: { "@type": "Organization", name: "CriptoUNAM", url },
        hasPart: (Object.keys(TrackMeta) as Mission["track"][]).map((t) => ({
          "@type": "Course",
          name: TrackMeta[t].label,
          description: TrackMeta[t].description,
        })),
        offers: { "@type": "Offer", price: 0, priceCurrency: "USD", category: "Free" },
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT2H" },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <LandingClient missionCount={catalog.length} trackCounts={trackCounts} />
    </>
  );
}
