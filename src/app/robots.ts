import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const url = siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/dashboard", "/graduation"] }],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  };
}
