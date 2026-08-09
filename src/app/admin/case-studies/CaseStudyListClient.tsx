"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CaseStudy } from "@/lib/case-studies-content";
import { CaseStudyListActions } from "./CaseStudyListActions";

function formatDate(s?: string) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function CaseStudyListClient({ items }: { items: CaseStudy[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.client.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="mono-label text-muted-foreground">{items.length} TOTAL</p>
        <div className="relative sm:w-72">
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            ⌕
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, slug, client, or industry…"
            className="text-input pl-8"
            aria-label="Search case studies"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card-flat mt-6 text-center text-muted-foreground">
          {items.length === 0
            ? "No case studies yet. Create the first one above."
            : "No case studies match your search."}
        </div>
      ) : (
        <div className="card-flat mt-6 overflow-hidden p-0">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="mono-label px-4 py-3 text-muted-foreground">Title</th>
                <th className="mono-label hidden px-4 py-3 text-muted-foreground md:table-cell">
                  Industry
                </th>
                <th className="mono-label hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  Date
                </th>
                <th className="mono-label px-4 py-3 text-right text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.slug}
                  className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/case-studies/${encodeURIComponent(c.slug)}/edit`}
                      className="block font-medium text-foreground hover:underline"
                    >
                      {c.title}
                    </Link>
                    <span className="mono-label text-muted-foreground">/{c.slug}</span>
                  </td>
                  <td className="hidden px-4 py-3 align-top text-[13px] text-muted-foreground md:table-cell">
                    {c.industry}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-[13px] text-muted-foreground sm:table-cell">
                    {formatDate(c.date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <CaseStudyListActions slug={c.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
