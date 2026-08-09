import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { readFooterContent, writeFooterContent, type FooterContent } from "@/lib/footer-content";

export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await readFooterContent();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Partial<FooterContent>;
  const current = await readFooterContent();
  const data: FooterContent = { ...current, ...body };
  await writeFooterContent(data);
  revalidatePath("/", "layout");
  return NextResponse.json(data);
}
