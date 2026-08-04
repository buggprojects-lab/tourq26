import type { Metadata } from "next";
import { CmsEntityPage, cmsPageMetadata } from "@/components/cms/CmsEntityPage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return cmsPageMetadata(`/technologies/${slug}`);
}

export default async function TechnologyPage({ params }: Props) {
  const { slug } = await params;
  return <CmsEntityPage path={`/technologies/${slug}`} />;
}
