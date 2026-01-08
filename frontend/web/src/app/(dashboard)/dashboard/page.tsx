"use client";

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

// Dashboard metrics - cashflow focused
const metrics = {
  totalSkus: 847, // placeholder until API
  atRiskSkus: mockAtRiskProducts.length,
  potentialRevenue: mockAtRiskProducts.reduce(
    (sum, p) => sum + p.recommendedQty * p.unitCost * 2.5, // ~2.5x markup for retail
    0
  ),
  reorderCost: mockAtRiskProducts.reduce(
    (sum, p) => sum + p.recommendedQty * p.unitCost,
    0
  ),
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-[#F8FAFC] p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-[#94A3B8]">
          Inventory health and cashflow at a glance
        </p>
      </div>

      {/* Metrics Cards - Cashflow Focused */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* At-Risk Products Table */}
      <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">At-Risk Products</h2>
          <span className="text-sm text-[#94A3B8]">
            {mockAtRiskProducts.length} products need reordering
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155] text-left text-[#94A3B8] text-sm">
                <th className="pb-4 font-medium">SKU</th>
                <th className="pb-4 font-medium">Product Name</th>
                <th className="pb-4 font-medium">Category</th>
                <th className="pb-4 font-medium text-right">Available</th>
                <th className="pb-4 font-medium text-right">Stockout</th>
                <th className="pb-4 font-medium text-right">Lead Time</th>
                <th className="pb-4 font-medium text-right">Reorder Qty</th>
                <th className="pb-4 font-medium text-right">Reorder Cost</th>
              </tr>
            </thead>
            <tbody>
              {mockAtRiskProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-[#334155] hover:bg-[#334155]/50 transition-colors"
                >
                  <td className="py-4 font-mono text-[#06B6D4]">{product.sku}</td>
                  <td className="py-4">{product.name}</td>
                  <td className="py-4 text-[#94A3B8]">{product.category}</td>
                  <td className="py-4 text-right">{product.available}</td>
                  <td className="py-4 text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.daysUntilStockout <= 2
                          ? "bg-[#EF4444]/20 text-[#EF4444]"
                          : product.daysUntilStockout <= 4
                          ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                          : "bg-[#10B981]/20 text-[#10B981]"
                      }`}
                    >
                      {product.daysUntilStockout}d
                    </span>
                  </td>
                  <td className="py-4 text-right text-[#94A3B8]">
                    {product.leadTimeDays}d
                  </td>
                  <td className="py-4 text-right font-semibold">
                    {product.recommendedQty}
                  </td>
                  <td className="py-4 text-right font-semibold text-[#3B82F6]">
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
    <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg">
      <p className="text-[#94A3B8] text-sm mb-1">{title}</p>
      <p
        className={`text-3xl font-bold mb-1 ${
          variant === "warning" ? "text-[#F59E0B]" : "text-[#F8FAFC]"
        }`}
      >
        {value}
      </p>
      <p className="text-[#64748B] text-sm">{subtitle}</p>
    </div>
  );
}
