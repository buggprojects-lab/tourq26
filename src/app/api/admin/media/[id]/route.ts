import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteMediaAsset } from "@/lib/media";
import { logActivity } from "@/lib/activity-log";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await deleteMediaAsset(id);
  void logActivity({ entityType: "media", entityId: id, action: "deleted", summary: "Deleted media asset" });
  return NextResponse.json({ ok: true });
}
