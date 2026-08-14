"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { HomeContent, ServiceItem, WhyUsItem } from "@/lib/home-content";
import { AiGenerateButton } from "@/components/admin/AiGenerateButton";
import { ADMIN_INPUT_CLASS as inputClass } from "@/components/admin/form-styles";

function Field({
  label,
  value,
  onChange,
  textarea,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground/90">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={inputClass} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      )}
    </div>
  );
}

function ReorderButtons({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        className="mono-label rounded border border-border px-2 py-1 text-muted-foreground disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
        className="mono-label rounded border border-border px-2 py-1 text-muted-foreground disabled:opacity-30"
      >
        ↓
      </button>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="mono-label rounded border border-border px-2 py-1 text-[color:var(--app-destructive)]"
      >
        REMOVE
      </button>
    </div>
  );
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function HomeContentForm({ initialData }: { initialData: HomeContent }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = <K extends keyof HomeContent>(key: K, value: HomeContent[K]) => {
    setSuccess(false);
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setError("");
    setSuccess(false);
    setSaving(true);
    const res = await fetch("/api/admin/content/home", {
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

  const updateServiceItem = (index: number, patch: Partial<ServiceItem>) => {
    update(
      "servicesItems",
      data.servicesItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const updateWhyUsItem = (index: number, patch: Partial<WhyUsItem>) => {
    update(
      "whyUsItems",
      data.whyUsItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="mt-8 max-w-3xl space-y-10">
      <section className="card-flat space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">Hero</h2>
            <p className="text-sm text-muted-foreground">The top banner — first thing every visitor sees.</p>
          </div>
          <AiGenerateButton<{ eyebrow: string; heading: string; subheading: string }>
            task="heroCopy"
            context={{ topic: "a software studio's homepage", purpose: "convert a first-time visitor into a lead" }}
            onResult={({ eyebrow, heading, subheading }) => {
              update("heroEyebrow", eyebrow);
              update("heroHeading", heading);
              update("heroSubheading", subheading);
            }}
          />
        </div>
        <Field label="Eyebrow" value={data.heroEyebrow} onChange={(v) => update("heroEyebrow", v)} />
        <Field label="Headline" value={data.heroHeading} onChange={(v) => update("heroHeading", v)} textarea rows={2} />
        <Field label="Subheading" value={data.heroSubheading} onChange={(v) => update("heroSubheading", v)} textarea />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary CTA label" value={data.heroPrimaryCtaLabel} onChange={(v) => update("heroPrimaryCtaLabel", v)} />
          <Field label="Primary CTA link" value={data.heroPrimaryCtaHref} onChange={(v) => update("heroPrimaryCtaHref", v)} />
          <Field label="Secondary CTA label" value={data.heroSecondaryCtaLabel} onChange={(v) => update("heroSecondaryCtaLabel", v)} />
          <Field label="Secondary CTA link" value={data.heroSecondaryCtaHref} onChange={(v) => update("heroSecondaryCtaHref", v)} />
          <Field label="Tertiary CTA label" value={data.heroTertiaryCtaLabel} onChange={(v) => update("heroTertiaryCtaLabel", v)} />
          <Field label="Tertiary CTA link" value={data.heroTertiaryCtaHref} onChange={(v) => update("heroTertiaryCtaHref", v)} />
        </div>
        <Field
          label="Tag ticker (one per line — e.g. Mobile apps, Web platforms…)"
          value={data.heroTags.join("\n")}
          onChange={(v) => update("heroTags", v.split("\n").map((t) => t.trim()).filter(Boolean))}
          textarea
          rows={5}
        />
      </section>

      <section className="card-flat space-y-4">
        <h2 className="display-sm text-foreground">Services</h2>
        <Field label="Eyebrow" value={data.servicesEyebrow} onChange={(v) => update("servicesEyebrow", v)} />
        <Field label="Heading" value={data.servicesHeading} onChange={(v) => update("servicesHeading", v)} />
        <Field label="Intro" value={data.servicesIntro} onChange={(v) => update("servicesIntro", v)} textarea rows={2} />
        <div className="space-y-4">
          {data.servicesItems.map((item, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="mono-label text-muted-foreground">SERVICE {i + 1}</p>
                <div className="flex items-center gap-2">
                  <AiGenerateButton<{ title: string; description: string }>
                    task="itemCopy"
                    variant="inline"
                    context={{ theme: item.category || data.servicesHeading || "software studio services", kind: "service" }}
                    onResult={({ title, description }) => updateServiceItem(i, { title, description })}
                  />
                  <ReorderButtons
                    index={i}
                    count={data.servicesItems.length}
                    onMove={(from, to) => update("servicesItems", reorder(data.servicesItems, from, to))}
                    onRemove={(idx) => update("servicesItems", data.servicesItems.filter((_, j) => j !== idx))}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Category label" value={item.category} onChange={(v) => updateServiceItem(i, { category: v })} />
                <Field label="Slug (/services/…)" value={item.slug} onChange={(v) => updateServiceItem(i, { slug: v })} />
                <Field label="Title" value={item.title} onChange={(v) => updateServiceItem(i, { title: v })} />
                <Field label="Result tag" value={item.result} onChange={(v) => updateServiceItem(i, { result: v })} />
              </div>
              <Field label="Description" value={item.description} onChange={(v) => updateServiceItem(i, { description: v })} textarea rows={2} />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update("servicesItems", [
                ...data.servicesItems,
                { slug: "", title: "New service", description: "", result: "", category: "NEW", icon: "/images/icons/web.svg" },
              ])
            }
            className="btn-base btn-outline text-sm"
          >
            + Add service
          </button>
        </div>
      </section>

      <section className="card-flat space-y-4">
        <h2 className="display-sm text-foreground">Why Choose Us</h2>
        <Field label="Eyebrow" value={data.whyUsEyebrow} onChange={(v) => update("whyUsEyebrow", v)} />
        <Field label="Heading" value={data.whyUsHeading} onChange={(v) => update("whyUsHeading", v)} />
        <Field label="Intro" value={data.whyUsIntro} onChange={(v) => update("whyUsIntro", v)} textarea rows={2} />
        <div className="space-y-4">
          {data.whyUsItems.map((item, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="mono-label text-muted-foreground">REASON {i + 1}</p>
                <div className="flex items-center gap-2">
                  <AiGenerateButton<{ title: string; description: string }>
                    task="itemCopy"
                    variant="inline"
                    context={{ theme: item.eyebrow || data.whyUsHeading || "why choose this studio", kind: "whyUs" }}
                    onResult={({ title, description }) => updateWhyUsItem(i, { title, description })}
                  />
                  <ReorderButtons
                    index={i}
                    count={data.whyUsItems.length}
                    onMove={(from, to) => update("whyUsItems", reorder(data.whyUsItems, from, to))}
                    onRemove={(idx) => update("whyUsItems", data.whyUsItems.filter((_, j) => j !== idx))}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Eyebrow" value={item.eyebrow} onChange={(v) => updateWhyUsItem(i, { eyebrow: v })} />
                <Field label="Stat (e.g. 40%)" value={item.stat} onChange={(v) => updateWhyUsItem(i, { stat: v })} />
                <Field label="Title" value={item.title} onChange={(v) => updateWhyUsItem(i, { title: v })} />
              </div>
              <Field label="Description" value={item.description} onChange={(v) => updateWhyUsItem(i, { description: v })} textarea rows={2} />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              update("whyUsItems", [
                ...data.whyUsItems,
                { eyebrow: "NEW", stat: "", title: "New reason", description: "" },
              ])
            }
            className="btn-base btn-outline text-sm"
          >
            + Add reason
          </button>
        </div>
      </section>

      <section className="card-flat space-y-4">
        <h2 className="display-sm text-foreground">Case studies (teaser copy)</h2>
        <p className="text-sm text-muted-foreground">
          Only this section&apos;s intro copy is editable here — the case-study cards themselves are managed separately.
        </p>
        <Field label="Eyebrow" value={data.caseStudiesEyebrow} onChange={(v) => update("caseStudiesEyebrow", v)} />
        <Field label="Heading" value={data.caseStudiesHeading} onChange={(v) => update("caseStudiesHeading", v)} />
        <Field label="Intro" value={data.caseStudiesIntro} onChange={(v) => update("caseStudiesIntro", v)} textarea rows={2} />
      </section>

      <section className="card-flat space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="display-sm text-foreground">Closing CTA</h2>
          <AiGenerateButton<{ heading: string; body: string; primaryCtaLabel: string }>
            task="ctaCopy"
            context={{ purpose: "close a homepage visit with a booked call or contact form submission", audience: "a prospective client evaluating the studio" }}
            onResult={({ heading, body, primaryCtaLabel }) => {
              update("ctaHeading", heading);
              update("ctaBody", body);
              update("ctaPrimaryLabel", primaryCtaLabel);
            }}
          />
        </div>
        <Field label="Eyebrow" value={data.ctaEyebrow} onChange={(v) => update("ctaEyebrow", v)} />
        <Field label="Heading" value={data.ctaHeading} onChange={(v) => update("ctaHeading", v)} />
        <Field label="Body" value={data.ctaBody} onChange={(v) => update("ctaBody", v)} textarea />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary CTA label" value={data.ctaPrimaryLabel} onChange={(v) => update("ctaPrimaryLabel", v)} />
          <Field label="Primary CTA link" value={data.ctaPrimaryHref} onChange={(v) => update("ctaPrimaryHref", v)} />
          <Field label="Secondary CTA label" value={data.ctaSecondaryLabel} onChange={(v) => update("ctaSecondaryLabel", v)} />
          <Field label="Secondary CTA link" value={data.ctaSecondaryHref} onChange={(v) => update("ctaSecondaryHref", v)} />
          <Field label="Contact email" value={data.ctaEmail} onChange={(v) => update("ctaEmail", v)} />
          <Field label="Footnote" value={data.ctaFootnote} onChange={(v) => update("ctaFootnote", v)} />
        </div>
      </section>

      <section className="card-flat space-y-4">
        <h2 className="display-sm text-foreground">Snapshot section</h2>
        <p className="text-sm text-muted-foreground">The editorial block near the bottom of the homepage.</p>
        <Field label="Heading" value={data.snapshotHeading} onChange={(v) => update("snapshotHeading", v)} />
        <div className="space-y-3">
          {data.snapshotParagraphs.map((p, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="mono-label text-muted-foreground">PARAGRAPH {i + 1}</p>
                <div className="flex items-center gap-2">
                  <AiGenerateButton<string>
                    task="shortCopy"
                    variant="inline"
                    context={{ purpose: data.snapshotHeading || "editorial paragraph about the studio", siteContext: p }}
                    onResult={(text) =>
                      update(
                        "snapshotParagraphs",
                        data.snapshotParagraphs.map((x, j) => (j === i ? text : x)),
                      )
                    }
                  />
                  <ReorderButtons
                    index={i}
                    count={data.snapshotParagraphs.length}
                    onMove={(from, to) => update("snapshotParagraphs", reorder(data.snapshotParagraphs, from, to))}
                    onRemove={(idx) => update("snapshotParagraphs", data.snapshotParagraphs.filter((_, j) => j !== idx))}
                  />
                </div>
              </div>
              <textarea
                value={p}
                onChange={(e) =>
                  update(
                    "snapshotParagraphs",
                    data.snapshotParagraphs.map((x, j) => (j === i ? e.target.value : x)),
                  )
                }
                rows={3}
                className={inputClass}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => update("snapshotParagraphs", [...data.snapshotParagraphs, ""])}
            className="btn-base btn-outline text-sm"
          >
            + Add paragraph
          </button>
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {success ? <p className="text-sm text-success">Saved. The homepage will update on the next page load.</p> : null}
      <button type="submit" disabled={saving} className="btn-base btn-primary">
        {saving ? "Saving…" : "Save homepage"}
      </button>
    </form>
  );
}
