import Header from "@/components/Header";
import { getResolvedFeatureFlags } from "@/lib/feature-flags";
import { readPrimaryNav } from "@/lib/nav-content";

export default async function MarketingHeader() {
  const [f, navLinks] = await Promise.all([getResolvedFeatureFlags(), readPrimaryNav()]);
  return <Header navLinks={navLinks} navFlags={{ showTools: f.nav_tools }} />;
}
