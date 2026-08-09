import Link from "next/link";
import type { HomeContent } from "@/lib/home-content";

/**
 * Hero band (DESIGN.md → hero-band-dark).
 * 50/50 split: sentence-case display headline + CTA cluster on the left,
 * brand gradient ribbon on the right. The ribbon is the brand's single piece
 * of decorative chrome — built with layered translucent stripes, no SVG asset.
 */

export type HeroProps = Pick<
  HomeContent,
  | "heroEyebrow"
  | "heroHeading"
  | "heroSubheading"
  | "heroPrimaryCtaLabel"
  | "heroPrimaryCtaHref"
  | "heroSecondaryCtaLabel"
  | "heroSecondaryCtaHref"
  | "heroTertiaryCtaLabel"
  | "heroTertiaryCtaHref"
  | "heroTags"
>;

export default function Hero({
  heroEyebrow,
  heroHeading,
  heroSubheading,
  heroPrimaryCtaLabel,
  heroPrimaryCtaHref,
  heroSecondaryCtaLabel,
  heroSecondaryCtaHref,
  heroTertiaryCtaLabel,
  heroTertiaryCtaHref,
  heroTags,
}: HeroProps) {
  return (
    <section className="hero-band relative">
      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 px-4 pt-32 pb-24 sm:px-6 sm:pt-36 sm:pb-28 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:pt-40 lg:pb-32">
        <div className="lg:col-span-7">
          <p className="mono-eyebrow animate-fade-up text-white/65 opacity-0 animate-delay-1">
            {heroEyebrow}
          </p>
          <h1 className="display-xxl animate-fade-up mt-5 max-w-[16ch] text-white opacity-0 animate-delay-2">
            {heroHeading}
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-[17px] leading-[1.5] tracking-[-0.01em] text-white/70 opacity-0 animate-delay-3">
            {heroSubheading}
          </p>

          <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-3 opacity-0 animate-delay-4">
            <Link href={heroPrimaryCtaHref} className="btn-base btn-white">
              {heroPrimaryCtaLabel}
            </Link>
            <Link href={heroSecondaryCtaHref} className="btn-base btn-mint">
              {heroSecondaryCtaLabel}
            </Link>
            <Link href={heroTertiaryCtaHref} className="btn-base btn-ghost-on-dark">
              {heroTertiaryCtaLabel}
            </Link>
          </div>

          <ul className="animate-fade-up mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 opacity-0 animate-delay-5">
            {heroTags.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[13px] text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-mint)]" aria-hidden />
                <span className="font-medium tracking-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-5">
          <div className="animate-scale-in opacity-0 animate-delay-2">
            <div className="brand-ribbon animate-ribbon">
              <div className="ribbon-inner" aria-hidden />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-6 text-[12px] text-white/50">
              <span className="mono-eyebrow">SHIP · OPERATE · ADVISE</span>
              <span className="hidden sm:inline">India · MENA · EU overlap</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
