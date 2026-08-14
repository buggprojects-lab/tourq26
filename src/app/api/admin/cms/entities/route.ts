import { NextRequest, NextResponse } from "next/server";
import type { EntityKind } from "@prisma/client";
import { withAdmin } from "@/lib/with-admin";
import {
  ensureEntityPage,
  listEntities,
  seedCmsEntities,
} from "@/lib/cms/entities";
import { logActivity } from "@/lib/activity-log";

export const GET = withAdmin(async (request: NextRequest) => {
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
});

export const POST = withAdmin(async (request: NextRequest) => {
  const body = (await request.json()) as {
    action?: string;
    kind?: EntityKind;
    slug?: string;
  };

  if (body.action === "seed") {
    const counts = await seedCmsEntities();
    void logActivity({ entityType: "cms-entities", action: "created", summary: "Seeded CMS entities" });
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
    void logActivity({ entityType: "cms-entities", entityId: page.id, action: "created", summary: `Ensured entity page for ${body.kind} "${body.slug}"` });
    return NextResponse.json(page);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
});
