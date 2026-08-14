"use client";

import { getExternalDevToolsOrigin } from "@/lib/dev-tools-marketing";

/**
 * When `NEXT_PUBLIC_DEV_TOOLS_URL` is set (origin of the standalone Torq DevTools app),
 * returns `${origin}/dev-tools` for header / privacy links. Otherwise returns `null` (hide nav item).
 */
export function useExternalDevToolsHubHref(): string | null {
  const base = getExternalDevToolsOrigin();
  if (!base) return null;
  return `${base}/dev-tools`;
}
