import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readSiteContent } from "@/lib/content";
import { createDefaultBlock } from "@/lib/cms/blocks";
import { AdminPageHeader } from "../../../AdminPageHeader";
import { PageEditor } from "@/components/admin/cms/PageEditor";

export default async function AdminCmsNewPage() {
  const ok = await isAdmin();
  if (!ok) redirect("/admin");

  const site = await readSiteContent();

  return (
    <div>
      <AdminPageHeader
        crumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "CMS Pages", href: "/admin/cms/pages" },
          { label: "New" },
        ]}
        title="New CMS page"
        description="Start from blocks. SEO and content brief fields are required before publish for money pages."
      />
      <div className="mt-8">
        <PageEditor
          mode="create"
          siteUrl={site.siteUrl}
          siteName={site.siteName}
          initial={{
            title: "",
            slug: "",
            type: "SERVICE",
            status: "DRAFT",
            path: "",
            excerpt: "",
            blocks: [createDefaultBlock("hero"), createDefaultBlock("cta")],
            seo: {
              metaTitle: "",
              metaDescription: "",
              focusKeyword: "",
              robotsIndex: true,
              robotsFollow: true,
            },
            brief: {
              targetKeyword: "",
              secondaryKeywords: "",
            },
          }}
        />
      </div>
    </div>
  );
}
