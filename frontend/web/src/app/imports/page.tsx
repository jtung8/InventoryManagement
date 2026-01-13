"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";

const PREVIEW_OPTIONS = [10, 25, 50] as const;

export default function ImportsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<string[][]>([]);
  const [previewLimit, setPreviewLimit] = useState(10);
  const [error, setError] = useState<string | null>(null);

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

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
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

      setHeaders(data[0]);
      setAllRows(data.slice(1));
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
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

        {/* Selected file display */}
        {selectedFile && (
          <div className="mt-4 p-3 bg-[#334155]/50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-[#F8FAFC]">{selectedFile.name}</span>
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
      </div>
    </div>
  );
}
