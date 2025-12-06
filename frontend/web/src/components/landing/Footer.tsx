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
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-base font-semibold text-slate-900">{brand}</p>
          <p className="text-sm text-slate-500">{copyright ?? `© ${new Date().getFullYear()} ${brand}`}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-slate-900">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
