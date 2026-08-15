import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Crawl policy for Torq Studio.
 * Public CMS pages (/services, /solutions, /industries, /technologies, …) are allowed.
 * Admin + API stay disallowed. Sitemap lists only indexable published URLs.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = (await getSiteUrl()).replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
