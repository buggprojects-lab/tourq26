import { NextResponse } from "next/server";
import { withAdmin } from "@/lib/with-admin";
import { deleteMediaAsset } from "@/lib/media";
import { logActivity } from "@/lib/activity-log";

export const DELETE = withAdmin(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  await deleteMediaAsset(id);
  void logActivity({ entityType: "media", entityId: id, action: "deleted", summary: "Deleted media asset" });
  return NextResponse.json({ ok: true });
});
