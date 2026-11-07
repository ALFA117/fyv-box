import type { MetadataRoute } from "next";
import { loadCatalog } from "@/missions/engine";
import { siteUrl } from "@/lib/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = siteUrl();
  const now = new Date();
  return [
    { url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${url}/verify`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...loadCatalog()
      .filter((m) => !m.comingSoon)
      .map((m) => ({
        url: `${url}/mission/${m.id}`,
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
  ];
}
