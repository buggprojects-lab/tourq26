import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { readBlogPosts, writeBlogPosts, type BlogPost } from "@/lib/content";
import { normaliseBlogInput, slugify } from "@/lib/blog-server";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const posts = await readBlogPosts();
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = (await request.json()) as Record<string, unknown>;
  const candidate = normaliseBlogInput(raw);

  if (!candidate.title || candidate.title === "Untitled") {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const posts = await readBlogPosts();
  const slug = candidate.slug || slugify(candidate.title) || `post-${Date.now()}`;
  if (posts.some((p) => p.slug === slug)) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
  }

  const newPost: BlogPost = { ...candidate, slug };
  posts.push(newPost);
  await writeBlogPosts(posts);
  void logActivity({ entityType: "blog", entityId: newPost.slug, action: "created", summary: `Created blog post "${newPost.title}"` });
  revalidatePath("/blog");
  revalidatePath(`/blog/${newPost.slug}`);
  return NextResponse.json(newPost);
}
