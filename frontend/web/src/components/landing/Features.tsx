type FeatureItem = {
  title: string;
  description: string;
};

type FeaturesProps = {
  title: string;
  subtitle: string;
  items: FeatureItem[];
};

const Features = ({ title, subtitle, items }: FeaturesProps) => {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="mb-10 max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Features</p>
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">{title}</h2>
          <p className="text-base text-slate-600">{subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
