import { makeHubPage } from "@/components/cms/EntityHubPage";

const hub = makeHubPage({
  kind: "SOLUTION",
  title: "Solutions",
  description:
    "Product and platform builds — CRM, ERP, marketplaces, AI assistants, and internal tools — engineered for production.",
  eyebrow: "SOLUTIONS",
});

export const generateMetadata = hub.generateMetadata;
export default hub.Page;
