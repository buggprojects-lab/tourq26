import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { readHomeContent, writeHomeContent, type HomeContent } from "@/lib/home-content";

export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await readHomeContent();
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as Partial<HomeContent>;
  const current = await readHomeContent();
  const data: HomeContent = { ...current, ...body };
  await writeHomeContent(data);
  revalidatePath("/");
  return NextResponse.json(data);
}
