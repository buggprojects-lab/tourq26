import { makeHubPage } from "@/components/cms/EntityHubPage";

const hub = makeHubPage({
  kind: "INDUSTRY",
  title: "Industries",
  description:
    "Domain-aware software delivery for healthcare, fintech, retail, manufacturing, and more.",
  eyebrow: "INDUSTRIES",
});

export const generateMetadata = hub.generateMetadata;
export default hub.Page;
