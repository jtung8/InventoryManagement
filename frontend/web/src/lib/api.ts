/**
 * Typed API client for InventoryPilot backend.
 *
 * All functions return ApiResult<T> - a discriminated union that forces
 * callers to handle both success and failure cases. On network failure
 * or non-2xx response, returns { ok: false, error: string } instead of
 * throwing, so the UI can gracefully fall back to local data.
 */

import type {
  ApiResult,
  DashboardSummary,
  Product,
  Recommendation,
  ImportResult,
  ForecastRun,
  ForecastTriggerResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const TIMEOUT_MS = 10_000;

// ---------------------------------------------------------------------------
// Core fetch helpers
// ---------------------------------------------------------------------------

async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `${res.status}: ${body || res.statusText}` };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: "Request timed out" };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown network error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function apiPost<T>(
  path: string,
  body: unknown,
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `${res.status}: ${text || res.statusText}` };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: "Request timed out" };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown network error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function apiPostFile<T>(
  path: string,
  file: File,
): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `${res.status}: ${text || res.statusText}` };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: false, error: "Request timed out" };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown network error",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ---------------------------------------------------------------------------
// Convenience functions (typed wrappers around the core helpers)
// ---------------------------------------------------------------------------

export function fetchDashboardSummary(): Promise<ApiResult<DashboardSummary>> {
  return apiGet<DashboardSummary>("/api/v1/dashboard/summary");
}

export function fetchProducts(): Promise<ApiResult<Product[]>> {
  return apiGet<Product[]>("/api/v1/products");
}

export function fetchRecommendations(
  atRisk?: boolean,
): Promise<ApiResult<Recommendation[]>> {
  const params = atRisk !== undefined ? `?at_risk=${atRisk}` : "";
  return apiGet<Recommendation[]>(`/api/v1/recommendations${params}`);
}

export function uploadCsvFile(file: File): Promise<ApiResult<ImportResult>> {
  return apiPostFile<ImportResult>("/api/v1/imports/upload", file);
}

export function triggerForecast(): Promise<
  ApiResult<ForecastTriggerResponse>
> {
  return apiPost<ForecastTriggerResponse>("/api/v1/forecasts/trigger", {});
}

export function fetchLatestForecastRun(): Promise<ApiResult<ForecastRun>> {
  return apiGet<ForecastRun>("/api/v1/forecasts/runs/latest");
}
