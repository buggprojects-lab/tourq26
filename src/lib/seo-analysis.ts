export type SeoCheckStatus = "pass" | "warn" | "fail";

export type SeoCheck = {
  id: string;
  label: string;
  status: SeoCheckStatus;
  detail: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(haystack: string, needle: string): number {
  const term = needle.trim();
  if (!term) return 0;
  const re = new RegExp(escapeRegExp(term), "gi");
  return (haystack.match(re) ?? []).length;
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function check(id: string, label: string, status: SeoCheckStatus, detail: string): SeoCheck {
  return { id, label, status, detail };
}

export function analyzePageSeo(input: {
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
}): SeoCheck[] {
  const focusKeyword = input.focusKeyword.trim();
  const metaTitle = (input.metaTitle || input.title).trim();
  const metaDescription = input.metaDescription.trim();
  const bodyWords = wordCount(input.bodyText);
  const secondaryKeywords = input.secondaryKeywords.map((k) => k.trim()).filter(Boolean);

  const checks: SeoCheck[] = [];

  if (!focusKeyword) {
    checks.push(
      check("focusKeyword", "Focus keyword", "fail", "No focus keyword set — every other keyword check below is skipped until you add one."),
    );
    checks.push(
      check("metaTitleLength", "Meta title length", metaTitle.length === 0 ? "fail" : metaTitle.length > 60 ? "warn" : "pass", `${metaTitle.length} chars (aim for 40-60).`),
    );
    checks.push(
      check(
        "metaDescLength",
        "Meta description length",
        metaDescription.length === 0 ? "fail" : metaDescription.length > 160 ? "warn" : metaDescription.length < 80 ? "warn" : "pass",
        `${metaDescription.length} chars (aim for 120-160).`,
      ),
    );
    checks.push(
      check(
        "contentLength",
        "Content length",
        bodyWords === 0 ? "fail" : bodyWords < 300 ? "warn" : "pass",
        `${bodyWords} words across all blocks (aim for 300+ on a real content page).`,
      ),
    );
    checks.push(
      check("heading", "Has a subheading (H2/H3)", input.hasHeading ? "pass" : "warn", input.hasHeading ? "At least one section heading found." : "No content section headings found — add at least one H2."),
    );
    checks.push(
      check("link", "Has at least one link", input.hasLink ? "pass" : "warn", input.hasLink ? "Found a link in the body content." : "No links found in body content — internal/outbound links help both users and crawlers."),
    );
    return checks;
  }

  checks.push(check("focusKeyword", "Focus keyword", "pass", `"${focusKeyword}"`));

  checks.push(
    check(
      "keywordInTitle",
      "Keyword in meta title",
      metaTitle.toLowerCase().includes(focusKeyword.toLowerCase()) ? "pass" : "fail",
      metaTitle.toLowerCase().includes(focusKeyword.toLowerCase())
        ? "Meta title contains the focus keyword."
        : "Meta title does not contain the focus keyword.",
    ),
  );

  checks.push(
    check(
      "metaTitleLength",
      "Meta title length",
      metaTitle.length === 0 ? "fail" : metaTitle.length > 60 ? "warn" : metaTitle.length < 30 ? "warn" : "pass",
      `${metaTitle.length} chars (aim for 40-60, Google truncates past ~60).`,
    ),
  );

  checks.push(
    check(
      "keywordInMetaDesc",
      "Keyword in meta description",
      metaDescription.toLowerCase().includes(focusKeyword.toLowerCase()) ? "pass" : "fail",
      metaDescription.toLowerCase().includes(focusKeyword.toLowerCase())
        ? "Meta description contains the focus keyword."
        : "Meta description does not contain the focus keyword.",
    ),
  );

  checks.push(
    check(
      "metaDescLength",
      "Meta description length",
      metaDescription.length === 0 ? "fail" : metaDescription.length > 160 ? "warn" : metaDescription.length < 80 ? "warn" : "pass",
      `${metaDescription.length} chars (aim for 120-160).`,
    ),
  );

  const slugHasKeyword = input.slug.toLowerCase().includes(focusKeyword.toLowerCase().replace(/\s+/g, "-"));
  checks.push(
    check(
      "keywordInSlug",
      "Keyword in URL slug",
      slugHasKeyword ? "pass" : "warn",
      slugHasKeyword ? "Slug contains the focus keyword." : "Slug does not obviously contain the focus keyword.",
    ),
  );

  if (input.heroHeading.trim()) {
    const inHeading = input.heroHeading.toLowerCase().includes(focusKeyword.toLowerCase());
    checks.push(
      check(
        "keywordInH1",
        "Keyword in H1 (hero heading)",
        inHeading ? "pass" : "warn",
        inHeading ? "Hero heading contains the focus keyword." : "Hero heading does not contain the focus keyword.",
      ),
    );
  }

  const first100 = input.bodyText.trim().split(/\s+/).slice(0, 100).join(" ");
  const inOpening = first100.toLowerCase().includes(focusKeyword.toLowerCase());
  checks.push(
    check(
      "keywordEarly",
      "Keyword in the opening ~100 words",
      bodyWords === 0 ? "fail" : inOpening ? "pass" : "warn",
      bodyWords === 0 ? "No body content yet." : inOpening ? "Found early in the content." : "Not found in the first 100 words — readers and crawlers weight the opening most.",
    ),
  );

  const occurrences = countOccurrences(input.bodyText, focusKeyword);
  const density = bodyWords > 0 ? (occurrences / bodyWords) * 100 : 0;
  checks.push(
    check(
      "keywordDensity",
      "Keyword density",
      bodyWords === 0 ? "fail" : density === 0 ? "fail" : density > 3 ? "warn" : "pass",
      bodyWords === 0
        ? "No body content yet."
        : `${occurrences} occurrence${occurrences === 1 ? "" : "s"} in ${bodyWords} words (${density.toFixed(1)}%). Aim for 0.5-2.5%; above ~3% reads as keyword stuffing.`,
    ),
  );

  if (secondaryKeywords.length > 0) {
    const combined = `${input.title} ${metaTitle} ${metaDescription} ${input.bodyText}`.toLowerCase();
    const used = secondaryKeywords.filter((k) => combined.includes(k.toLowerCase()));
    checks.push(
      check(
        "secondaryKeywords",
        "Secondary keywords used",
        used.length === 0 ? "warn" : used.length < secondaryKeywords.length ? "warn" : "pass",
        `${used.length}/${secondaryKeywords.length} used${used.length > 0 ? `: ${used.join(", ")}` : ""}.`,
      ),
    );
  }

  checks.push(
    check(
      "contentLength",
      "Content length",
      bodyWords === 0 ? "fail" : bodyWords < 300 ? "warn" : "pass",
      `${bodyWords} words across all blocks (aim for 300+ on a real content page).`,
    ),
  );

  checks.push(
    check(
      "heading",
      "Has a subheading (H2/H3)",
      input.hasHeading ? "pass" : "warn",
      input.hasHeading ? "At least one section heading found." : "No content section headings found — add at least one H2.",
    ),
  );

  checks.push(
    check(
      "link",
      "Has at least one link",
      input.hasLink ? "pass" : "warn",
      input.hasLink ? "Found a link in the body content." : "No links found in body content — internal/outbound links help both users and crawlers.",
    ),
  );

  return checks;
}

export function summarizeSeoChecks(checks: SeoCheck[]): { passed: number; total: number; status: SeoCheckStatus } {
  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const status: SeoCheckStatus = failed > 0 ? "fail" : passed === checks.length ? "pass" : "warn";
  return { passed, total: checks.length, status };
}
