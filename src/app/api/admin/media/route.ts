import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { listMediaAssets, saveMediaFile } from "@/lib/media";
import { logActivity } from "@/lib/activity-log";

const MAX_SIZE_BYTES = 15 * 1024 * 1024;

export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const assets = await listMediaAssets();
  return NextResponse.json(assets);
}

export async function POST(request: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 400 });
  }

  const asset = await saveMediaFile(file);
  void logActivity({ entityType: "media", entityId: asset.id, action: "created", summary: `Uploaded "${asset.filename}"` });
  return NextResponse.json(asset);
}
