import type { Metadata } from "next";
import type { PageWithSeo } from "@/lib/cms/pages";
import { getPageBlocks } from "@/lib/cms/pages";
import { faqPageJsonLd, webPageJsonLd, breadcrumbListJsonLd } from "@/lib/seo";

export function buildPageMetadata(
  page: PageWithSeo,
  siteUrl: string,
): Metadata {
  const seo = page.seo;
  const title = seo?.metaTitle || page.title;
  const description = seo?.metaDescription || page.excerpt || undefined;
  const canonical =
    seo?.canonical || `${siteUrl.replace(/\/$/, "")}${page.path}`;
  const index = seo?.robotsIndex ?? page.status === "PUBLISHED";
  const follow = seo?.robotsFollow ?? true;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: canonical,
      type: (seo?.ogType as "website") || "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seo?.twitterTitle || title,
      description: seo?.twitterDescription || description,
    },
    robots: { index, follow },
  };
}

export function buildPageJsonLd(page: PageWithSeo, siteUrl: string) {
  const blocks = getPageBlocks(page);
  const schemas: Record<string, unknown>[] = [];

  schemas.push(
    webPageJsonLd({
      siteUrl,
      path: page.path,
      name: page.seo?.metaTitle || page.title,
      description: page.seo?.metaDescription || page.excerpt || "",
    }),
  );

  const parts = page.path.split("/").filter(Boolean);
  const crumbs: { name: string; path: string }[] = [{ name: "Home", path: "/" }];
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    crumbs.push({
      name: page.seo?.breadcrumbLabel && acc === page.path
        ? page.seo.breadcrumbLabel
        : part.replace(/-/g, " "),
      path: acc,
    });
  }
  schemas.push(breadcrumbListJsonLd(siteUrl, crumbs));

  const faqBlock = blocks.find((b) => b.type === "faq");
  if (faqBlock && faqBlock.type === "faq") {
    schemas.push(faqPageJsonLd(faqBlock.items));
  }

  return schemas;
}
