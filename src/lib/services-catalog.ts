import { prisma, withDbTimeout } from "@/lib/db";
import { servicePages } from "@/data/services-content";

export type ServiceCatalogCard = {
  slug: string;
  title: string;
  description: string;
  icon: string | null;
  category: string | null;
};

const FALLBACK_ICON: Record<string, string> = {
  "mobile-app-development": "/images/icons/mobile.svg",
  "web-development": "/images/icons/web.svg",
  "ai-solutions": "/images/icons/ai.svg",
  "remote-it": "/images/icons/team.svg",
  "technical-consulting": "/images/icons/web.svg",
};

const FALLBACK_CATEGORY: Record<string, string> = {
  "mobile-app-development": "MOBILE",
  "web-development": "WEB / API",
  "ai-solutions": "AI",
  "remote-it": "REMOTE IT",
  "technical-consulting": "CONSULTING",
};

function staticCatalog(): ServiceCatalogCard[] {
  return servicePages.map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    icon: FALLBACK_ICON[p.slug] ?? null,
    category: FALLBACK_CATEGORY[p.slug] ?? null,
  }));
}

/**
 * Cards for the /services index. Prefers the Service entity table (Admin → CMS → Entities)
 * so newly added services show up automatically, but only lists entities that actually
 * resolve to a page — either a published CMS page or a static fallback slug — so nothing
 * links to a 404. Falls back to the static catalog entirely if no entity resolves or the
 * DB is unavailable.
 */
export async function getServiceCatalogCards(): Promise<ServiceCatalogCard[]> {
  try {
    const rows = await withDbTimeout(
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    );
    if (rows.length === 0) return staticCatalog();

    const pageIds = rows.map((r) => r.pageId).filter((id): id is string => Boolean(id));
    const publishedPages = pageIds.length
      ? await withDbTimeout(
          prisma.page.findMany({
            where: { id: { in: pageIds }, status: "PUBLISHED" },
            select: { id: true },
          }),
        )
      : [];
    const publishedPageIds = new Set(publishedPages.map((p) => p.id));
    const staticSlugs = new Set(servicePages.map((p) => p.slug));

    const cards = rows
      .filter((r) => (r.pageId && publishedPageIds.has(r.pageId)) || staticSlugs.has(r.slug))
      .map((r) => ({
        slug: r.slug,
        title: r.name,
        description: r.summary || r.description || "",
        icon: r.icon || FALLBACK_ICON[r.slug] || null,
        category: r.category || FALLBACK_CATEGORY[r.slug] || null,
      }));

    return cards.length > 0 ? cards : staticCatalog();
  } catch {
    return staticCatalog();
  }
}
