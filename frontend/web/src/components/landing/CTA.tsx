type CTAProps = {
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
};

const CTA = ({ title, description, primaryCta }: CTAProps) => {
  return (
    <section className="bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 px-6 py-10 text-left shadow-sm md:flex-row md:items-center">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <p className="text-base text-slate-600">{description}</p>
        </div>
        <a
          href={primaryCta.href}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow hover:bg-blue-700"
        >
          {primaryCta.label}
        </a>
      </div>
    </section>
  );
};

export default CTA;
