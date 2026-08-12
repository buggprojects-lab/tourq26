import { prisma } from "@/lib/db";
import { writeFile, unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export type MediaAssetDto = {
  id: string;
  url: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number | null;
  alt: string | null;
  createdAt: string;
};

function inferKind(mimeType: string): "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" | "OTHER" {
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (mimeType === "application/pdf" || mimeType.startsWith("application/msword") || mimeType.includes("document")) {
    return "DOCUMENT";
  }
  return "OTHER";
}

function sanitizeFilename(name: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9.\-]+/g, "-").replace(/-+/g, "-");
  return base || "file";
}

function toDto(row: {
  id: string;
  url: string;
  filename: string;
  mimeType: string | null;
  sizeBytes: number | null;
  alt: string | null;
  createdAt: Date;
}): MediaAssetDto {
  return {
    id: row.id,
    url: row.url,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    alt: row.alt,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listMediaAssets(): Promise<MediaAssetDto[]> {
  const rows = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return rows.map(toDto);
}

export async function saveMediaFile(file: File): Promise<MediaAssetDto> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = sanitizeFilename(file.name);
  const storedName = `${Date.now()}-${filename}`;
  await writeFile(path.join(UPLOAD_DIR, storedName), buffer);
  const url = `/uploads/${storedName}`;
  const mimeType = file.type || "application/octet-stream";
  const row = await prisma.mediaAsset.create({
    data: {
      kind: inferKind(mimeType),
      url,
      filename,
      mimeType,
      sizeBytes: buffer.byteLength,
    },
  });
  return toDto(row);
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const row = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!row) return;
  await prisma.mediaAsset.delete({ where: { id } });
  const filePath = path.join(process.cwd(), "public", row.url.replace(/^\//, ""));
  await unlink(filePath).catch(() => {});
}
