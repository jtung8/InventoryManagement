type FooterLink = {
  label: string;
  href: string;
};

type FooterProps = {
  brand: string;
  links?: FooterLink[];
  copyright?: string;
};

const Footer = ({ brand, links = [], copyright }: FooterProps) => {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-1)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-[var(--foreground)]">{brand}</p>
          <p className="text-sm text-[var(--text-muted)]">
            {copyright ?? `© ${new Date().getFullYear()} ${brand}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[var(--foreground)]">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
