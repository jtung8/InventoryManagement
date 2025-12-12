import Navbar from "@/components/landing/Navbar";

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
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar brand="InventoryPilot" navItems={navItems} ctaLabel="Sign In" ctaHref="#" />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">
          Landing page scaffold
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Next small step: add <code className="rounded bg-slate-100 px-1">Hero</code> beneath the navbar.
        </p>
      </main>
    </div>
  );
}
