import { NextRequest, NextResponse } from "next/server";
import type { EntityKind } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import {
  ensureEntityPage,
  listEntities,
  seedCmsEntities,
} from "@/lib/cms/entities";

export async function GET(request: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const kind = new URL(request.url).searchParams.get("kind") as EntityKind | null;
  if (!kind) {
    const [services, solutions, industries, technologies] = await Promise.all([
      listEntities("SERVICE"),
      listEntities("SOLUTION"),
      listEntities("INDUSTRY"),
      listEntities("TECHNOLOGY"),
    ]);
    return NextResponse.json({ services, solutions, industries, technologies });
  }

  const rows = await listEntities(kind);
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    action?: string;
    kind?: EntityKind;
    slug?: string;
  };

  if (body.action === "seed") {
    const counts = await seedCmsEntities();
    return NextResponse.json({ ok: true, counts });
  }

  if (body.action === "ensure-page" && body.kind && body.slug) {
    if (!["SERVICE", "SOLUTION", "INDUSTRY", "TECHNOLOGY"].includes(body.kind)) {
      return NextResponse.json({ error: "Unsupported kind" }, { status: 400 });
    }
    const page = await ensureEntityPage(
      body.kind as "SERVICE" | "SOLUTION" | "INDUSTRY" | "TECHNOLOGY",
      body.slug,
    );
    if (!page) return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    return NextResponse.json(page);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
