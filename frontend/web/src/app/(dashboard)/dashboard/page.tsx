"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";

// Shape of localStorage payload from imports page
interface UploadedData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  filename: string;
  savedAt: string;
}

// Safe JSON parse helper - returns null on failure
function safeParseJSON<T>(json: string | null): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// Product shape used by the table
interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  available: number;
  daysUntilStockout: number;
  leadTimeDays: number;
  recommendedQty: number;
  unitCost: number;
}

// Column name aliases (case-insensitive matching)
const COLUMN_ALIASES: Record<string, string[]> = {
  sku: ["sku"],
  name: ["name", "product", "product_name", "title"],
  category: ["category", "type"],
  available: ["available", "on_hand", "stock", "qty_available"],
  unitCost: ["unit_cost", "cost", "unitcost"],
};

// Build a map of field name -> column index from headers
function buildColumnIndexMap(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      const index = normalizedHeaders.indexOf(alias);
      if (index !== -1) {
        map[field] = index;
        break;
      }
    }
  }
  return map;
}

// Transform uploaded CSV rows into Product objects
function transformUploadedData(data: UploadedData): Product[] {
  const colMap = buildColumnIndexMap(data.headers);

  return data.rows.map((row, index) => {
    const getValue = (field: string): string => {
      const colIndex = colMap[field];
      return colIndex !== undefined ? (row[colIndex] ?? "").trim() : "";
    };

    const sku = getValue("sku") || `ROW-${index + 1}`;
    const name = getValue("name") || sku;
    const category = getValue("category") || "Uncategorized";
    const available = parseInt(getValue("available"), 10) || 0;
    const unitCost = parseFloat(getValue("unitCost")) || 0;

    // Placeholder heuristics for computed fields (will be replaced by forecasting)
    const daysUntilStockout = available <= 5 ? 3 : 7;
    const leadTimeDays = 14;
    const recommendedQty = Math.max(0, 50 - available);

    return {
      id: sku || `row-${index}`,
      sku,
      name,
      category,
      available,
      daysUntilStockout,
      leadTimeDays,
      recommendedQty,
      unitCost,
    };
  });
}

// Mock data - will be replaced with API calls in Phase 1
// Fashion/apparel inventory focused
const mockAtRiskProducts = [
  {
    id: "1",
    sku: "TEE-BLK-M",
    name: "Essential Cotton Tee - Black",
    category: "Tops",
    available: 12,
    daysUntilStockout: 3,
    leadTimeDays: 14,
    recommendedQty: 150,
    unitCost: 8.5,
  },
  {
    id: "2",
    sku: "JNS-IND-32",
    name: "Slim Fit Jeans - Indigo",
    category: "Bottoms",
    available: 8,
    daysUntilStockout: 2,
    leadTimeDays: 21,
    recommendedQty: 75,
    unitCost: 24.0,
  },
  {
    id: "3",
    sku: "HDY-GRY-L",
    name: "Oversized Hoodie - Heather Grey",
    category: "Outerwear",
    available: 5,
    daysUntilStockout: 4,
    leadTimeDays: 18,
    recommendedQty: 100,
    unitCost: 18.75,
  },
  {
    id: "4",
    sku: "DRS-FLR-S",
    name: "Floral Midi Dress",
    category: "Dresses",
    available: 3,
    daysUntilStockout: 1,
    leadTimeDays: 28,
    recommendedQty: 60,
    unitCost: 32.0,
  },
  {
    id: "5",
    sku: "SNK-WHT-10",
    name: "Canvas Sneakers - White",
    category: "Footwear",
    available: 18,
    daysUntilStockout: 5,
    leadTimeDays: 30,
    recommendedQty: 80,
    unitCost: 28.5,
  },
  {
    id: "6",
    sku: "BAG-CAN-TN",
    name: "Canvas Tote Bag - Tan",
    category: "Accessories",
    available: 25,
    daysUntilStockout: 6,
    leadTimeDays: 14,
    recommendedQty: 120,
    unitCost: 12.0,
  },
];


