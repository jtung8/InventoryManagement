"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import SiteHeader from "@/components/ui/SiteHeader";

const PREVIEW_OPTIONS = [10, 25, 50, 200] as const;

/* ──────────────────────────────────────────────
   Stepper data
   ────────────────────────────────────────────── */
const STEPS = [
  { num: 1, label: "Upload inventory snapshot", active: true },
  { num: 2, label: "Upload sales history", active: false },
  { num: 3, label: "Review reorder suggestions", active: false },
];

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
  const [isDragOver, setIsDragOver] = useState(false);

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

  const processFile = (file: File) => {
    setSelectedFile(file);
    setHeaders([]);
    setAllRows([]);
    setPreviewLimit(10);
    setError(null);
    setSavedAt(null);
    setSaveError(null);

    // Increment load ID so stale callbacks from previous uploads are ignored
    loadIdRef.current += 1;
    const currentLoadId = loadIdRef.current;

    const reader = new FileReader();
    reader.onload = () => {
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    processFile(file);

    // Reset input value so the same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      processFile(file);
    } else if (file) {
      setError("Please upload a .csv file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <SiteHeader ctaLabel="Dashboard" ctaHref="/dashboard" />

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Import data</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Upload your Inventory Snapshot CSV to get started.
          </p>
        </div>

        {/* Stepper */}
        <div className="glass p-5 mb-6">
          <div className="flex items-center gap-6 overflow-x-auto">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex items-center gap-3 min-w-0">
                <div className="relative flex items-center gap-2">
                  <span
                    className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      step.active
                        ? "bg-[var(--accent)] text-[var(--bg)]"
                        : "bg-[var(--surface2)] text-[var(--muted)]"
                    }`}
                  >
                    {step.num}
                  </span>
                  <span
                    className={`text-sm whitespace-nowrap ${
                      step.active ? "text-[var(--text)] font-medium" : "text-[var(--muted)]"
                    }`}
                  >
                    {step.label}
                  </span>
                  {!step.active && (
                    <span className="ml-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--surface2)] text-[var(--muted)]">
                      Soon
                    </span>
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block w-8 h-px bg-[var(--border)]" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Template download */}
        <div className="flex items-center justify-between mb-6 glass p-4">
          <div>
            <p className="text-sm font-medium">Download template CSV</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Pre-formatted with the required headers
            </p>
          </div>
          <a
            href="/templates/inventorypilot-template-inventory-snapshot.csv"
            download
            className="btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>

        {/* Dropzone */}
        <div className="glass p-6 mb-6">
          <label
            htmlFor="csv-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`flex flex-col items-center justify-center w-full py-14 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              isDragOver
                ? "border-[var(--accent)] bg-[var(--accent)]/5"
                : "border-[var(--border)] hover:border-[var(--accent)]/50"
            }`}
          >
            <svg className="w-10 h-10 mb-3 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-[var(--muted)]">
              <span className="font-semibold text-[var(--accent)]">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p className="text-xs text-[var(--muted)]/60 mt-1">
              CSV only &middot; Max 5 MB
            </p>
            <input
              ref={fileInputRef}
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* Required headers hint */}
          <p className="mt-3 text-xs text-[var(--muted)]">
            Required headers:{" "}
            <code className="bg-[var(--surface2)] px-1.5 py-0.5 rounded text-[var(--accent)] font-mono text-[11px]">
              sku, name, category, available, unit_cost
            </code>
          </p>
        </div>

        {/* File status bar */}
        {selectedFile && (
          <div className="glass p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {(selectedFile.size / 1024).toFixed(1)} KB &middot; {totalRows} rows
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Status chips */}
                {savedAt && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--brand-green)]/15 text-[var(--brand-green)]">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Parsed locally
                  </span>
                )}
                <button
                  onClick={handleClear}
                  className="text-xs text-[var(--muted)] hover:text-[var(--brand-red)] transition-colors focus-ring px-2 py-1"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save error */}
        {saveError && (
          <div className="glass border-[var(--brand-yellow)]/40 p-4 mb-6">
            <p className="text-sm text-[var(--brand-yellow)]">{saveError}</p>
          </div>
        )}

        {/* Parse error */}
        {error && (
          <div className="glass border-[var(--brand-red)]/40 p-4 mb-6">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[var(--brand-red)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-[var(--brand-red)]">Import failed</p>
                <p className="text-sm text-[var(--muted)] mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!selectedFile && !error && (
          <p className="text-sm text-[var(--muted)] text-center py-4">
            Upload a CSV to preview your data.
          </p>
        )}

        {/* CSV preview table */}
        {headers.length > 0 && (
          <div className="glass p-5 mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="text-sm font-semibold">Preview</h3>
              <div className="flex items-center gap-3">
                <label htmlFor="preview-limit" className="text-xs text-[var(--muted)]">
                  Rows
                </label>
                <select
                  id="preview-limit"
                  value={previewLimit}
                  onChange={(e) => setPreviewLimit(Number(e.target.value))}
                  className="rounded-lg bg-[var(--surface2)] border border-[var(--border)] px-2 py-1 text-xs text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
                >
                  {PREVIEW_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} disabled={totalRows < opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-[var(--muted)]">
                  {effectiveLimit} of {totalRows}
                </span>
              </div>
            </div>

            {totalRows === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-4">
                No data rows found.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--surface2)]">
                      {headers.map((header, i) => (
                        <th
                          key={i}
                          className="sticky top-0 px-3 py-2.5 text-left text-xs font-medium text-[var(--muted)] whitespace-nowrap bg-[var(--surface2)]"
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
                        className="border-t border-[var(--border)] hover:bg-[var(--surface2)]/50 transition-colors"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 text-[var(--text)] max-w-[200px] truncate"
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

        {/* Next action */}
        {savedAt && (
          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="btn-accent inline-flex items-center gap-2 px-6 py-3 text-sm"
            >
              Go to dashboard
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
