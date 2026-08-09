import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getResolvedFeatureFlags } from "@/lib/feature-flags";

function isAdminOrPublicAuthPath(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return true;
  if (pathname === "/api/auth/login") return true;
  if (pathname === "/api/auth/logout") return true;
  if (pathname === "/api/auth/session") return true;
  if (pathname.startsWith("/api/admin")) return true;
  return false;
}

function envMaintenanceOn(): boolean {
  const v = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Never run feature flags / maintenance / redirects on Next.js assets (chunks, CSS, fonts, Turbopack).
  // If these paths hit middleware, responses can break (wrong MIME, 500) and the app shell fails to load.
  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const flags = await getResolvedFeatureFlags().catch(() => null);
  const maintenanceActive = envMaintenanceOn() || (flags?.maintenance_mode === true);

  if (maintenanceActive) {
    if (pathname === "/maintenance") return NextResponse.next();
    if (isAdminOrPublicAuthPath(pathname)) return NextResponse.next();
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "maintenance", message: "Site is in maintenance mode." },
        { status: 503 },
      );
    }
    const url = request.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.redirect(url);
  }

  if (!flags) {
    return NextResponse.next();
  }

  if (!flags.marketing_contact_form) {
    if (pathname === "/contact" || pathname.startsWith("/contact/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/feature-unavailable";
      url.searchParams.set("k", "marketing_contact_form");
      return NextResponse.redirect(url);
    }
    if (pathname === "/api/contact" && method === "POST") {
      return NextResponse.json(
        { error: "feature_disabled", message: "Contact form is temporarily disabled." },
        { status: 503 },
      );
    }
  }

  if (!flags.marketing_blog && (pathname === "/blog" || pathname.startsWith("/blog/"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/feature-unavailable";
    url.searchParams.set("k", "marketing_blog");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    // Exclude everything under /_next (static chunks, media, image optimizer) — matcher is a hint; guard above is authoritative.
    "/((?!_next/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
