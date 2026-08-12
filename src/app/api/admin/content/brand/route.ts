import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { readBrandContent, writeBrandContent, type BrandContent } from "@/lib/brand-content";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await readBrandContent();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Partial<BrandContent>;
  const current = await readBrandContent();
  const data: BrandContent = { ...current, ...body };
  await writeBrandContent(data);
  void logActivity({ entityType: "brand", action: "updated", summary: "Updated brand settings" });
  revalidatePath("/");
  return NextResponse.json(data);
}
