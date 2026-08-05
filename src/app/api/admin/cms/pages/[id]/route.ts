import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { WorkflowStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { parseBlocks } from "@/lib/cms/blocks";
import {
  getPageById,
  publishPage,
  transitionPage,
  updatePage,
  type UpsertPageInput,
} from "@/lib/cms/pages";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Ctx) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const page = await getPageById(id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(request: NextRequest, ctx: Ctx) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = (await request.json()) as Record<string, unknown>;

  if (body.action === "publish") {
    const page = await publishPage(id);
    if (page?.path) {
      revalidatePath(page.path);
      revalidatePath("/sitemap.xml");
    }
    return NextResponse.json(page);
  }

  if (body.action === "transition" && body.toStatus) {
    const page = await transitionPage(
      id,
      body.toStatus as WorkflowStatus,
      body.comment != null ? String(body.comment) : undefined,
    );
    if (page?.status === "PUBLISHED" && page.path) {
      revalidatePath(page.path);
      revalidatePath("/sitemap.xml");
    }
    return NextResponse.json(page);
  }

  const patch: Partial<UpsertPageInput> = {};
  if (body.title != null) patch.title = String(body.title);
  if (body.slug != null) patch.slug = String(body.slug);
  if (body.type != null) patch.type = body.type as UpsertPageInput["type"];
  if (body.status != null) patch.status = body.status as WorkflowStatus;
  if (body.excerpt !== undefined) {
    patch.excerpt = body.excerpt == null ? null : String(body.excerpt);
  }
  if (body.path != null) patch.path = String(body.path);
  if (body.blocks != null) patch.blocks = parseBlocks(body.blocks);
  if (body.seo != null) patch.seo = body.seo as UpsertPageInput["seo"];
  if (body.brief != null) patch.brief = body.brief as UpsertPageInput["brief"];

  try {
    const page = await updatePage(id, patch);
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (page.status === "PUBLISHED") {
      revalidatePath(page.path);
    }
    revalidatePath("/admin/cms/pages");
    return NextResponse.json(page);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update page";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, ctx: Ctx) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const { prisma } = await import("@/lib/db");
  const page = await getPageById(id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.page.delete({ where: { id } });
  revalidatePath("/admin/cms/pages");
  if (page.path) revalidatePath(page.path);
  return NextResponse.json({ ok: true });
}
