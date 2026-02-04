import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

type NavItem = {
  label: string;
  href: string;
};
// Trigger CI smoke run
const navItems: NavItem[] = [
  { label: "Product", href: "#product" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "#docs" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar brand="InventoryPilot" navItems={navItems} ctaLabel="Upload CSV" ctaHref="/imports" />

      <main>
        {/* Hero */}
        <section className="px-6 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-cyan)]">
              Inventory clarity in seconds
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--foreground)] md:text-5xl">
              Upload a CSV. See what&apos;s at risk.
            </h1>
            <p className="mt-4 text-lg text-[var(--text-muted)]">
              Stop guessing which SKUs need attention. Upload your inventory
              snapshot and get a clear dashboard of at-risk products and reorder
              suggestions.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/imports"
                className="inline-flex items-center rounded-md bg-[var(--brand-blue)] px-6 py-3 text-sm font-medium text-white shadow hover:bg-blue-500 transition-colors"
              >
                Upload CSV
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center rounded-md border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] hover:border-[var(--text-muted)] transition-colors"
              >
                View Demo Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="border-t border-[var(--border)] bg-[var(--surface-1)] px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold text-[var(--foreground)]">
              How it works
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {/* Step 1 */}
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-cyan)] text-lg font-bold text-[var(--background)]">
                  1
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                  Upload your CSV
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Drag and drop an inventory snapshot. We parse it instantly.
                </p>
              </div>
              {/* Step 2 */}
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-cyan)] text-lg font-bold text-[var(--background)]">
                  2
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                  Preview your data
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Review parsed rows before saving. Fix issues early.
                </p>
              </div>
              {/* Step 3 */}
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-cyan)] text-lg font-bold text-[var(--background)]">
                  3
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[var(--foreground)]">
                  See your dashboard
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  At-risk SKUs, reorder suggestions, and key metrics — all in one view.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer brand="InventoryPilot" />
    </div>
  );
}
