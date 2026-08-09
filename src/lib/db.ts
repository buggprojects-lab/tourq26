/** Shared Prisma client (Interview Hub + CMS). */
export { prisma } from "@/lib/hub/prisma";

/**
 * Bounds a DB call to `ms` so callers fall back quickly instead of waiting out
 * MongoDB's ~30s server-selection timeout (which can exceed Next.js's static
 * page generation timeout when a page makes more than one DB call).
 */
export function withDbTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("DB call timed out")), ms)),
  ]);
}
