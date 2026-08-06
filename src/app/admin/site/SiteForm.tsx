"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteContent } from "@/lib/content";
import { SerpPreview } from "@/components/admin/SerpPreview";

function CharHint({ value, softMax, label }: { value: string; softMax: number; label: string }) {
  const n = value.length;
  const over = n > softMax;
  return (
    <span
      className={`mono-label tabular-nums ${
        over ? "text-[color:var(--app-destructive)]" : "text-muted-foreground"
      }`}
    >
      {label.toUpperCase()}: {n} / ~{softMax}
    </span>
  );
}

export function SiteForm({ initialData }: { initialData: SiteContent }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    setSuccess(false);
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setError("");
    setSuccess(false);
    setSaving(true);
    const res = await fetch("/api/admin/content/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Save failed");
      return;
    }
    setSuccess(true);
    router.refresh();
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="mt-8 max-w-2xl space-y-10">
      <SerpPreview
        siteUrl={data.siteUrl}
        path=""
        title={data.defaultTitle}
        description={data.defaultDescription}
      />

      <section className="card-flat space-y-4">
        <h2 className="font-display text-base font-semibold text-foreground">Site identity & URL</h2>
        <p className="text-sm text-muted-foreground">
          Canonical base URL and brand name used in metadata, JSON-LD, and templates.
        </p>
        <div>
          <label className="block text-sm font-medium text-foreground/90">Site URL</label>
          <input
            type="url"
            value={data.siteUrl}
            onChange={(e) => update("siteUrl", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground"
          />
        </div>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label className="text-sm font-medium text-foreground/90">Site name</label>
            <CharHint value={data.siteName} softMax={40} label="chars" />
          </div>
          <input
            type="text"
            value={data.siteName}
            onChange={(e) => update("siteName", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground"
          />
        </div>
      </section>

      <section className="card-flat space-y-4">
        <h2 className="display-sm text-foreground">Default page meta (home & fallbacks)</h2>
        <p className="text-sm text-muted-foreground">
          Used by the root layout for the homepage and as site-wide defaults. Aim for ~50–60 characters in the title and
          ~140–160 in the description for search snippets.
        </p>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label className="text-sm font-medium text-foreground/90">Default title</label>
            <CharHint value={data.defaultTitle} softMax={60} label="title" />
          </div>
          <input
            type="text"
            value={data.defaultTitle}
            onChange={(e) => update("defaultTitle", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground"
          />
        </div>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label className="text-sm font-medium text-foreground/90">Default meta description</label>
            <CharHint value={data.defaultDescription} softMax={160} label="description" />
          </div>
          <textarea
            value={data.defaultDescription}
            onChange={(e) => update("defaultDescription", e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/90">
            Title template (<code className="rounded bg-muted px-1 font-mono text-xs">%s</code> = page title segment)
          </label>
          <input
            type="text"
            value={data.titleTemplate}
            onChange={(e) => update("titleTemplate", e.target.value)}
            placeholder="%s | Torq Studio"
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 font-mono text-sm text-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Inner pages merge this with the root template so the final tab title is typically{" "}
            <span className="font-mono">page segment | Dev tools | site name</span> for dev tools.
          </p>
        </div>
      </section>

      <section className="card-flat space-y-4">
        <h2 className="display-sm text-foreground">Open Graph (Facebook, LinkedIn, etc.)</h2>
        <p className="text-sm text-muted-foreground">Shown when links are shared; can match defaults or be customized.</p>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label className="text-sm font-medium text-foreground/90">OG title</label>
            <CharHint value={data.ogTitle} softMax={60} label="title" />
          </div>
          <input
            type="text"
            value={data.ogTitle}
            onChange={(e) => update("ogTitle", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground"
          />
        </div>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label className="text-sm font-medium text-foreground/90">OG description</label>
            <CharHint value={data.ogDescription} softMax={160} label="description" />
          </div>
          <textarea
            value={data.ogDescription}
            onChange={(e) => update("ogDescription", e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground"
          />
        </div>
      </section>

      <section className="card-flat space-y-4">
        <h2 className="display-sm text-foreground">X (Twitter) Card</h2>
        <p className="text-sm text-muted-foreground">
          Twitter/X uses these when set; they default in code from site content for the root layout.
        </p>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label className="text-sm font-medium text-foreground/90">Twitter / X title</label>
            <CharHint value={data.twitterTitle ?? ""} softMax={70} label="title" />
          </div>
          <input
            type="text"
            value={data.twitterTitle ?? ""}
            onChange={(e) => update("twitterTitle", e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground"
          />
        </div>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <label className="text-sm font-medium text-foreground/90">Twitter / X description</label>
            <CharHint value={data.twitterDescription ?? ""} softMax={200} label="description" />
          </div>
          <textarea
            value={data.twitterDescription ?? ""}
            onChange={(e) => update("twitterDescription", e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/90">
            X (Twitter) site handle — without <span className="font-mono">@</span>
          </label>
          <input
            type="text"
            value={data.twitterSite ?? ""}
            onChange={(e) => update("twitterSite", e.target.value.replace(/^@/, ""))}
            placeholder="yourbrand"
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </section>

      <section className="card-flat space-y-4">
        <h2 className="display-sm text-foreground">Keywords & social URLs</h2>
        <div>
          <label className="block text-sm font-medium text-foreground/90">Keywords (one per line or comma-separated)</label>
          <textarea
            value={Array.isArray(data.keywords) ? data.keywords.join("\n") : ""}
            onChange={(e) =>
              update(
                "keywords",
                e.target.value
                  .split(/\n|,/)
                  .map((k) => k.trim())
                  .filter(Boolean)
              )
            }
            rows={4}
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground/90">
            Social profile URLs (Organization <code className="rounded bg-muted px-1 font-mono text-xs">sameAs</code>) — one
            per line
          </label>
          <textarea
            value={Array.isArray(data.sameAs) ? data.sameAs.join("\n") : ""}
            onChange={(e) =>
              update(
                "sameAs",
                e.target.value
                  .split("\n")
                  .map((u) => u.trim())
                  .filter(Boolean)
              )
            }
            rows={4}
            placeholder={"https://www.linkedin.com/company/…\nhttps://x.com/…"}
            className="mt-1 w-full rounded-lg border border-border bg-surface/50 px-4 py-2 text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-success">Saved. Metadata will update on the next page load.</p> : null}
      <button type="submit" disabled={saving} className="btn-base btn-primary">
        {saving ? "Saving…" : "Save site & SEO"}
      </button>
    </form>
  );
}
