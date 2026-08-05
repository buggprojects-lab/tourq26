import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { listPages } from "@/lib/cms/pages";
import { AdminPageHeader } from "../../AdminPageHeader";

export default async function AdminCmsPagesPage() {
  const ok = await isAdmin();
  if (!ok) redirect("/admin");

  let pages: Awaited<ReturnType<typeof listPages>> = [];
  let dbError: string | null = null;
  try {
    pages = await listPages();
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Database unavailable";
  }

  return (
    <div>
      <AdminPageHeader
        crumbs={[
          { label: "Admin", href: "/admin/dashboard" },
          { label: "CMS Pages" },
        ]}
        title="CMS Pages"
        description="Modular pages composed from reusable blocks. Publish triggers ISR revalidation."
        actions={
          <Link href="/admin/cms/pages/new" className="btn-base btn-primary">
            New page
          </Link>
        }
      />

      {dbError ? (
        <p className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900">
          MongoDB not ready: {dbError}. Set <code>DATABASE_URL</code> and run{" "}
          <code>npx prisma db push</code> then <code>npm run db:seed:cms</code>.
        </p>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-md border border-border/60">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/40">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Path</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-muted-foreground">
                  No CMS pages yet. Create one or seed entities.
                </td>
              </tr>
            ) : (
              pages.map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/cms/pages/${p.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {p.path}
                  </td>
                  <td className="px-4 py-3">{p.type}</td>
                  <td className="px-4 py-3">{p.status}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.updatedAt.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
