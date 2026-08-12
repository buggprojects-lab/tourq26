import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { readBrandContent } from "@/lib/brand-content";
import { BrandForm } from "./BrandForm";
import { AdminPageHeader } from "../AdminPageHeader";

export default async function AdminBrandPage() {
  const ok = await isAdmin();
  if (!ok) redirect("/admin");

  const data = await readBrandContent();

  return (
    <div>
      <AdminPageHeader
        crumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "Brand" },
        ]}
        title="Brand"
        description="Logo, favicon, brand colors, typography, and the brand voice used by every AI-generate button in this admin."
      />
      <BrandForm initialData={data} />
    </div>
  );
}
