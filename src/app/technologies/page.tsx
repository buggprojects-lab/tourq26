import { makeHubPage } from "@/components/cms/EntityHubPage";

const hub = makeHubPage({
  kind: "TECHNOLOGY",
  title: "Technologies",
  description:
    "The stacks we ship with — React, Next.js, Node, Python, cloud, and modern AI tooling.",
  eyebrow: "TECHNOLOGIES",
});

export const generateMetadata = hub.generateMetadata;
export default hub.Page;
