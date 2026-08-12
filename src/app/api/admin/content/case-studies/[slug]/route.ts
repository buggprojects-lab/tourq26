import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { readCaseStudies, writeCaseStudies, type CaseStudy } from "@/lib/case-studies-content";
import { slugify } from "@/lib/blog-server";
import { logActivity } from "@/lib/activity-log";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const items = await readCaseStudies();
  const item = items.find((c) => c.slug === slug);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;

  const items = await readCaseStudies();
  const index = items.findIndex((c) => c.slug === slug);
  if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const raw = (await request.json()) as Partial<CaseStudy>;
  const current = items[index];
  const nextSlug =
    typeof raw.slug === "string" && raw.slug.trim() ? slugify(raw.slug) : current.slug;

  if (nextSlug !== slug && items.some((c) => c.slug === nextSlug)) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
  }

  const updated: CaseStudy = {
    slug: nextSlug,
    title: raw.title ?? current.title,
    seoTitle: raw.seoTitle ?? current.seoTitle,
    client: raw.client ?? current.client,
    industry: raw.industry ?? current.industry,
    challenge: raw.challenge ?? current.challenge,
    outcome: raw.outcome ?? current.outcome,
    metric: raw.metric ?? current.metric,
    metricLabel: raw.metricLabel ?? current.metricLabel,
    icon: raw.icon ?? current.icon,
    coverImage: raw.coverImage ?? current.coverImage,
    coverAlt: raw.coverAlt ?? current.coverAlt,
    description: raw.description ?? current.description,
    date: raw.date ?? current.date,
    readTime: raw.readTime ?? current.readTime,
    services: Array.isArray(raw.services) ? raw.services : current.services,
    body: raw.body ?? current.body,
  };
  items[index] = updated;
  await writeCaseStudies(items);
  void logActivity({ entityType: "case-study", entityId: updated.slug, action: "updated", summary: `Updated case study "${updated.title}"` });
  revalidatePath("/");
  revalidatePath("/case-studies");
  revalidatePath(`/case-studies/${updated.slug}`);
  if (updated.slug !== slug) revalidatePath(`/case-studies/${slug}`);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const items = await readCaseStudies();
  const filtered = items.filter((c) => c.slug !== slug);
  if (filtered.length === items.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await writeCaseStudies(filtered);
  void logActivity({ entityType: "case-study", entityId: slug, action: "deleted", summary: `Deleted case study "${slug}"` });
  revalidatePath("/");
  revalidatePath("/case-studies");
  revalidatePath(`/case-studies/${slug}`);
  return NextResponse.json({ ok: true });
}
