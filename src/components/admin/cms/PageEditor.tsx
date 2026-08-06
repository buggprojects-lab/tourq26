"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BLOCK_TYPE_OPTIONS,
  createDefaultBlock,
  type BlockTypeKey,
  type CmsBlock,
} from "@/lib/cms/blocks";
import {
  extractTextFromCmsBlocks,
  generateSeoFromContent,
} from "@/lib/seo-generate";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SerpPreview } from "@/components/admin/SerpPreview";

type PageEditorProps = {
  mode: "create" | "edit";
  pageId?: string;
  siteUrl?: string;
  siteName?: string;
  initial?: {
    title: string;
    slug: string;
    type: string;
    status: string;
    path: string;
    excerpt: string;
    blocks: CmsBlock[];
    seo: {
      metaTitle: string;
      metaDescription: string;
      focusKeyword: string;
      robotsIndex: boolean;
      robotsFollow: boolean;
    };
    brief: {
      targetKeyword: string;
      secondaryKeywords: string;
    };
  };
};

const PAGE_TYPES = [
  "SERVICE",
  "SOLUTION",
  "INDUSTRY",
  "TECHNOLOGY",
  "LANDING",
  "COMPANY",
  "CUSTOM",
] as const;

export function PageEditor({
  mode,
  pageId,
  siteUrl = "https://example.com",
  siteName = "",
  initial,
}: PageEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [type, setType] = useState(initial?.type ?? "SERVICE");
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [path, setPath] = useState(initial?.path ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [blocks, setBlocks] = useState<CmsBlock[]>(initial?.blocks ?? []);
  const [metaTitle, setMetaTitle] = useState(initial?.seo.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.seo.metaDescription ?? "",
  );
  const [focusKeyword, setFocusKeyword] = useState(initial?.seo.focusKeyword ?? "");
  const [robotsIndex, setRobotsIndex] = useState(initial?.seo.robotsIndex ?? true);
  const [robotsFollow, setRobotsFollow] = useState(initial?.seo.robotsFollow ?? true);
  const [targetKeyword, setTargetKeyword] = useState(
    initial?.brief.targetKeyword ?? "",
  );
  const [secondaryKeywords, setSecondaryKeywords] = useState(
    initial?.brief.secondaryKeywords ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addType, setAddType] = useState<BlockTypeKey>("hero");

  const previewPath = useMemo(() => path || `/${slug}`, [path, slug]);

  function generateSeo() {
    const generated = generateSeoFromContent({
      title,
      excerpt,
      bodyText: extractTextFromCmsBlocks(blocks),
      focusKeyword: focusKeyword || targetKeyword,
    });
    setMetaTitle(generated.metaTitle);
    setMetaDescription(generated.metaDescription);
    if (!focusKeyword.trim() && targetKeyword.trim()) {
      setFocusKeyword(targetKeyword.trim());
    }
  }

  async function save(publish = false) {
    setSaving(true);
    setError(null);
    const payload = {
      title,
      slug,
      type,
      status: publish ? "PUBLISHED" : status,
      path: path || undefined,
      excerpt,
      blocks,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription,
        focusKeyword,
        robotsIndex,
        robotsFollow,
        schemaKeys: type === "SERVICE" ? ["Service", "FAQPage"] : [],
      },
      brief: {
        targetKeyword: targetKeyword || focusKeyword,
        secondaryKeywords: secondaryKeywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      },
    };

    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/cms/pages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Create failed");
        if (publish) {
          await fetch(`/api/admin/cms/pages/${data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "publish" }),
          });
        }
        router.push(`/admin/cms/pages/${data.id}`);
        router.refresh();
      } else if (pageId) {
        const res = await fetch(`/api/admin/cms/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Save failed");
        if (publish) {
          await fetch(`/api/admin/cms/pages/${pageId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "publish" }),
          });
        }
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateBlock(id: string, patch: Partial<CmsBlock>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...patch } as CmsBlock) : b)),
    );
  }

  function moveBlock(id: string, dir: -1 | 1) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const next = idx + dir;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block text-sm">
          <span className="mono-label text-muted-foreground">Title</span>
          <input
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mono-label text-muted-foreground">Slug</span>
          <input
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mono-label text-muted-foreground">Type</span>
          <select
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {PAGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mono-label text-muted-foreground">Path</span>
          <input
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
            value={path}
            placeholder="auto from type + slug"
            onChange={(e) => setPath(e.target.value)}
          />
        </label>
        <label className="block text-sm lg:col-span-2">
          <span className="mono-label text-muted-foreground">Excerpt</span>
          <textarea
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </label>
      </div>

      <section className="space-y-4 border-t border-border/60 pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="display-sm text-foreground">Blocks</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Compose the page from reusable sections. Preview path: {previewPath}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={addType}
              onChange={(e) => setAddType(e.target.value as BlockTypeKey)}
            >
              {BLOCK_TYPE_OPTIONS.map((o) => (
                <option key={o.type} value={o.type}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-base btn-secondary"
              onClick={() => setBlocks((prev) => [...prev, createDefaultBlock(addType)])}
            >
              Add block
            </button>
          </div>
        </div>

        <ul className="space-y-4">
          {blocks.map((block, index) => (
            <li
              key={block.id}
              className="rounded-md border border-border/60 bg-muted/20 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="mono-eyebrow text-muted-foreground">
                  {String(index + 1).padStart(2, "0")} · {block.type}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-base btn-secondary !px-2 !py-1 text-xs"
                    onClick={() => moveBlock(block.id, -1)}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="btn-base btn-secondary !px-2 !py-1 text-xs"
                    onClick={() => moveBlock(block.id, 1)}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="btn-base btn-secondary !px-2 !py-1 text-xs"
                    onClick={() => setBlocks((prev) => prev.filter((b) => b.id !== block.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <BlockFields block={block} onChange={(patch) => updateBlock(block.id, patch)} />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 border-t border-border/60 pt-6 lg:grid-cols-2">
        <div className="flex flex-wrap items-end justify-between gap-3 lg:col-span-2">
          <div>
            <h2 className="display-sm text-foreground">SEO</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate meta from title, excerpt, and page blocks, then refine below.
            </p>
          </div>
          <button
            type="button"
            className="btn-base btn-secondary"
            onClick={generateSeo}
            disabled={!title.trim() && !excerpt.trim() && blocks.length === 0}
          >
            Generate from content
          </button>
        </div>

        <div className="lg:col-span-2">
          <SerpPreview
            siteUrl={siteUrl}
            path={previewPath}
            title={
              (metaTitle.trim() || title || "Page title") +
              (siteName ? ` | ${siteName}` : "")
            }
            description={metaDescription || excerpt}
          />
        </div>

        <label className="block text-sm">
          <span className="flex items-center justify-between gap-2">
            <span className="mono-label text-muted-foreground">Meta title</span>
            <span
              className={`mono-label tabular-nums ${
                (metaTitle || title).length > 60
                  ? "text-[color:var(--app-destructive)]"
                  : "text-muted-foreground"
              }`}
            >
              {(metaTitle || title).length} / ~60
            </span>
          </span>
          <input
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
            value={metaTitle}
            placeholder={title || "Defaults to page title"}
            onChange={(e) => setMetaTitle(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mono-label text-muted-foreground">Focus keyword</span>
          <input
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
          />
        </label>
        <label className="block text-sm lg:col-span-2">
          <span className="flex items-center justify-between gap-2">
            <span className="mono-label text-muted-foreground">Meta description</span>
            <span
              className={`mono-label tabular-nums ${
                metaDescription.length > 160
                  ? "text-[color:var(--app-destructive)]"
                  : "text-muted-foreground"
              }`}
            >
              {metaDescription.length} / ~160
            </span>
          </span>
          <textarea
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
            rows={3}
            value={metaDescription}
            placeholder="Write or generate from page content"
            onChange={(e) => setMetaDescription(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={robotsIndex}
            onChange={(e) => setRobotsIndex(e.target.checked)}
          />
          Index
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={robotsFollow}
            onChange={(e) => setRobotsFollow(e.target.checked)}
          />
          Follow
        </label>
        <label className="block text-sm">
          <span className="mono-label text-muted-foreground">Brief target keyword</span>
          <input
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
            value={targetKeyword}
            onChange={(e) => setTargetKeyword(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="mono-label text-muted-foreground">
            Secondary keywords (comma-separated)
          </span>
          <input
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
            value={secondaryKeywords}
            onChange={(e) => setSecondaryKeywords(e.target.value)}
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-border/60 pt-6">
        <button
          type="button"
          className="btn-base btn-primary"
          disabled={saving}
          onClick={() => void save(false)}
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        <button
          type="button"
          className="btn-base btn-secondary"
          disabled={saving}
          onClick={() => void save(true)}
        >
          Save & publish
        </button>
        {mode === "edit" && path ? (
          <Link href={path} className="btn-base btn-secondary" target="_blank">
            View live
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function BlockFields({
  block,
  onChange,
}: {
  block: CmsBlock;
  onChange: (patch: Partial<CmsBlock>) => void;
}) {
  if (block.type === "hero") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Eyebrow" value={block.eyebrow ?? ""} onChange={(v) => onChange({ eyebrow: v })} />
        <Field label="Heading" value={block.heading} onChange={(v) => onChange({ heading: v })} />
        <Field
          label="Subheading"
          value={block.subheading ?? ""}
          onChange={(v) => onChange({ subheading: v })}
          className="sm:col-span-2"
          multiline
        />
        <Field
          label="Primary CTA label"
          value={block.primaryCtaLabel ?? ""}
          onChange={(v) => onChange({ primaryCtaLabel: v })}
        />
        <Field
          label="Primary CTA href"
          value={block.primaryCtaHref ?? ""}
          onChange={(v) => onChange({ primaryCtaHref: v })}
        />
      </div>
    );
  }

  if (block.type === "contentSection") {
    return (
      <div className="grid gap-3">
        <Field label="Eyebrow" value={block.eyebrow ?? ""} onChange={(v) => onChange({ eyebrow: v })} />
        <Field label="Heading" value={block.heading ?? ""} onChange={(v) => onChange({ heading: v })} />
        <div className="block text-sm">
          <span className="mono-label text-muted-foreground">Body</span>
          <div className="mt-1.5">
            <RichTextEditor
              value={block.bodyHtml}
              onChange={(html) => onChange({ bodyHtml: html })}
              placeholder="Write the section body…"
              minHeight="12rem"
            />
          </div>
        </div>
      </div>
    );
  }

  if (block.type === "cta") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Eyebrow" value={block.eyebrow ?? ""} onChange={(v) => onChange({ eyebrow: v })} />
        <Field label="Heading" value={block.heading} onChange={(v) => onChange({ heading: v })} />
        <div className="block text-sm sm:col-span-2">
          <span className="mono-label text-muted-foreground">Body</span>
          <div className="mt-1.5">
            <RichTextEditor
              value={block.body ?? ""}
              onChange={(html) => onChange({ body: html })}
              placeholder="Optional supporting copy…"
              minHeight="8rem"
            />
          </div>
        </div>
        <Field
          label="Primary CTA label"
          value={block.primaryCtaLabel ?? ""}
          onChange={(v) => onChange({ primaryCtaLabel: v })}
        />
        <Field
          label="Primary CTA href"
          value={block.primaryCtaHref ?? ""}
          onChange={(v) => onChange({ primaryCtaHref: v })}
        />
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={!!block.dark}
            onChange={(e) => onChange({ dark: e.target.checked })}
          />
          Dark band
        </label>
      </div>
    );
  }

  if (block.type === "faq") {
    return (
      <div className="space-y-4">
        <Field
          label="Heading"
          value={block.heading ?? ""}
          onChange={(v) => onChange({ heading: v })}
        />
        <ul className="space-y-4">
          {block.items.map((item, i) => (
            <li
              key={`${block.id}-faq-${i}`}
              className="rounded-md border border-border/50 bg-background/60 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="mono-label text-muted-foreground">
                  Q{String(i + 1).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  className="btn-base btn-secondary !px-2 !py-1 text-xs"
                  onClick={() =>
                    onChange({
                      items: block.items.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <Field
                label="Question"
                value={item.question}
                onChange={(v) => {
                  const items = block.items.map((it, idx) =>
                    idx === i ? { ...it, question: v } : it,
                  );
                  onChange({ items });
                }}
              />
              <div className="mt-3 block text-sm">
                <span className="mono-label text-muted-foreground">Answer</span>
                <div className="mt-1.5">
                  <RichTextEditor
                    value={item.answer}
                    onChange={(html) => {
                      const items = block.items.map((it, idx) =>
                        idx === i ? { ...it, answer: html } : it,
                      );
                      onChange({ items });
                    }}
                    placeholder="Write the answer…"
                    minHeight="7rem"
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-base btn-secondary"
          onClick={() =>
            onChange({
              items: [
                ...block.items,
                { question: "New question?", answer: "<p>Answer goes here.</p>" },
              ],
            })
          }
        >
          Add FAQ item
        </button>
      </div>
    );
  }

  if (block.type === "featureGrid") {
    return (
      <div className="space-y-4">
        <Field
          label="Heading"
          value={block.heading ?? ""}
          onChange={(v) => onChange({ heading: v })}
        />
        <ul className="space-y-3">
          {block.items.map((item, i) => (
            <li
              key={`${block.id}-feat-${i}`}
              className="rounded-md border border-border/50 bg-background/60 p-3"
            >
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  className="btn-base btn-secondary !px-2 !py-1 text-xs"
                  onClick={() =>
                    onChange({
                      items: block.items.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  Remove
                </button>
              </div>
              <Field
                label="Title"
                value={item.title}
                onChange={(v) => {
                  const items = block.items.map((it, idx) =>
                    idx === i ? { ...it, title: v } : it,
                  );
                  onChange({ items });
                }}
              />
              <Field
                label="Description"
                value={item.description}
                onChange={(v) => {
                  const items = block.items.map((it, idx) =>
                    idx === i ? { ...it, description: v } : it,
                  );
                  onChange({ items });
                }}
                multiline
                className="mt-2"
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn-base btn-secondary"
          onClick={() =>
            onChange({
              items: [
                ...block.items,
                { title: "New feature", description: "Short description." },
              ],
            })
          }
        >
          Add feature
        </button>
      </div>
    );
  }

  return null;
}

function Field({
  label,
  value,
  onChange,
  multiline,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className ?? ""}`}>
      <span className="mono-label text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
