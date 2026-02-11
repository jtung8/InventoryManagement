"use client";

import Link from "next/link";

type NavLink = { label: string; href: string };

const defaultNav: NavLink[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Imports", href: "/imports" },
];

/**
 * ForeStock.ai brand wordmark (inline SVG-like rendering using styled text).
 * Matches the reference: bar-chart icon + "fore" (white) + "stock" (teal pill) + ".ai"
 */
function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-1.5 focus-ring" aria-label="ForeStock.ai home">
      {/* Mini bar-chart icon */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="14" width="4" height="8" rx="1" fill="var(--accent)" opacity="0.5" />
        <rect x="10" y="8" width="4" height="14" rx="1" fill="var(--accent)" opacity="0.75" />
        <rect x="17" y="3" width="4" height="19" rx="1" fill="var(--accent)" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">
        <span className="text-[var(--text)]">fore</span>
        <span
          className="inline-flex items-center ml-0.5 px-1.5 py-0.5 rounded-md text-[var(--bg)] font-bold"
          style={{ background: "var(--accent)" }}
        >
          stock
        </span>
        <span className="text-[var(--muted)] font-normal text-sm ml-0.5">.ai</span>
      </span>
    </Link>
  );
}

export default function SiteHeader({
  nav = defaultNav,
  ctaLabel = "Try the demo",
  ctaHref = "/imports",
}: {
  nav?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Wordmark />

        <nav className="hidden items-center gap-6 text-sm text-[var(--muted)] md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-[var(--text)] focus-ring"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href={ctaHref}
          className="btn-accent inline-flex items-center px-4 py-2 text-sm"
        >
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}

export { Wordmark };
