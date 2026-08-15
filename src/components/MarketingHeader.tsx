import Header from "@/components/Header";
import { getResolvedFeatureFlags } from "@/lib/feature-flags";
import { readPrimaryNav, readNavMegaMenus } from "@/lib/nav-content";
import { readBrandContent } from "@/lib/brand-content";

export default async function MarketingHeader() {
  const [f, navLinks, megaMenus, brand] = await Promise.all([
    getResolvedFeatureFlags(),
    readPrimaryNav(),
    readNavMegaMenus(),
    readBrandContent(),
  ]);
  return (
    <Header
      navLinks={navLinks}
      megaMenus={megaMenus}
      navFlags={{ showTools: f.nav_tools }}
      logoUrl={brand.logoUrl}
    />
  );
}
