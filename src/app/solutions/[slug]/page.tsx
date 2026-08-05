import type { Metadata } from "next";
import { CmsEntityPage, cmsPageMetadata } from "@/components/cms/CmsEntityPage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return cmsPageMetadata(`/solutions/${slug}`);
}

export default async function SolutionPage({ params }: Props) {
  const { slug } = await params;
  return <CmsEntityPage path={`/solutions/${slug}`} />;
}
