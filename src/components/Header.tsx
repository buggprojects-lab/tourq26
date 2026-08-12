"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useExternalDevToolsHubHref } from "@/hooks/useExternalDevToolsHubHref";
import type { NavLink } from "@/lib/nav-content";

/**
 * Sticky marketing nav (DESIGN.md → nav-bar).
 * Behaviour: opens transparent over the hero (canvas-dark) band; switches to a
 * glass-blurred chrome once the user scrolls so it remains legible on both
 * dark hero bands and white product bands.
 */

export type HeaderNavFlags = {
  showTools?: boolean;
};

const DEV_TOOLS_LINK = { href: "/dev-tools", label: "Dev tools" };

function buildNavLinks(
  navLinks: NavLink[],
  flags: HeaderNavFlags | undefined,
  devToolsExternalHref: string | null,
) {
  const showTools = flags?.showTools !== false;
  const links: { href: string; label: string; openInNewTab?: boolean }[] = [...navLinks];
  if (showTools && devToolsExternalHref) {
    links.push(DEV_TOOLS_LINK);
  }
  return links;
}

export default function Header({
  navLinks = [],
  navFlags,
  logoUrl,
}: {
  navLinks?: NavLink[];
  navFlags?: HeaderNavFlags;
  logoUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const devToolsExternalHref = useExternalDevToolsHubHref();
  const resolvedLinks = useMemo(
    () => buildNavLinks(navLinks, navFlags, devToolsExternalHref),
    [navLinks, navFlags, devToolsExternalHref],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        scrolled
          ? "glass-panel"
          : "bg-[var(--brand-canvas-dark)] text-white border-b border-transparent"
      }`}
      data-band={scrolled ? "auto" : "dark"}
    >
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-6 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-[20px] font-medium tracking-[-0.02em] text-inherit transition-opacity hover:opacity-80"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-7 w-auto" />
          ) : (
            <>
              torq<span className="brand-gradient-text">.studio</span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {resolvedLinks.map((link) => {
            const isDevTools = link.href === "/dev-tools";
            const href = isDevTools ? devToolsExternalHref! : link.href;
            return (
              <Link
                key={isDevTools ? "dev-tools" : link.href}
                href={href}
                className="text-[14px] font-medium tracking-tight text-inherit/85 opacity-85 transition-opacity hover:opacity-100"
                {...(isDevTools || link.openInNewTab
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/contact"
            className="mono-button rounded-[var(--radius-sm)] px-4 py-2 text-inherit/90 hover:text-inherit"
          >
            Contact sales
          </Link>
          <Link
            href="/contact"
            className="btn-base btn-primary"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          className="-m-2 flex flex-col gap-1.5 rounded-md p-2 md:hidden"
          onClick={() => setOpen(!open)}
        >
          <span
            className={`h-0.5 w-6 bg-current transition-all duration-200 ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-current transition-all duration-200 ${open ? "scale-0 opacity-0" : ""}`}
          />
          <span
            className={`h-0.5 w-6 bg-current transition-all duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--app-glass-border)] bg-[var(--brand-canvas-dark)] text-white md:hidden">
          <div className="flex flex-col gap-3 px-4 py-4">
            <nav className="flex flex-col gap-1" aria-label="Mobile primary">
              {resolvedLinks.map((link) => {
                const isDevTools = link.href === "/dev-tools";
                const href = isDevTools ? devToolsExternalHref! : link.href;
                return (
                  <Link
                    key={isDevTools ? "dev-tools" : link.href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="rounded-[var(--radius-sm)] px-3 py-3 text-[15px] font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white"
                    {...(isDevTools || link.openInNewTab
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="btn-base btn-white w-full"
              >
                Contact sales
              </Link>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="btn-base btn-mint w-full"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
