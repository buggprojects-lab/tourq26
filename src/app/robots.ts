import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { readSiteContent } from "@/lib/content";

/**
 * Crawl policy for Torq Studio.
 * Public CMS pages (/services, /solutions, /industries, /technologies, …) are allowed.
 * Admin + API stay disallowed. Sitemap lists only indexable published URLs.
 * `robotsNoIndex` (Admin → Brand & SEO) blocks the whole site — for staging/preview deploys.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = (await getSiteUrl()).replace(/\/$/, "");
  const site = await readSiteContent();

  if (site.robotsNoIndex) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

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
