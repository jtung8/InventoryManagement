"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";

const PREVIEW_OPTIONS = [10, 25, 50, 200] as const;

export default function ImportsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadIdRef = useRef(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<string[][]>([]);
  const [previewLimit, setPreviewLimit] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Derived values
  const totalRows = allRows.length;
  const effectiveLimit = Math.min(previewLimit, 200, totalRows);
  const displayRows = allRows.slice(0, effectiveLimit);

  const handleClear = () => {
    setSelectedFile(null);
    setHeaders([]);
    setAllRows([]);
    setPreviewLimit(10);
    setError(null);
    setSavedAt(null);
    setSaveError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setHeaders([]);
    setAllRows([]);
    setPreviewLimit(10);
    setError(null);
    setSavedAt(null);
    setSaveError(null);

    if (!file) return;

    // Increment load ID so stale callbacks from previous uploads are ignored
    loadIdRef.current += 1;
    const currentLoadId = loadIdRef.current;

    const reader = new FileReader();
    reader.onload = () => {
      // Ignore if a newer upload has started
      if (currentLoadId !== loadIdRef.current) return;

      const result = reader.result;
      if (typeof result !== "string") {
        setError("Failed to read file as text.");
        return;
      }

      const parsed = Papa.parse<string[]>(result, { skipEmptyLines: true });

      if (parsed.errors.length > 0) {
        setError("Failed to parse CSV: " + parsed.errors[0].message);
        return;
      }

      const data = parsed.data;
      if (data.length === 0) {
        setError("CSV file is empty.");
        return;
      }

      const parsedHeaders = data[0];
      const parsedRows = data.slice(1);

      setHeaders(parsedHeaders);
      setAllRows(parsedRows);

      // Save to localStorage with try/catch for quota limits
      const now = new Date().toISOString();
      const payload = {
        schemaVersion: 1,
        source: "imports-page",
        filename: file.name,
        savedAt: now,
        headers: parsedHeaders,
        rows: parsedRows,
        totalRows: parsedRows.length,
      };

      try {
        localStorage.setItem("inventorypilot:uploadedRows", JSON.stringify(payload));
        setSavedAt(now);
      } catch {
        setSaveError("Could not save to local storage (file may be too large).");
      }
    };
    reader.onerror = () => {
      if (currentLoadId !== loadIdRef.current) return;
      setError("Failed to read file.");
    };
    reader.readAsText(file);

    // Reset input value so the same file can be re-selected (e.g., after updating it)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-[#F8FAFC] p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Imports</h1>
        <p className="text-[#94A3B8]">
          Upload CSV files to import products, inventory, or sales data
        </p>
      </div>

      {/* Getting Started Banner */}
      <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg max-w-2xl mb-6">
        <h2 className="text-xl font-semibold mb-1">Getting Started</h2>
        <p className="text-sm text-[#94A3B8] mb-4">Import in 3 quick steps</p>

        <ol className="space-y-4">
          {/* Step 1 - MVP (active) */}
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#06B6D4] text-[#0A1628] text-sm font-bold flex items-center justify-center">
              1
            </span>
            <div>
              <p className="text-[#F8FAFC] font-medium">
                Upload an Inventory Snapshot CSV
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Recommended headers:{" "}
                <code className="bg-[#0A1628] px-1.5 py-0.5 rounded text-[#06B6D4]">
                  sku,name,category,available,unit_cost
                </code>
              </p>
            </div>
          </li>

          {/* Step 2 - Coming next */}
          <li className="flex items-start gap-3 opacity-60">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#334155] text-[#94A3B8] text-sm font-bold flex items-center justify-center">
              2
            </span>
            <div className="flex items-center gap-2">
              <p className="text-[#94A3B8] font-medium">
                Upload Sales History for forecasting
              </p>
              <span className="text-xs bg-[#334155] text-[#64748B] px-2 py-0.5 rounded-full">
                Coming next
              </span>
            </div>
          </li>

          {/* Step 3 - Coming next */}
          <li className="flex items-start gap-3 opacity-60">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#334155] text-[#94A3B8] text-sm font-bold flex items-center justify-center">
              3
            </span>
            <div className="flex items-center gap-2">
              <p className="text-[#94A3B8] font-medium">
                Review reorder recommendations on Dashboard
              </p>
              <span className="text-xs bg-[#334155] text-[#64748B] px-2 py-0.5 rounded-full">
                Coming next
              </span>
            </div>
          </li>
        </ol>
      </div>

      {/* Download Templates */}
      <div className="max-w-2xl mb-6">
        <h3 className="text-sm font-semibold text-[#94A3B8] mb-1">
          Download templates
        </h3>
        <p className="text-xs text-[#64748B] mb-2">
          Start with the Inventory Snapshot template.
        </p>
        <a
          href="/templates/inventorypilot-template-inventory-snapshot.csv"
          download
          className="inline-flex items-center gap-1.5 text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Inventory Snapshot CSV template
        </a>
      </div>

      {/* Upload Card */}
      <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Upload CSV</h2>

        <label
          htmlFor="csv-upload"
          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#334155] rounded-lg cursor-pointer hover:border-[#06B6D4] transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-3 text-[#94A3B8]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-[#94A3B8]">
              <span className="font-semibold text-[#06B6D4]">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-[#64748B]">CSV files only</p>
          </div>
          <input
            ref={fileInputRef}
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {/* Helper note */}
        <p className="mt-3 text-xs text-[#64748B]">
          Recommended for MVP: upload an Inventory Snapshot CSV with headers like{" "}
          <code className="bg-[#0A1628] px-1.5 py-0.5 rounded text-[#06B6D4] font-mono">
            sku,name,category,available,unit_cost
          </code>
        </p>

        {/* Selected file display */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-[#334155]/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#F8FAFC]">{selectedFile.name}</span>
              {savedAt && (
                <span className="text-xs text-[#10B981]">
                  Saved at {new Date(savedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94A3B8]">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
              <button
                onClick={handleClear}
                className="text-xs text-[#EF4444] hover:text-[#F87171] transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Save error warning */}
        {saveError && (
          <p className="mt-2 text-sm text-[#F59E0B]">{saveError}</p>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-4 text-sm text-[#EF4444]">{error}</p>
        )}

        {/* Empty state - no file selected */}
        {!selectedFile && !error && (
          <p className="mt-4 text-sm text-[#94A3B8] text-center">
            Upload a CSV to preview rows.
          </p>
        )}

        {/* CSV table preview */}
        {headers.length > 0 && (
          <div className="mt-4">
            {/* Preview controls */}
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <label htmlFor="preview-limit" className="text-sm text-[#94A3B8]">
                  Rows to preview
                </label>
                <select
                  id="preview-limit"
                  value={previewLimit}
                  onChange={(e) => setPreviewLimit(Number(e.target.value))}
                  className="rounded bg-[#0A1628] border border-[#334155] px-2 py-1 text-xs text-[#F8FAFC] outline-none focus:border-[#06B6D4]"
                >
                  {PREVIEW_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} disabled={totalRows < opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-[#64748B]">
                Showing {effectiveLimit} of {totalRows} rows
                {totalRows > 200 && " (Preview capped at 200 rows)"}
              </p>
            </div>

            {/* No data rows state */}
            {totalRows === 0 ? (
              <p className="text-sm text-[#94A3B8] text-center py-4">
                No data rows found.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[#334155]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0A1628]">
                      {headers.map((header, i) => (
                        <th
                          key={i}
                          className="px-3 py-2 text-left text-[#94A3B8] font-medium whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-t border-[#334155] hover:bg-[#334155]/30"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 text-[#F8FAFC] max-w-[200px] truncate"
                            title={cell}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Go to Dashboard link */}
        {savedAt && (
          <Link
            href="/dashboard"
            className="mt-4 inline-flex items-center gap-1 text-sm text-[#06B6D4] hover:text-[#22D3EE] transition-colors"
          >
            Go to Dashboard
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