export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  // Read uploaded data from localStorage (lazy initializer runs once on mount)
  const [uploadedData] = useState<UploadedData | null>(() => {
    if (typeof window === "undefined") return null; // SSR guard
    const raw = localStorage.getItem("inventorypilot:uploadedRows");
    return safeParseJSON<UploadedData>(raw);
  });

  // Derived: whether we have uploaded data
  const hasUploadedData = uploadedData !== null;

  // Transform uploaded data into Product objects, or use mock data
  const activeProducts: Product[] = useMemo(() => {
    if (uploadedData) {
      return transformUploadedData(uploadedData);
    }
    return mockAtRiskProducts;
  }, [uploadedData]);

  // Compute metrics from active data source
  const metrics = useMemo(() => {
    const totalSkus = uploadedData ? uploadedData.totalRows : 847;
    const atRiskSkus = activeProducts.length;
    const reorderCost = activeProducts.reduce(
      (sum, p) => sum + p.recommendedQty * p.unitCost,
      0
    );
    const potentialRevenue = activeProducts.reduce(
      (sum, p) => sum + p.recommendedQty * p.unitCost * 2.5, // ~2.5x markup for retail
      0
    );
    return { totalSkus, atRiskSkus, reorderCost, potentialRevenue };
  }, [uploadedData, activeProducts]);

  // Derive unique categories from data (sorted)
  const categories = useMemo(() => {
    const unique = Array.from(new Set(activeProducts.map((p) => p.category)));
    unique.sort();
    return ["all", ...unique];
  }, [activeProducts]);

  // Filter products based on search + category
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return activeProducts.filter((product) => {
      const matchesSearch =
        q.length === 0 ||
        product.sku.toLowerCase().includes(q) ||
        product.name.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter, activeProducts]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader ctaLabel="Import CSV" ctaHref="/imports" />

      <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-sm text-[var(--muted)]">
          Inventory health and cashflow at a glance
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-[var(--muted)]">
            Data source: {hasUploadedData ? "Uploaded CSV" : "Demo data"}
          </span>
          {hasUploadedData && (
            <Link
              href="/imports"
              className="text-xs text-[var(--accent)] hover:text-[var(--accentHover)] transition-colors"
            >
              Change CSV
            </Link>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Total SKUs"
          value={metrics.totalSkus.toLocaleString()}
          subtitle="Products tracked"
        />
        <MetricCard
          title="At Risk"
          value={metrics.atRiskSkus.toString()}
          subtitle="Stockout warning"
          variant="warning"
        />
        <MetricCard
          title="Potential Revenue"
          value={`$${metrics.potentialRevenue.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          subtitle="If reorder fulfilled"
        />
        <MetricCard
          title="Reorder Cost"
          value={`$${metrics.reorderCost.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          subtitle="To replenish stock"
        />
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by SKU or name..."
          className="w-full sm:max-w-md rounded-[var(--radius-btn)] bg-[var(--surface)] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] outline-none focus:border-[var(--accent)] transition-colors"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 rounded-[var(--radius-btn)] bg-[var(--surface)] border border-[var(--border)] px-4 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "All Categories" : cat}
            </option>
          ))}
        </select>
      </div>

      {/* At-Risk Products Table */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">At-Risk Products</h2>
          <span className="text-sm text-[var(--muted)]">
            {filteredProducts.length} products
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="pb-3 font-medium">SKU</th>
                <th className="pb-3 font-medium">Product Name</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-right">Available</th>
                <th className="pb-3 font-medium text-right">Stockout</th>
                <th className="pb-3 font-medium text-right">Lead Time</th>
                <th className="pb-3 font-medium text-right">Reorder Qty</th>
                <th className="pb-3 font-medium text-right">Reorder Cost</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--surface2)]/50 transition-colors"
                >
                  <td className="py-3 font-mono text-[var(--accent)]">{product.sku}</td>
                  <td className="py-3">{product.name}</td>
                  <td className="py-3 text-[var(--muted)]">{product.category}</td>
                  <td className="py-3 text-right">{product.available}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        product.daysUntilStockout <= 2
                          ? "bg-[var(--brand-red)]/15 text-[var(--brand-red)]"
                          : product.daysUntilStockout <= 4
                          ? "bg-[var(--brand-yellow)]/15 text-[var(--brand-yellow)]"
                          : "bg-[var(--brand-green)]/15 text-[var(--brand-green)]"
                      }`}
                    >
                      {product.daysUntilStockout}d
                    </span>
                  </td>
                  <td className="py-3 text-right text-[var(--muted)]">
                    {product.leadTimeDays}d
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {product.recommendedQty}
                  </td>
                  <td className="py-3 text-right font-semibold text-[var(--accent)]">
                    $
                    {(product.recommendedQty * product.unitCost).toLocaleString(
                      "en-US",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredProducts.length === 0 && (
          <p className="mt-4 text-center text-sm text-[var(--muted)]">
            No products match your search or filter.
          </p>
        )}
      </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  subtitle,
  variant = "default",
}: {
  title: string;
  value: string;
  subtitle: string;
  variant?: "default" | "warning";
}) {
  return (
    <div className="glass p-5">
      <p className="text-[var(--muted)] text-xs mb-1">{title}</p>
      <p
        className={`text-2xl font-bold mb-1 ${
          variant === "warning" ? "text-[var(--brand-yellow)]" : "text-[var(--text)]"
        }`}
      >
        {value}
      </p>
      <p className="text-[var(--muted)] text-xs">{subtitle}</p>
    </div>
  );
}
