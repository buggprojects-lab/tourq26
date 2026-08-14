import { prisma, withDbTimeout } from "@/lib/db";

export type NavLink = {
  label: string;
  href: string;
  openInNewTab: boolean;
};

const NAV_KEY = "primary";

/** Fallback used when the DB is empty/unavailable — `Header.tsx` renders whatever `readPrimaryNav()`
 *  returns, it has no separate hardcoded copy of its own. */
function getDefaultNavLinks(): NavLink[] {
  return [
    { label: "About", href: "/about", openInNewTab: false },
    { label: "Services", href: "/services", openInNewTab: false },
    { label: "Why Us", href: "/#why-us", openInNewTab: false },
    { label: "Blog", href: "/blog", openInNewTab: false },
    { label: "Freebies", href: "/freebies", openInNewTab: false },
    { label: "Testimonials", href: "/#testimonials", openInNewTab: false },
  ];
}

export async function readPrimaryNav(): Promise<NavLink[]> {
  let nav;
  try {
    nav = await withDbTimeout(
      prisma.navigation.findUnique({
        where: { key: NAV_KEY },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      }),
    );
  } catch {
    return getDefaultNavLinks();
  }
  if (!nav || nav.items.length === 0) return getDefaultNavLinks();
  return nav.items.map((i) => ({
    label: i.label,
    href: i.href ?? "",
    openInNewTab: i.openInNewTab,
  }));
}

export async function writePrimaryNav(links: NavLink[]): Promise<void> {
  const nav = await prisma.navigation.upsert({
    where: { key: NAV_KEY },
    create: { key: NAV_KEY, label: "Primary navigation" },
    update: {},
  });
  await prisma.$transaction([
    prisma.menuItem.deleteMany({ where: { navigationId: nav.id } }),
    ...links.map((link, i) =>
      prisma.menuItem.create({
        data: {
          navigationId: nav.id,
          label: link.label,
          href: link.href,
          openInNewTab: link.openInNewTab,
          sortOrder: i,
        },
      }),
    ),
  ]);
}
