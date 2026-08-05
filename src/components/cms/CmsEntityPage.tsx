import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MarketingHeader from "@/components/MarketingHeader";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { BlockRenderer } from "@/components/cms/BlockRenderer";
import { getPublishedPageByPath, getPageBlocks } from "@/lib/cms/pages";
import { buildPageJsonLd, buildPageMetadata } from "@/lib/cms/metadata";
import { getSiteUrl } from "@/lib/site-url";

export async function cmsPageMetadata(path: string): Promise<Metadata> {
  const siteUrl = await getSiteUrl();
  try {
    const page = await getPublishedPageByPath(path);
    if (page) return buildPageMetadata(page, siteUrl);
  } catch {
    /* DB down */
  }
  return { title: "Not found", robots: { index: false, follow: false } };
}

export async function CmsEntityPage({ path }: { path: string }) {
  let page = null;
  try {
    page = await getPublishedPageByPath(path);
  } catch {
    notFound();
  }
  if (!page) notFound();

  const siteUrl = await getSiteUrl();
  const schemas = buildPageJsonLd(page, siteUrl);
  const blocks = getPageBlocks(page);

  return (
    <div className="min-h-screen bg-background">
      {schemas.map((data, i) => (
        <JsonLd key={i} data={data} />
      ))}
      <MarketingHeader />
      <main>
        <BlockRenderer blocks={blocks} />
      </main>
      <Footer />
    </div>
  );
}
