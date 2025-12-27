type HeroProps = {
  title: string;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

const Hero = ({ title, subtitle, primaryCta, secondaryCta }: HeroProps) => {
  return (
    <section className="bg-[var(--surface-1)]">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between md:py-20">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-cyan)]">
            InventoryPilot
          </p>
          <h1 className="text-3xl font-bold leading-tight text-[var(--foreground)] md:text-4xl">
            {title}
          </h1>
          <p className="text-base text-[var(--text-muted)] md:text-lg">{subtitle}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {primaryCta ? (
              <a
                href={primaryCta.href}
                className="inline-flex items-center justify-center rounded-md bg-[var(--brand-blue)] px-5 py-3 text-sm font-medium text-white shadow hover:bg-blue-500"
              >
                {primaryCta.label}
              </a>
            ) : null}

            {secondaryCta ? (
              <a
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-md border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--foreground)] hover:border-[var(--surface-3)]"
              >
                {secondaryCta.label}
              </a>
            ) : null}
          </div>
        </div>

        <div className="hidden h-48 w-full max-w-sm rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] md:block" />
      </div>
    </section>
  );
};

export default Hero;
