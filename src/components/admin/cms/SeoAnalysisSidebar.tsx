"use client";

import { analyzePageSeo, summarizeSeoChecks, type SeoCheckStatus } from "@/lib/seo-analysis";

const STATUS_DOT: Record<SeoCheckStatus, string> = {
  pass: "bg-emerald-500",
  warn: "bg-amber-500",
  fail: "bg-red-500",
};

const STATUS_LABEL: Record<SeoCheckStatus, string> = {
  pass: "Good",
  warn: "Needs work",
  fail: "Missing",
};

export function SeoAnalysisSidebar({
  title,
  slug,
  metaTitle,
  metaDescription,
  focusKeyword,
  secondaryKeywords,
  bodyText,
  heroHeading,
  hasHeading,
  hasLink,
}: {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  bodyText: string;
  heroHeading: string;
  hasHeading: boolean;
  hasLink: boolean;
}) {
  const checks = analyzePageSeo({
    title,
    slug,
    metaTitle,
    metaDescription,
    focusKeyword,
    secondaryKeywords,
    bodyText,
    heroHeading,
    hasHeading,
    hasLink,
  });
  const summary = summarizeSeoChecks(checks);

  return (
    <div className="card-flat space-y-4">
      <div>
        <h2 className="display-sm text-foreground">SEO analysis</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Live, rule-based checks against your focus keyword — recalculates as you edit.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-md border border-border/60 bg-muted/20 px-3 py-2.5">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[summary.status]}`} aria-hidden />
        <span className="text-sm font-medium text-foreground">
          {summary.passed}/{summary.total} checks passing
        </span>
        <span className="mono-label ml-auto text-muted-foreground">{STATUS_LABEL[summary.status]}</span>
      </div>

      <ul className="space-y-3">
        {checks.map((c) => (
          <li key={c.id} className="flex gap-2.5">
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[c.status]}`}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{c.label}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
