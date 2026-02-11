"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";

/* ──────────────────────────────────────────────
   Scroll-reveal hook (IntersectionObserver)
   ────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      el.classList.add("visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function RevealSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useReveal();
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   FAQ Accordion
   ────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "What data do I need to get started?",
    a: "Just a CSV with columns like sku, name, category, available quantity, and unit cost. We auto-detect your columns and handle the rest.",
  },
  {
    q: "How does the forecasting work?",
    a: "We use a moving-average model that looks at your recent sales history to predict demand. It factors in lead times and safety stock to recommend exactly what to reorder and when.",
  },
  {
    q: "Do I need to connect my Shopify / Amazon / POS?",
    a: "Not yet. Right now you upload CSVs. Native integrations with Shopify, Amazon, Square, and WooCommerce are on the roadmap.",
  },
  {
    q: "Is my data secure?",
    a: "Your data stays in your browser during the demo. When you connect to our cloud, all data is encrypted at rest and in transit via AWS infrastructure.",
  },
  {
    q: "What does 'at risk' mean?",
    a: "A product is at risk when its current stock is projected to run out before the next reorder can arrive, based on average demand and supplier lead time.",
  },
  {
    q: "Can I export my reorder plan?",
    a: "Yes. The dashboard has an export button that generates a CSV with SKU, recommended quantity, unit cost, and reorder cost — ready to send to your supplier.",
  },
  {
    q: "Is there a free tier?",
    a: "The local demo is completely free. Cloud plans with historical forecasting, team access, and integrations will launch soon.",
  },
];

function Accordion({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[var(--border)]">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left text-[var(--text)] focus-ring"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-medium pr-4">{item.q}</span>
              <svg
                className={`w-4 h-4 flex-shrink-0 text-[var(--muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-200"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="pb-5 text-sm text-[var(--muted)] leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Mock dashboard preview data
   ────────────────────────────────────────────── */
const previewMetrics = [
  { label: "Total SKUs", value: "847", accent: false },
  { label: "At Risk", value: "6", accent: true },
  { label: "Reorder Cost", value: "$8,240", accent: false },
  { label: "Revenue at Risk", value: "$20,600", accent: false },
];

const previewRows = [
  { sku: "TEE-BLK-M", name: "Essential Cotton Tee", stock: 12, days: "3d", risk: "high" },
  { sku: "JNS-IND-32", name: "Slim Fit Jeans - Indigo", stock: 8, days: "2d", risk: "high" },
  { sku: "HDY-GRY-L", name: "Oversized Hoodie", stock: 5, days: "4d", risk: "medium" },
  { sku: "DRS-FLR-S", name: "Floral Midi Dress", stock: 3, days: "1d", risk: "high" },
];

const integrations = [
  "Shopify",
  "Amazon",
  "Square",
  "WooCommerce",
  "QuickBooks",
  "CSV Upload",
];

/* ──────────────────────────────────────────────
   Page
   ────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader />

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          {/* Subtle radial glow behind hero */}
          <div
            className="pointer-events-none absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)" }}
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)] mb-4">
              Inventory intelligence
            </p>
            <h1 className="text-4xl font-bold tracking-tight leading-[1.15] md:text-5xl lg:text-6xl">
              Avoid stockouts
              <br />
              <span className="text-[var(--accent)]">before they happen.</span>
            </h1>
            <p className="mt-6 text-lg text-[var(--muted)] max-w-xl mx-auto leading-relaxed">
              Upload your inventory CSV. Get a clear view of at-risk products,
              lead-time-aware reorder quantities, and the cash impact — so you
              know what to order, when, and what it costs.
            </p>

            {/* Email capture (frontend-only) */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <input
                type="email"
                placeholder="you@company.com"
                aria-label="Email address"
                className="w-full sm:w-72 rounded-[var(--radius-btn)] bg-[var(--surface)] border border-[var(--border)] px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)] transition-colors"
              />
              <Link
                href="/imports"
                className="btn-accent inline-flex items-center px-6 py-3 text-sm whitespace-nowrap"
              >
                Try the demo
              </Link>
            </form>
            <div className="mt-3 flex items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="btn-secondary inline-flex items-center px-5 py-2.5 text-sm"
              >
                See dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* ── Dashboard Preview ── */}
        <RevealSection>
          <section className="px-6 pb-20">
            <div className="mx-auto max-w-5xl">
              <div className="glass p-6 md:p-8">
                {/* Metric cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {previewMetrics.map((m) => (
                    <div key={m.label} className="rounded-xl bg-[var(--surface2)] p-4">
                      <p className="text-xs text-[var(--muted)] mb-1">{m.label}</p>
                      <p className={`text-2xl font-bold ${m.accent ? "text-[var(--brand-yellow)]" : "text-[var(--text)]"}`}>
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Mini at-risk table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                        <th className="pb-3 font-medium">SKU</th>
                        <th className="pb-3 font-medium">Product</th>
                        <th className="pb-3 font-medium text-right">Stock</th>
                        <th className="pb-3 font-medium text-right">Stockout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row) => (
                        <tr key={row.sku} className="border-b border-[var(--border)]/50">
                          <td className="py-3 font-mono text-[var(--accent)]">{row.sku}</td>
                          <td className="py-3">{row.name}</td>
                          <td className="py-3 text-right">{row.stock}</td>
                          <td className="py-3 text-right">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                row.risk === "high"
                                  ? "bg-[var(--brand-red)]/15 text-[var(--brand-red)]"
                                  : "bg-[var(--brand-yellow)]/15 text-[var(--brand-yellow)]"
                              }`}
                            >
                              {row.days}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ── Integrations ── */}
        <RevealSection>
          <section className="px-6 pb-20">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)] mb-6">
                Works with your stack
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {integrations.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center px-4 py-2 rounded-full border border-[var(--border)] text-sm text-[var(--muted)] bg-[var(--surface)]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ── How It Works ── */}
        <RevealSection>
          <section className="border-t border-[var(--border)] px-6 py-20">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-center text-2xl font-bold mb-12">
                How it works
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    num: "1",
                    title: "Upload your CSV",
                    desc: "Drag and drop an inventory snapshot. We parse and validate it instantly.",
                  },
                  {
                    num: "2",
                    title: "See what's at risk",
                    desc: "The dashboard highlights SKUs running low, factoring in lead times and demand.",
                  },
                  {
                    num: "3",
                    title: "Export your reorder plan",
                    desc: "Download a ready-to-send CSV with reorder quantities and cost breakdown.",
                  },
                ].map((step) => (
                  <div key={step.num} className="text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-sm font-bold">
                      {step.num}
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </RevealSection>

        {/* ── FAQ ── */}
        <RevealSection>
          <section className="border-t border-[var(--border)] px-6 py-20">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-center text-2xl font-bold mb-10">
                Frequently asked questions
              </h2>
              <Accordion items={FAQ_ITEMS} />
            </div>
          </section>
        </RevealSection>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">ForeStock.ai</span>
            <span>|</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6 text-sm text-[var(--muted)]">
            <Link href="/imports" className="hover:text-[var(--text)] transition-colors">
              Imports
            </Link>
            <Link href="/dashboard" className="hover:text-[var(--text)] transition-colors">
              Dashboard
            </Link>
          </div>
          <p className="text-xs text-[var(--muted)]/60 text-center md:text-right max-w-xs">
            Demo product. Not financial advice. Data stays in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
