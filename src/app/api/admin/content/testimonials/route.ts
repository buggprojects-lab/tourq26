import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { readTestimonials, writeTestimonials, type Testimonial } from "@/lib/content";
import { logActivity } from "@/lib/activity-log";

export async function GET() {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const items = await readTestimonials();
  return NextResponse.json(items);
}

export async function PUT(request: NextRequest) {
  const ok = await requireAdmin();
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const items = Array.isArray(body) ? body : [];
  const testimonials: Testimonial[] = items.map((t: Record<string, unknown>, i: number) => ({
    id: typeof t.id === "string" ? t.id : String(i + 1),
    quote: typeof t.quote === "string" ? t.quote : "",
    result: typeof t.result === "string" ? t.result : "",
    name: typeof t.name === "string" ? t.name : "",
    role: typeof t.role === "string" ? t.role : "",
    company: typeof t.company === "string" ? t.company : "",
    rating: typeof t.rating === "number" ? t.rating : 5,
  }));
  await writeTestimonials(testimonials);
  void logActivity({ entityType: "testimonials", action: "updated", summary: `Updated testimonials (${testimonials.length} total)` });
  revalidatePath("/");
  return NextResponse.json(testimonials);
}
