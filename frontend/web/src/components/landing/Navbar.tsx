import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
};

type NavbarProps = {
  brand: string;
  navItems?: NavItem[];
  ctaLabel?: string;
  ctaHref?: string;
};

const Navbar = ({ brand, navItems = [], ctaLabel, ctaHref }: NavbarProps) => {
  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--surface-1)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-[var(--foreground)]">
          {brand}
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--text-muted)] md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[var(--foreground)]">
              {item.label}
            </Link>
          ))}
        </nav>

        {ctaLabel && ctaHref ? (
          <Link
            href={ctaHref}
            className="inline-flex items-center rounded-md bg-[var(--brand-blue)] px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-500"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
