import { prisma } from "@/lib/db";

export type FooterColumn = {
  eyebrow: string;
  links: { label: string; href: string }[];
};

export type FooterContent = {
  blurb: string;
  tagline: string;
  columns: FooterColumn[];
};

const FOOTER_KEY = "default";

/** Matches today's hardcoded `navColumns` + copy in `Footer.tsx`. */
function getDefaultFooterContent(): FooterContent {
  return {
    blurb:
      "Senior software engineers for mobile applications, web platforms, public APIs, and grounded AI workflows. Clear scope, direct communication, production-quality delivery — every engagement.",
    tagline: "BASED IN MUMBAI · OVERLAP WITH INDIA / EU / MENA",
    columns: [
      {
        eyebrow: "PLATFORM",
        links: [
          { href: "/services/mobile-app-development", label: "Mobile applications" },
          { href: "/services/web-development", label: "Web & APIs" },
          { href: "/services/ai-solutions", label: "AI workflows" },
          { href: "/services/remote-it", label: "Remote engineering" },
          { href: "/services/technical-consulting", label: "Advisory" },
        ],
      },
      {
        eyebrow: "EVIDENCE",
        links: [
          { href: "/case-studies", label: "Case studies" },
          { href: "/blog", label: "Blog & guides" },
          { href: "/freebies", label: "Free templates" },
          { href: "/tech-news", label: "Tech news" },
          { href: "/#testimonials", label: "Client voices" },
        ],
      },
      {
        eyebrow: "COMPANY",
        links: [
          { href: "/about", label: "About Torq Studio" },
          { href: "/#why-us", label: "Why us" },
          { href: "/contact", label: "Contact sales" },
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms" },
        ],
      },
      {
        eyebrow: "GET STARTED",
        links: [
          { href: "/contact", label: "Book a consultation" },
          { href: "mailto:hello@torqstudio.com", label: "hello@torqstudio.com" },
          { href: "/services", label: "Service catalogue" },
        ],
      },
    ],
  };
}

function isFooterColumnArray(v: unknown): v is FooterColumn[] {
  return (
    Array.isArray(v) &&
    v.every(
      (c) =>
        c &&
        typeof c === "object" &&
        typeof (c as FooterColumn).eyebrow === "string" &&
        Array.isArray((c as FooterColumn).links),
    )
  );
}

export async function readFooterContent(): Promise<FooterContent> {
  const row = await prisma.footer.findUnique({ where: { key: FOOTER_KEY } });
  const d = getDefaultFooterContent();
  if (!row) return d;
  return {
    blurb: row.blurb || d.blurb,
    tagline: row.tagline || d.tagline,
    columns: isFooterColumnArray(row.columns) ? row.columns : d.columns,
  };
}

export async function writeFooterContent(data: FooterContent): Promise<void> {
  await prisma.footer.upsert({
    where: { key: FOOTER_KEY },
    create: {
      key: FOOTER_KEY,
      blurb: data.blurb,
      tagline: data.tagline,
      columns: data.columns,
    },
    update: {
      blurb: data.blurb,
      tagline: data.tagline,
      columns: data.columns,
    },
  });
}
