import { redirect, notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readSiteContent } from "@/lib/content";
import { getPageById, getPageBlocks } from "@/lib/cms/pages";
import { AdminPageHeader } from "../../../AdminPageHeader";
import { PageEditor } from "@/components/admin/cms/PageEditor";

type Props = { params: Promise<{ id: string }> };

export default async function AdminCmsEditPage({ params }: Props) {
  const ok = await isAdmin();
  if (!ok) redirect("/admin");

  const { id } = await params;
  const page = await getPageById(id);
  if (!page) notFound();

  const blocks = getPageBlocks(page);
  const site = await readSiteContent();

  return (
    <div>
      <AdminPageHeader
        crumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "CMS Pages", href: "/admin/cms/pages" },
          { label: page.title },
        ]}
        title={page.title}
        description={`${page.type} · ${page.status} · ${page.path}`}
      />
      <div className="mt-8">
        <PageEditor
          mode="edit"
          pageId={page.id}
          siteUrl={site.siteUrl}
          siteName={site.siteName}
          initial={{
            title: page.title,
            slug: page.slug,
            type: page.type,
            status: page.status,
            path: page.path,
            excerpt: page.excerpt ?? "",
            blocks,
            seo: {
              metaTitle: page.seo?.metaTitle ?? "",
              metaDescription: page.seo?.metaDescription ?? "",
              focusKeyword: page.seo?.focusKeyword ?? "",
              robotsIndex: page.seo?.robotsIndex ?? true,
              robotsFollow: page.seo?.robotsFollow ?? true,
            },
            brief: {
              targetKeyword: page.brief?.targetKeyword ?? "",
              secondaryKeywords: (page.brief?.secondaryKeywords ?? []).join(", "),
            },
          }}
        />
      </div>
    </div>
  );
}
