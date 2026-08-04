import type { Metadata } from "next";
import { CmsEntityPage, cmsPageMetadata } from "@/components/cms/CmsEntityPage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return cmsPageMetadata(`/industries/${slug}`);
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  return <CmsEntityPage path={`/industries/${slug}`} />;
}
