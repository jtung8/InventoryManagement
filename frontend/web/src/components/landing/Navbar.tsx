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
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          {brand}
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-700 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-slate-900">
              {item.label}
            </Link>
          ))}
        </nav>

        {ctaLabel && ctaHref ? (
          <Link
            href={ctaHref}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </div>
    </header>
  );
};

export default Navbar;
