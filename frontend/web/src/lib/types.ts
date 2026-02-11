/**
 * Shared TypeScript types for InventoryPilot frontend.
 *
 * These types define the contracts between:
 * - Frontend components (dashboard, imports)
 * - Backend API responses
 * - localStorage persistence layer
 */

// ---------------------------------------------------------------------------
// Core domain types
// ---------------------------------------------------------------------------

/** Product as displayed in the dashboard at-risk table. */
export interface Product {
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

// ---------------------------------------------------------------------------
// Dashboard types
// ---------------------------------------------------------------------------

/** Metric card values shown at top of dashboard. */
export interface DashboardMetrics {
  totalSkus: number;
  atRiskSkus: number;
  reorderCost: number;
  potentialRevenue: number;
}

/** GET /api/v1/dashboard/summary response shape. */
export interface DashboardSummary {
  metrics: DashboardMetrics;
  products: Product[];
}

// ---------------------------------------------------------------------------
// Recommendation types
// ---------------------------------------------------------------------------

export interface Recommendation {
  id: string;
  productId: string;
  sku: string;
  name: string;
  avgWeeklyDemand: number;
  leadTimeDemand: number;
  safetyStock: number;
  reorderPoint: number;
  recommendedOrderQty: number;
  daysLeft: number;
  unitCost: number;
  explanation: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Import types
// ---------------------------------------------------------------------------

export interface RejectedRow {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
}

export interface ImportResult {
  csvType: string;
  detectedColumns: string[];
  requiredColumns: string[];
  optionalColumnsFound: string[];
  totalRows: number;
  acceptedCount: number;
  rejectedCount: number;
  warnings: string[];
  acceptedPreview: Record<string, string>[];
  rejectedRows: RejectedRow[];
}

// ---------------------------------------------------------------------------
// Forecast types
// ---------------------------------------------------------------------------

export interface ForecastRun {
  id: string;
  startedAt: string;
  completedAt: string | null;
  status: string;
  method: string;
  rowsProcessed: number;
  errorMessage: string | null;
}

export interface ForecastTriggerResponse {
  status: string;
  message: string;
}

// ---------------------------------------------------------------------------
// localStorage persistence types
// ---------------------------------------------------------------------------

/** Shape of the payload saved to localStorage by the imports page. */
export interface UploadedData {
  schemaVersion: number;
  source: string;
  filename: string;
  savedAt: string;
  headers: string[];
  rows: string[][];
  totalRows: number;
}

// ---------------------------------------------------------------------------
// API client types
// ---------------------------------------------------------------------------

/** Discriminated union for API call results. */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
