"use client";

import { useRef, useState } from "react";
import type { MediaAssetDto } from "@/lib/media";

function formatBytes(n: number | null): string {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryClient({ initialAssets }: { initialAssets: MediaAssetDto[] }) {
  const [assets, setAssets] = useState<MediaAssetDto[]>(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError("");
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/media", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    setUploading(false);
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    setAssets((prev) => [data, ...prev]);
  };

  const remove = async (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
  };

  const copyUrl = async (asset: MediaAssetDto) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${asset.url}`);
      setCopiedId(asset.id);
      setTimeout(() => setCopiedId((id) => (id === asset.id ? null : id)), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="btn-base btn-primary"
        >
          {uploading ? "Uploading…" : "Upload file"}
        </button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      {assets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-lg border border-border bg-surface/50 p-2">
              <div className="aspect-square overflow-hidden rounded-md bg-muted/40">
                {asset.mimeType?.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.url} alt={asset.alt ?? asset.filename} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    {asset.mimeType || "file"}
                  </div>
                )}
              </div>
              <p className="mt-2 truncate text-xs font-medium text-foreground" title={asset.filename}>
                {asset.filename}
              </p>
              <p className="text-xs text-muted-foreground">{formatBytes(asset.sizeBytes)}</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => copyUrl(asset)}
                  className="btn-base btn-secondary !px-2 !py-1 text-xs"
                >
                  {copiedId === asset.id ? "Copied" : "Copy URL"}
                </button>
                <button
                  type="button"
                  onClick={() => remove(asset.id)}
                  className="btn-base btn-secondary !px-2 !py-1 text-xs text-destructive"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
