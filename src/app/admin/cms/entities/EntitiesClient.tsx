"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type EntityRow = {
  id: string;
  slug: string;
  name: string;
  pageId?: string | null;
  summary?: string | null;
  category?: string | null;
};

export function EntitiesClient({
  initial,
}: {
  initial: {
    services: EntityRow[];
    solutions: EntityRow[];
    industries: EntityRow[];
    technologies: EntityRow[];
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<
    "services" | "solutions" | "industries" | "technologies"
  >("services");

  async function seed() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cms/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Seed failed");
      setMessage(
        `Seeded ${data.counts.services} services, ${data.counts.solutions} solutions, ${data.counts.industries} industries, ${data.counts.technologies} technologies.`,
      );
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Seed failed");
    } finally {
      setBusy(false);
    }
  }

  async function ensurePage(
    kind: "SERVICE" | "SOLUTION" | "INDUSTRY" | "TECHNOLOGY",
    slug: string,
  ) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/cms/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ensure-page", kind, slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage(`Page ready: ${data.path}`);
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  const rows =
    tab === "services"
      ? initial.services
      : tab === "solutions"
        ? initial.solutions
        : tab === "industries"
          ? initial.industries
          : initial.technologies;

  const kindMap = {
    services: "SERVICE",
    solutions: "SOLUTION",
    industries: "INDUSTRY",
    technologies: "TECHNOLOGY",
  } as const;

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn-base btn-primary"
          disabled={busy}
          onClick={() => void seed()}
        >
          {busy ? "Working…" : "Seed IA entities"}
        </button>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["services", "Services"],
            ["solutions", "Solutions"],
            ["industries", "Industries"],
            ["technologies", "Technologies"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`btn-base ${tab === id ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTab(id)}
          >
            {label} ({initial[id].length})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-md border border-border/60">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border/60 bg-muted/40">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Page</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/40 last:border-0">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {row.slug}
                </td>
                <td className="px-4 py-3">
                  {row.pageId ? (
                    <Link
                      href={`/admin/cms/pages/${row.pageId}`}
                      className="text-foreground underline"
                    >
                      Edit page
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!row.pageId ? (
                    <button
                      type="button"
                      className="btn-base btn-secondary !px-2 !py-1 text-xs"
                      disabled={busy}
                      onClick={() => void ensurePage(kindMap[tab], row.slug)}
                    >
                      Create page
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
