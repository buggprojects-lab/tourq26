import Header from "@/components/Header";
import { getResolvedFeatureFlags } from "@/lib/feature-flags";
import { readPrimaryNav } from "@/lib/nav-content";
import { readBrandContent } from "@/lib/brand-content";

export default async function MarketingHeader() {
  const [f, navLinks, brand] = await Promise.all([
    getResolvedFeatureFlags(),
    readPrimaryNav(),
    readBrandContent(),
  ]);
  return <Header navLinks={navLinks} navFlags={{ showTools: f.nav_tools }} logoUrl={brand.logoUrl} />;
}
